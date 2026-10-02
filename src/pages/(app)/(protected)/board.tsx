/**
 * The live shore board — every trip, grouped by status, updating for every
 * signed-in viewer as soon as anyone writes. See docs/PROJECT_BRIEF.md for
 * the product framing and docs/DECISIONS.md (D-012) for why this page is
 * gated behind sign-in rather than public.
 */

import { useMemo, useState } from 'react'
import { useQuery } from 'deepspace'
import { Button, EmptyState, useToast } from '@/components/ui'
import { callAction } from '@/lib/actions'
import { APP_NAME } from '@/constants'
import { DepartureForm } from '@/components/board/DepartureForm'
import { TripCard } from '@/components/board/TripCard'
import { OnWatchNow } from '@/components/board/OnWatchNow'
import { WeatherChip } from '@/components/board/WeatherChip'
import type { TripData, TripEventData } from '@/components/board/types'

export default function BoardPage() {
  const { success, error } = useToast()
  const trips = useQuery<TripData>('trips')
  const events = useQuery<TripEventData>('trip-events')
  const [formOpen, setFormOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [quickTesting, setQuickTesting] = useState(false)

  const eventsByTrip = useMemo(() => {
    const map = new Map<string, TripEventData[]>()
    for (const ev of events.records) {
      const list = map.get(ev.data.tripId) ?? []
      list.push(ev.data)
      map.set(ev.data.tripId, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.at.localeCompare(b.at))
    return map
  }, [events.records])

  const groups = useMemo(() => {
    const overdue = trips.records.filter((t) => t.data.status === 'overdue')
    const out = trips.records.filter((t) => t.data.status === 'out')
    const returnedToday = trips.records.filter((t) => t.data.status === 'returned')
    overdue.sort((a, b) => a.data.expectedReturnAt.localeCompare(b.data.expectedReturnAt))
    out.sort((a, b) => a.data.expectedReturnAt.localeCompare(b.data.expectedReturnAt))
    returnedToday.sort((a, b) => (b.data.checkedInAt ?? '').localeCompare(a.data.checkedInAt ?? ''))
    return { overdue, out, returnedToday }
  }, [trips.records])

  async function handleAddSampleFleet() {
    setSeeding(true)
    try {
      const result = await callAction('createSampleFleet')
      if (!result.success) error('Could not add sample fleet', result.error)
      else success('Sample fleet added', 'Three sample boats are now on the board.')
    } finally {
      setSeeding(false)
    }
  }

  async function handleQuickTestTrip() {
    setQuickTesting(true)
    try {
      const result = await callAction('createQuickTestTrip')
      if (!result.success) error('Could not create test trip', result.error)
      else success('Quick test trip added', 'Due back in 2 minutes.')
    } finally {
      setQuickTesting(false)
    }
  }

  return (
    <div data-testid="board-page" className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
        Demonstration project. Not a substitute for a filed float plan or calling for help.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Who&apos;s out, who&apos;s overdue, and who&apos;s back.
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <WeatherChip />
            <OnWatchNow />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="add-sample-fleet-button" variant="outline" onClick={handleAddSampleFleet} loading={seeding}>
            Add sample fleet
          </Button>
          <Button data-testid="quick-test-trip-button" variant="outline" onClick={handleQuickTestTrip} loading={quickTesting}>
            Quick test trip (2 min)
          </Button>
          <Button data-testid="log-departure-button" onClick={() => setFormOpen(true)}>
            Log departure
          </Button>
        </div>
      </div>

      {trips.status === 'loading' ? (
        <p className="text-sm text-muted-foreground">Loading board…</p>
      ) : trips.records.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="Log a departure, or add the sample fleet to see the board in action."
        />
      ) : (
        <>
          <BoardGroup testId="group-overdue" title="Overdue" trips={groups.overdue} eventsByTrip={eventsByTrip} />
          <BoardGroup testId="group-out" title="Out" trips={groups.out} eventsByTrip={eventsByTrip} />
          <BoardGroup
            testId="group-returned"
            title="Returned today"
            trips={groups.returnedToday}
            eventsByTrip={eventsByTrip}
          />
        </>
      )}

      <DepartureForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}

function BoardGroup({
  testId,
  title,
  trips,
  eventsByTrip,
}: {
  testId: string
  title: string
  trips: Array<{ recordId: string; data: TripData }>
  eventsByTrip: Map<string, TripEventData[]>
}) {
  if (trips.length === 0) return null

  return (
    <section data-testid={testId}>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({trips.length})
      </h2>
      <div className="flex flex-col gap-3">
        {trips.map((t) => (
          <TripCard
            key={t.recordId}
            tripId={t.recordId}
            trip={t.data}
            events={eventsByTrip.get(t.recordId) ?? []}
          />
        ))}
      </div>
    </section>
  )
}
