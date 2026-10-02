import type { CollectionSchema } from 'deepspace/schema'

/**
 * At most one record in this collection, kept up to date (not recreated)
 * by src/cron.ts's `weather-refresh` task every 30 minutes. A single shared
 * record means visitors read it for free instead of each triggering an
 * owner-billed OpenWeatherMap call (D-005, docs/DECISIONS.md).
 */
export const weatherSchema: CollectionSchema = {
  name: 'weather',
  columns: [
    { name: 'location', storage: 'text', interpretation: 'plain' },
    { name: 'temp', storage: 'number', interpretation: 'plain' },
    { name: 'feelsLike', storage: 'number', interpretation: 'plain' },
    { name: 'humidity', storage: 'number', interpretation: 'plain' },
    { name: 'windSpeed', storage: 'number', interpretation: 'plain' },
    { name: 'windDeg', storage: 'number', interpretation: 'plain' },
    { name: 'description', storage: 'text', interpretation: 'plain' },
    { name: 'icon', storage: 'text', interpretation: 'plain' },
    { name: 'fetchedAt', storage: 'text', interpretation: { kind: 'datetime' } },
  ],
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
