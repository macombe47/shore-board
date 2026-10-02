/**
 * Scheduled tasks for AppCronRoom (worker.ts). See
 * https://docs.deep.space/guides/scheduled-jobs.
 *
 * `overdue-scan` is M2's whole job: find trips past their expected return
 * time, flag them, and alert opted-in members by email — capped two ways
 * (docs/DECISIONS.md D-016) so a flood of overdue trips (real or a bot
 * hammering the demo) can't run up the owner's bill. Flagging a trip
 * overdue (the in-app signal — red, top of board, per D-015) NEVER depends
 * on the email step succeeding or even being attempted.
 *
 * `weather-refresh` is M4: one OpenWeatherMap call every 30 minutes, cached
 * in a single shared record so visitors never each trigger an owner-billed
 * call (D-005). A failed fetch just logs and leaves the previous reading in
 * place — never throws, so it can't fail the task run or take down the
 * other task.
 */

import type { CronTask } from 'deepspace/worker'
import { buildCronContext, enqueueJob, type CronContext } from 'deepspace/worker'
import type { Env } from '../worker'
import { nowISO, formatBoardTime } from './lib/time'

export const tasks: CronTask[] = [
  { name: 'overdue-scan', intervalMinutes: 1 },
  { name: 'weather-refresh', intervalMinutes: 30 },
]

/**
 * OpenWeatherMap's `current`/`geocoding` endpoints (verified live via
 * `npx deepspace integrations invoke`) only resolve named places, not raw
 * coordinates — "Lost Creek Lake" itself returns no geocoding match (it's a
 * reservoir, not an incorporated place) and `openweathermap/current` 404s
 * ("city not found") for it directly. Trail, OR sits right on the lake
 * (confirmed via `openweathermap/geocoding`: 42.648, -122.811) and resolves.
 */
const WEATHER_LOCATION = 'Trail, OR, US'

/** Trips candidates beyond this many in one run get their email deferred to the next run. */
const FLAG_CAP_THRESHOLD = 20
/** How many alert emails one run will attempt once the backlog exceeds the threshold above. */
const PER_RUN_EMAIL_CAP = 5
/** Global per-day cap on alert emails across the whole app (D-008), keyed by UTC date. */
const DAILY_EMAIL_CAP = 25

interface TripRow {
  recordId: string
  data: {
    vesselName: string
    skipper: string
    plannedArea: string
    expectedReturnAt: string
    status: 'out' | 'overdue' | 'returned'
    alertSentAt?: string
    alertCount?: number
  }
}

interface UserRow {
  recordId: string
  data: { email: string; name?: string }
}

interface OpenWeatherCurrent {
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  wind_deg: number
  description: string
  icon: string
}

export async function runTask(name: string, env: Env): Promise<void> {
  const ctx = buildCronContext(env, env.OWNER_USER_ID, `app:${env.DEEPSPACE_APP_ID}`)

  if (name === 'overdue-scan') {
    await runOverdueScan(ctx, env)
  } else if (name === 'weather-refresh') {
    await runWeatherRefresh(ctx)
  }
}

