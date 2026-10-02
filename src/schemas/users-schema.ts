import { USERS_COLUMNS, type CollectionSchema } from 'deepspace/schema'

export const usersSchema: CollectionSchema = {
  name: 'users',
  columns: [
    ...USERS_COLUMNS,
    // Per-member opt-in for overdue alert email (M2). Member can read/update
    // their own row already (see permissions below), so no RBAC change needed.
    { name: 'wantsAlertEmail', storage: 'number', interpretation: { kind: 'boolean' }, default: 0 },
  ],
  permissions: {
    viewer: { read: 'own', create: false, update: 'own', delete: false },
    member: { read: 'own', create: false, update: 'own', delete: false },
    admin: { read: true, create: false, update: true, delete: true },
  },
}
