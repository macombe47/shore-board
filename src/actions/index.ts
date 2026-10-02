import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'
import { nowISO } from '../lib/time'

interface TripRecordData extends Record<string, unknown> {
  status: 'out' | 'overdue' | 'returned'
}

interface LogDepartureParams {
  vesselName?: string
  vesselDescription?: string
  skipper?: string
  personsAboard?: number
  plannedArea?: string
  expectedReturnAt?: string
}

/**
 * Logging a departure is a server action for the same reason as check-in:
 * the trip row and its first `departed` timeline event must land together,
 * not as two independent fire-and-forget client mutations that could race
 * or partially fail.
 */
export const logDeparture: ActionHandler<Env> = async ({ params, tools }) => {
  const p = params as LogDepartureParams
  if (!p.vesselName || !p.skipper || !p.expectedReturnAt) {
    return { success: false, error: 'vesselName, skipper, and expectedReturnAt are required' }
  }

  const at = nowISO()
  const created = await tools.create('trips', {
    vesselName: p.vesselName,
    vesselDescription: p.vesselDescription ?? '',
    skipper: p.skipper,
    personsAboard: p.personsAboard ?? 1,
    plannedArea: p.plannedArea ?? '',
    departedAt: at,
    expectedReturnAt: p.expectedReturnAt,
    status: 'out',
    isSample: 0,
  })
  if (!created.success) return created

  const tripId = created.data.recordId
  await tools.create('trip-events', { tripId, kind: 'departed', at })

  return { success: true, data: { tripId } }
}

/**
 * Checking in is a server action (not a plain `useMutations().put`) because
 * it must atomically update the trip's status AND append a timeline event —
 * two collections in one round-trip, and the "was this trip overdue"
 * decision (whether to also log a `resolved` event) has to be made against
 * the record the server just read, not a possibly-stale client copy.
 */
export const checkInTrip: ActionHandler<Env> = async ({ params, tools }) => {
  const tripId = params.tripId as string
  if (!tripId) return { success: false, error: 'tripId is required' }

  const existing = await tools.get<TripRecordData>('trips', tripId)
  if (!existing.success) return existing

  const { record } = existing.data
  if (record.data.status === 'returned') {
    return { success: false, error: 'Trip is already checked in' }
  }

  const wasOverdue = record.data.status === 'overdue'
  const at = nowISO()

  const updated = await tools.update('trips', tripId, { status: 'returned', checkedInAt: at })
  if (!updated.success) return updated

  await tools.create('trip-events', { tripId, kind: 'checked_in', at })
  if (wasOverdue) {
    await tools.create('trip-events', {
      tripId,
      kind: 'resolved',
      detail: 'Checked in after an overdue alert',
      at,
    })
  }

  return { success: true, data: { tripId } }
}

/**
 * One boat, due back in 2 minutes — lets a reviewer see the full overdue →
 * alert → resolve path (once M2/M3 ship) without waiting on a real trip.
 */
export const createQuickTestTrip: ActionHandler<Env> = async ({ tools }) => {
  const at = nowISO()
  const expectedReturnAt = new Date(Date.now() + 2 * 60_000).toISOString()

  const created = await tools.create('trips', {
    vesselName: 'Quick Test Boat',
    vesselDescription: 'No real crew — created by the "Quick test trip" button',
    skipper: 'Test Skipper',
    personsAboard: 1,
    plannedArea: 'Dock test loop',
    departedAt: at,
    expectedReturnAt,
    status: 'out',
    isSample: 1,
  })
  if (!created.success) return created

  const tripId = created.data.recordId
  await tools.create('trip-events', { tripId, kind: 'departed', detail: 'Quick test trip', at })

  return { success: true, data: { tripId } }
}

const SAMPLE_FLEET = [
  {
    vesselName: 'Sample — Wind Dancer',
    vesselDescription: '24ft sloop, white hull, blue sail cover',
    skipper: 'Sample Skipper A',
    personsAboard: 3,
    plannedArea: 'Lost Creek Lake, north cove',
    minutesOut: 10,
  },
  {
    vesselName: 'Sample — Blue Heron',
    vesselDescription: '18ft center console, gray hull',
    skipper: 'Sample Skipper B',
    personsAboard: 2,
    plannedArea: 'Lost Creek Lake, dam side',
    minutesOut: 25,
  },
  {
    vesselName: 'Sample — Kokanee',
    vesselDescription: '16ft aluminum skiff, green trim',
    skipper: 'Sample Skipper C',
    personsAboard: 4,
    plannedArea: 'Lost Creek Lake, boat ramp loop',
    minutesOut: 45,
  },
] as const

/** Clearly-labeled sample trips with staggered return times, per the brief. */
export const createSampleFleet: ActionHandler<Env> = async ({ tools }) => {
  const at = nowISO()
  const tripIds: string[] = []

  for (const boat of SAMPLE_FLEET) {
    const expectedReturnAt = new Date(Date.now() + boat.minutesOut * 60_000).toISOString()
    const created = await tools.create('trips', {
      vesselName: boat.vesselName,
      vesselDescription: boat.vesselDescription,
      skipper: boat.skipper,
      personsAboard: boat.personsAboard,
      plannedArea: boat.plannedArea,
      departedAt: at,
      expectedReturnAt,
      status: 'out',
      isSample: 1,
    })
    if (!created.success) return created

    const tripId = created.data.recordId
    await tools.create('trip-events', { tripId, kind: 'departed', detail: 'Sample fleet', at })
    tripIds.push(tripId)
  }

  return { success: true, data: { tripIds } }
}

export const actions: Record<string, ActionHandler<Env>> = {
  logDeparture,
  checkInTrip,
  createQuickTestTrip,
  createSampleFleet,
}
