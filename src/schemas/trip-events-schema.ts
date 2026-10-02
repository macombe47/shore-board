import type { CollectionSchema } from 'deepspace/schema'

/**
 * Append-only timeline for a trip: departed, checked in, flagged overdue,
 * alert sent, resolved. Members can read and append; nobody but an admin
 * can edit or delete a row, so the timeline stays a trustworthy record of
 * what happened and when.
 */
export const tripEventsSchema: CollectionSchema = {
  name: 'trip-events',
  columns: [
    { name: 'tripId', storage: 'text', interpretation: 'plain', required: true },
    {
      name: 'kind',
      storage: 'text',
      interpretation: {
        kind: 'select',
        options: ['departed', 'checked_in', 'flagged_overdue', 'alert_sent', 'resolved'],
      },
      required: true,
    },
    { name: 'detail', storage: 'text', interpretation: 'plain', default: '' },
    { name: 'at', storage: 'text', interpretation: { kind: 'datetime' }, required: true },
  ],
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: true, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