async function runWeatherRefresh(ctx: CronContext): Promise<void> {
  try {
    const data = (await ctx.integrations.call('openweathermap/current', {
      location: WEATHER_LOCATION,
      units: 'imperial',
    })) as OpenWeatherCurrent

    const record = {
      location: WEATHER_LOCATION,
      temp: data.temp,
      feelsLike: data.feels_like,
      humidity: data.humidity,
      windSpeed: data.wind_speed,
      windDeg: data.wind_deg,
      description: data.description,
      icon: data.icon,
      fetchedAt: nowISO(),
    }

    // CronContext.records.create has no upsert-by-id overload (unlike
    // server actions' tools.create), so keep one shared row by hand:
    // query first, update if it exists, create only the first time. There
    // is only ever at most one row in this collection.
    const existing = (await ctx.records.query('weather')) as Array<{ recordId: string }>
    if (existing.length > 0) {
      await ctx.records.update('weather', existing[0].recordId, record)
    } else {
      await ctx.records.create('weather', record)
    }
  } catch (err) {
    console.log(`[weather-refresh] failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function runOverdueScan(ctx: CronContext, env: Env): Promise<void> {
  const now = Date.now()
  const at = nowISO()

  // 1. Flag every trip that's out and past due. Unconditional — never
  // gated by the email cap below.
  const outTrips = (await ctx.records.query('trips', { where: { status: 'out' } })) as TripRow[]
  const newlyOverdue = outTrips.filter((t) => new Date(t.data.expectedReturnAt).getTime() <= now)

  for (const trip of newlyOverdue) {
    await ctx.records.update('trips', trip.recordId, { status: 'overdue' })
    await ctx.records.create('trip-events', { tripId: trip.recordId, kind: 'flagged_overdue', at })
    // M3: the call sheet runs as a background job, in a different Durable
    // Object than this cron task — so a slow or failed AI call can never
    // delay the alert-email loop below, which runs in this same tick.
    await enqueueJob(env.JOB_ROOMS, `app:${env.DEEPSPACE_APP_ID}`, 'call-sheet', { tripId: trip.recordId })
  }

  // 2. Alert candidates: every overdue trip with no alert attempt yet —
  // includes trips just flagged above, and any carried over from a run
  // that hit the per-run or daily cap.
  const overdueTrips = (await ctx.records.query('trips', { where: { status: 'overdue' } })) as TripRow[]
  const alertCandidates = overdueTrips.filter((t) => !t.data.alertSentAt)
  if (alertCandidates.length === 0) return

  // 3. Two caps. D-016: when the backlog exceeds FLAG_CAP_THRESHOLD, only
  // PER_RUN_EMAIL_CAP get an email attempt this run — the rest are logged
  // and retried next run, not dropped. The daily cap is a hard ceiling on
  // top of that.
  const perRunCap = alertCandidates.length > FLAG_CAP_THRESHOLD ? PER_RUN_EMAIL_CAP : alertCandidates.length
  const dailyRemaining = DAILY_EMAIL_CAP - (await getDailyEmailCount(ctx))
  const budget = Math.max(0, Math.min(perRunCap, dailyRemaining))

  const toAttempt = alertCandidates.slice(0, budget)
  const toDefer = alertCandidates.slice(budget)

  for (const trip of toDefer) {
    console.log(
      `[overdue-scan] alert deferred (cap): trip=${trip.recordId} vessel=${JSON.stringify(trip.data.vesselName)}`,
    )
  }

  let emailsSentThisRun = 0
  const members =
    toAttempt.length > 0
      ? ((await ctx.records.query('users', { where: { wantsAlertEmail: 1 } })) as UserRow[])
      : []

  for (const trip of toAttempt) {
    let detail: string
    const subject = `Overdue: ${trip.data.vesselName}`
    const text = buildAlertEmailText(trip.data)

    if (members.length === 0) {
      detail = 'No opted-in recipients'
    } else {
      try {
        for (const member of members) {
          await ctx.integrations.call('email/send', {
            from: 'Shore Board <alerts@shore-board.app.space>',
            to: member.data.email,
            subject,
            text,
          })
        }
        detail = `Sent to ${members.length} recipient(s)`
        emailsSentThisRun += members.length
      } catch (err) {
        // Delivery is currently blocked platform-side (docs/FRICTION_LOG.md
        // F-002), not by our code — include what the email would have said
        // so the content is still demonstrable even though it can't land in
        // an inbox. Keep this close to the failure reason, not hidden in a
        // separate field, so the trip timeline tells the whole story inline.
        detail = `Delivery failed: ${err instanceof Error ? err.message : String(err)}\n\nWould have sent —\nSubject: ${subject}\n${text}`
      }
    }

    await ctx.records.update('trips', trip.recordId, {
      alertSentAt: at,
      alertCount: (trip.data.alertCount ?? 0) + 1,
    })
    await ctx.records.create('trip-events', { tripId: trip.recordId, kind: 'alert_sent', detail, at })
  }

  if (emailsSentThisRun > 0) await incrementDailyEmailCount(ctx, emailsSentThisRun)
}

function buildAlertEmailText(trip: TripRow['data']): string {
  return [
    `${trip.vesselName} is overdue.`,
    `Skipper: ${trip.skipper}`,
    `Planned area: ${trip.plannedArea || 'not recorded'}`,
    `Expected back: ${formatBoardTime(trip.expectedReturnAt)}`,
    '',
    'Open the board to see the full timeline and call sheet.',
    '',
    'Demonstration project. Not a substitute for a filed float plan or calling for help.',
  ].join('\n')
}

function dailyEmailCountKey(): string {
  return `alert-email-count:${new Date().toISOString().slice(0, 10)}`
}

async function getDailyEmailCount(ctx: CronContext): Promise<number> {
  const rows = (await ctx.records.query('settings', { where: { key: dailyEmailCountKey() } })) as Array<{
    recordId: string
    data: { value: string }
  }>
  return rows.length === 0 ? 0 : Number(rows[0].data.value) || 0
}

async function incrementDailyEmailCount(ctx: CronContext, by: number): Promise<void> {
  const key = dailyEmailCountKey()
  const rows = (await ctx.records.query('settings', { where: { key } })) as Array<{
    recordId: string
    data: { value: string }
  }>
  if (rows.length === 0) {
    await ctx.records.create('settings', { key, value: String(by) })
  } else {
    const current = Number(rows[0].data.value) || 0
    await ctx.records.update('settings', rows[0].recordId, { value: String(current + by) })
  }
}
