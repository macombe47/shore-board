import { useState } from 'react'
import { Badge, Button, useToast } from '@/components/ui'
import { callAction } from '@/lib/actions'
import { formatBoardTime, formatBoardTimeShort } from '@/lib/time'
import type { CallSheet, TripData, TripEventData } from './types'

interface TripCardProps {
  tripId: string
  trip: TripData
  events: TripEventData[]
}

const STATUS_BADGE: Record<TripData['status'], { label: string; variant: 'destructive' | 'info' | 'success' }> = {
  overdue: { label: 'Overdue', variant: 'destructive' },
  out: { label: 'Out', variant: 'info' },
  returned: { label: 'Returned', variant: 'success' },
}

const EVENT_LABEL: Record<TripEventData['kind'], string> = {
  departed: 'Departed',
  checked_in: 'Checked in',
  flagged_overdue: 'Flagged overdue',
  alert_sent: 'Alert sent',
  resolved: 'Resolved',
}

export function TripCard({ tripId, trip, events }: TripCardProps) {
  const { error } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const badge = STATUS_BADGE[trip.status]

  async function handleCheckIn() {
    setCheckingIn(true)
    try {
      const result = await callAction('checkInTrip', { tripId })
      if (!result.success) error('Could not check in', result.error)
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <div
      data-testid="trip-card"
      className={
        'rounded-lg border bg-card p-4 ' +
        (trip.status === 'overdue' ? 'border-destructive/50' : 'border-border')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">
              {trip.vesselName}
              {!!trip.isSample && <span className="ml-2 text-xs text-muted-foreground">(sample)</span>}
            </h3>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          {trip.vesselDescription && (
            <p className="mt-0.5 text-sm text-muted-foreground">{trip.vesselDescription}</p>
          )}
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Skipper</dt>
          <dd className="text-foreground">{trip.skipper}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Aboard</dt>
          <dd className="text-foreground">{trip.personsAboard}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Planned area</dt>
          <dd className="truncate text-foreground">{trip.plannedArea || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Departed</dt>
          <dd className="text-foreground">{formatBoardTimeShort(trip.departedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {trip.status === 'returned' ? 'Checked in' : 'Due back'}
          </dt>
          <dd className="text-foreground">
            {trip.status === 'returned' && trip.checkedInAt
              ? formatBoardTimeShort(trip.checkedInAt)
              : formatBoardTimeShort(trip.expectedReturnAt)}
          </dd>
        </div>
      </dl>

      {trip.status === 'overdue' && <CallSheetSection callSheet={trip.callSheet} />}

      <div className="mt-4 flex items-center gap-3">
        {trip.status !== 'returned' && (
          <Button size="sm" onClick={handleCheckIn} loading={checkingIn}>
            Check in
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide timeline' : `Timeline (${events.length})`}
        </Button>
      </div>

      {expanded && (
        <ol className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {events.length === 0 && <li className="text-sm text-muted-foreground">No events yet.</li>}
          {events.map((ev, i) => {
            // A failed alert's detail carries a short reason plus — since
            // delivery can't be demoed right now (F-002) — a preview of
            // what the email would have said, separated by a blank line.
            const [summary, ...rest] = (ev.detail ?? '').split('\n\n')
            const preview = rest.join('\n\n')
            return (
              <li key={i} className="text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-foreground">
                    {EVENT_LABEL[ev.kind]}
                    {summary ? <span className="text-muted-foreground"> — {summary}</span> : null}
                  </span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatBoardTime(ev.at)}
                  </span>
                </div>
                {preview && (
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border border-border bg-background/50 p-2 text-xs text-muted-foreground">
                    {preview}
                  </pre>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function CallSheetSection({ callSheet }: { callSheet?: CallSheet }) {
  return (
    <div className="mt-4 rounded-md border border-warning/30 bg-warning/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">Call sheet</h4>
        {callSheet && (
          <Badge variant={callSheet.source === 'ai' ? 'info' : 'outline'} size="sm">
            {callSheet.source === 'ai' ? 'AI-generated' : 'Template'}
          </Badge>
        )}
      </div>

      {!callSheet ? (
        <p className="mt-1 text-sm text-muted-foreground">Generating…</p>
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{callSheet.script}</p>
          {callSheet.missingInfo.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Missing info: </span>
              {callSheet.missingInfo.join('; ')}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            AI can be wrong — verify before calling. This supports, never replaces, calling for help.
          </p>
        </>
      )}
    </div>
  )
}
