/**
 * Time handling for the board.
 *
 * Every trip record stores UTC ISO-8601 strings (`new Date().toISOString()`),
 * and the overdue cron compares them as UTC too — plain string/Date
 * comparison on `...Z` timestamps is correct with no timezone math. The
 * only place a timezone enters the picture is the UI: the departure form
 * collects an "expected return" time as a wall-clock value in the board's
 * timezone (America/Los_Angeles, per the brief) and must convert it to UTC
 * before sending it to the server, and every display reads a stored UTC
 * string back out in that same timezone.
 */

export const BOARD_TIMEZONE = 'America/Los_Angeles'

export function nowISO(): string {
  return new Date().toISOString()
}

/**
 * Offset (in minutes) of `timeZone` from UTC at `date` — e.g. -420 for
 * Pacific Daylight Time. Computed by formatting `date` into `timeZone`'s
 * wall-clock digits, then reading those same digits back as if they were
 * UTC; the difference from the original instant is the zone's offset.
 */
function offsetMinutesAt(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const wallClockAsUTC = Date.UTC(
    get('year'), get('month') - 1, get('day'),
    get('hour'), get('minute'), get('second'),
  )

  return (wallClockAsUTC - date.getTime()) / 60_000
}

/**
 * Converts a `<input type="datetime-local">` value (wall-clock digits with
 * no timezone, entered as board-local time) into a UTC ISO string for
 * storage.
 */
export function boardLocalInputToUTCISOString(value: string, timeZone = BOARD_TIMEZONE): string {
  const naiveUTC = new Date(`${value}:00.000Z`)
  const offset = offsetMinutesAt(naiveUTC, timeZone)
  return new Date(naiveUTC.getTime() - offset * 60_000).toISOString()
}

/** Formats a stored UTC ISO string for display in the board's timezone. */
export function formatBoardTime(isoUTC: string, timeZone = BOARD_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoUTC))
}

/** Short form for compact card rows — time only, board timezone. */
export function formatBoardTimeShort(isoUTC: string, timeZone = BOARD_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoUTC))
}

/** True when `isoUTC` falls on today's calendar date in the board's timezone. */
export function isToday(isoUTC: string, timeZone = BOARD_TIMEZONE): boolean {
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  return dayKey(new Date(isoUTC)) === dayKey(new Date())
}

/** A value for `<input type="datetime-local">` defaulting to "N minutes from now". */
export function defaultLocalInputValue(minutesFromNow: number, timeZone = BOARD_TIMEZONE): string {
  const target = new Date(Date.now() + minutesFromNow * 60_000)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).formatToParts(target)
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}
