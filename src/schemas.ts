/**
 * Collection Schemas
 *
 * All collections with columns and RBAC permissions.
 * Single source of truth — imported by both worker and frontend.
 *
 * Add schemas by creating a file in src/schemas/ and importing it here.
 */

import type { CollectionSchema } from 'deepspace/schema'
import { usersSchema } from './schemas/users-schema'
import { settingsSchema } from './schemas/admin-schema'
import { tripsSchema } from './schemas/trips-schema'
import { tripEventsSchema } from './schemas/trip-events-schema'
import { weatherSchema } from './schemas/weather-schema'

export const schemas: CollectionSchema[] = [
  usersSchema,
  settingsSchema,
  tripsSchema,
  tripEventsSchema,
  weatherSchema,
]
