/**
 * Background-job handlers for AppJobRoom (worker.ts). See
 * https://docs.deep.space/guides/background-jobs.
 *
 * `call-sheet` is M3: enqueued by src/cron.ts the moment a trip is flagged
 * overdue, entirely decoupled from the alert-email path (a background job
 * runs in a different Durable Object than the cron task that enqueued it),
 * so a slow or failed AI call can never delay or block the alert — that's
 * a hard rule from the brief. Falls back to a deterministic template built
 * only from recorded fields if the AI call fails for any reason.
 *
 * As of M4, it also reads the single cached `weather` record (if the
 * 30-minute refresh in src/cron.ts has run at least once) and includes it
 * as a plain fact — never a judgment about whether conditions are safe.
 * No weather record yet (or a fetch that's never succeeded) degrades to an
 * honest "not available" note, in both the AI and template paths.
 */

import type { Job, JobContext } from 'deepspace/worker'
import { buildCronContext, createDeepSpaceAI } from 'deepspace/worker'
import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { Env } from '../worker'
import { nowISO, formatBoardTime } from './lib/time'
import type { CallSheet, TripData, TripEventData, WeatherData } from './components/board/types'

const WEATHER_UNAVAILABLE_NOTE = 'Weather not available (fetch has not run yet, or has not succeeded).'

const callSheetSchema = z.object({
  script: z.string().describe('A short script a shore-watch volunteer can read aloud when calling for help.'),
  missingInfo: z.array(z.string()).describe('Specific recorded fields that are empty or would help if filled in.'),
})

export async function runJob(job: Job, ctx: JobContext, env: Env): Promise<unknown> {
  if (job.type === 'call-sheet') {
    return runCallSheetJob(job, ctx, env)
  }
  throw new Error(`Unknown job type: ${job.type}`)
}

async function runCallSheetJob(job: Job, ctx: JobContext, env: Env): Promise<{ source: CallSheet['source'] }> {
  const { tripId } = job.payload as { tripId: string }
  const cronCtx = buildCronContext(env, env.OWNER_USER_ID, `app:${env.DEEPSPACE_APP_ID}`)

  const tripRows = (await cronCtx.records.query('trips', { where: { recordId: tripId } })) as Array<{
    recordId: string
    data: TripData
  }>
  const trip = tripRows[0]
  if (!trip) throw new Error(`Trip not found: ${tripId}`)

  const events = ((await cronCtx.records.query('trip-events', { where: { tripId } })) as Array<{
    data: TripEventData
  }>)
    .map((e) => e.data)
    .sort((a, b) => a.at.localeCompare(b.at))

  const weatherRows = (await cronCtx.records.query('weather')) as Array<{ data: WeatherData }>
  const weatherText = weatherRows[0] ? formatWeatherForPrompt(weatherRows[0].data) : null

  const callSheet = await generateCallSheet(trip.data, events, weatherText, env, ctx.signal)
  await cronCtx.records.update('trips', tripId, { callSheet })
  return { source: callSheet.source }
}

function formatWeatherForPrompt(w: WeatherData): string {
  return `${Math.round(w.temp)}°F (feels like ${Math.round(w.feelsLike)}°F), ${w.description}, wind ${Math.round(w.windSpeed)} mph, near ${w.location}, as of ${formatBoardTime(w.fetchedAt)}`
}

async function generateCallSheet(
  trip: TripData,
  events: TripEventData[],
  weatherText: string | null,
  env: Env,
  signal: AbortSignal,
): Promise<CallSheet> {
  try {
    const ai = createDeepSpaceAI(env, 'anthropic') // no authToken → owner pays
    const result = await generateText({
      model: ai('claude-haiku-4-5'),
      maxOutputTokens: 500,
      output: Output.object({ schema: callSheetSchema }),
      abortSignal: AbortSignal.any([signal, AbortSignal.timeout(20_000)]),
      prompt: buildPrompt(trip, events, weatherText),
    })
    return {
      script: result.output.script,
      missingInfo: dedupeMissingInfo(result.output.missingInfo, weatherText),
      generatedAt: nowISO(),
      source: 'ai',
    }
  } catch (err) {
    console.log(`[call-sheet] AI generation failed, using template: ${err instanceof Error ? err.message : String(err)}`)
    return buildTemplateCallSheet(trip, events, weatherText)
  }
}

function buildPrompt(trip: TripData, events: TripEventData[], weatherText: string | null): string {
  const timeline = events.length
    ? events.map((e) => `- ${e.kind} at ${formatBoardTime(e.at)}${e.detail ? ` (${e.detail})` : ''}`).join('\n')
    : '(no events recorded)'

  return [
    'A shore-watch volunteer needs to call 911, the Coast Guard, or the local sheriff about an overdue boat.',
    'Write a short script they can read aloud, using ONLY the facts listed below.',
    'Never invent details and never add your own judgment about whether conditions are safe or dangerous — if weather is given below, report it as a plain fact (temperature, wind, description) and nothing more.',
    'If a fact below is "not recorded" or "not available", say so plainly in the script rather than guessing, and also add it to missingInfo.',
    'End the script with this exact sentence: "This is a demonstration project — always call 911 or the Coast Guard directly for a real emergency."',
    '',
    'Facts:',
    `- Vessel: ${trip.vesselName}`,
    `- Vessel description: ${trip.vesselDescription || 'not recorded'}`,
    `- Skipper: ${trip.skipper}`,
    `- Persons aboard: ${trip.personsAboard}`,
    `- Planned area or route: ${trip.plannedArea || 'not recorded'}`,
    `- Departed: ${formatBoardTime(trip.departedAt)}`,
    `- Expected back: ${formatBoardTime(trip.expectedReturnAt)}`,
    `- Weather: ${weatherText ?? `not available (${WEATHER_UNAVAILABLE_NOTE})`}`,
    '',
    'Event timeline:',
    timeline,
  ].join('\n')
}

function buildTemplateCallSheet(
  trip: TripData,
  events: TripEventData[],
  weatherText: string | null,
): CallSheet {
  const missingInfo: string[] = []
  if (!trip.vesselDescription) missingInfo.push('Vessel description not recorded')
  if (!trip.plannedArea) missingInfo.push('Planned area or route not recorded')

  const lastEvent = events.at(-1)

  const script = [
    `Overdue vessel report — ${trip.vesselName}`,
    `Skipper: ${trip.skipper}`,
    `Persons aboard: ${trip.personsAboard}`,
    `Vessel description: ${trip.vesselDescription || 'not recorded'}`,
    `Planned area or route: ${trip.plannedArea || 'not recorded'}`,
    `Departed: ${formatBoardTime(trip.departedAt)}`,
    `Expected back: ${formatBoardTime(trip.expectedReturnAt)}`,
    `Weather: ${weatherText ?? 'not available'}`,
    lastEvent ? `Last recorded event: ${lastEvent.kind} at ${formatBoardTime(lastEvent.at)}` : '',
    '',
    'This is a template summary (not AI-generated).',
    'This is a demonstration project — always call 911 or the Coast Guard directly for a real emergency.',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    script,
    missingInfo: dedupeMissingInfo(missingInfo, weatherText),
    generatedAt: nowISO(),
    source: 'template',
  }
}

function dedupeMissingInfo(items: string[], weatherText: string | null): string[] {
  return weatherText ? [...new Set(items)] : [...new Set([...items, WEATHER_UNAVAILABLE_NOTE])]
}
