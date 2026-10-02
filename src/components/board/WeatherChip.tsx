import { useQuery } from 'deepspace'
import { formatBoardTime } from '@/lib/time'
import type { WeatherData } from './types'

/** The single cached weather record, refreshed every 30 minutes by src/cron.ts. */
export function WeatherChip() {
  // There is at most one row in this collection — see src/cron.ts's
  // weather-refresh task, which keeps a single shared record by hand.
  const { records, status } = useQuery<WeatherData>('weather')
  const current = records[0]

  if (status === 'loading') return null
  if (!current) {
    return <p className="text-sm text-muted-foreground">Weather not fetched yet.</p>
  }

  const w = current.data
  return (
    <p className="text-sm text-muted-foreground">
      {Math.round(w.temp)}°F, {w.description} near {w.location} · wind {Math.round(w.windSpeed)} mph ·
      updated {formatBoardTime(w.fetchedAt)}
    </p>
  )
}
