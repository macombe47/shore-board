/**
 * Example gated page. Reached at /settings — no auth logic lives here
 * because (protected)/_layout.tsx already wraps the subtree in <AuthGate>.
 */

import { signOut, useUser, useAuth, useQuery, useMutations } from 'deepspace'
import { Button, Label, Switch } from '@/components/ui'

interface UserRowData {
  wantsAlertEmail?: number
}

export default function SettingsPage() {
  const { user } = useUser()
  const { userId } = useAuth()
  // Member's read policy on `users` is 'own' (exactly one row back), but
  // admin's is `true` (every row in the collection) — so `records[0]` is
  // only "my row" for a member. Find by id so this works for both roles.
  const { records } = useQuery<UserRowData>('users')
  const { put, ready } = useMutations<UserRowData>('users')
  const ownRow = records.find((r) => r.recordId === userId)
  const wantsAlertEmail = !!ownRow?.data.wantsAlertEmail

  return (
    // No background on page wrappers — pages render into whatever the app's
    // (app)/_layout provides (a plain background, or a raised panel), so they
    // stay transparent and inherit it.
    <div className="min-h-full text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="mb-12 text-4xl font-bold tracking-tight">Settings</h1>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Your account</h2>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-foreground">{user?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{user?.email ?? '—'}</dd>
            </div>
          </dl>

          <Button variant="secondary" className="mt-6" onClick={() => signOut()}>
            Sign out
          </Button>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Overdue alerts</h2>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="wantsAlertEmail" className="font-normal text-muted-foreground">
              Email me when a boat is flagged overdue
            </Label>
            <Switch
              id="wantsAlertEmail"
              checked={wantsAlertEmail}
              disabled={!ready || !userId}
              onCheckedChange={(checked) => {
                if (!userId) return
                void put(userId, { wantsAlertEmail: checked ? 1 : 0 })
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Email delivery is currently blocked by a platform-side limit — the shared email
            integration can only deliver to the app owner's own address, not to opted-in
            members (see <code>docs/FRICTION_LOG.md</code> F-002). This isn't a bug in the
            app; the alert pipeline runs correctly and the overdue banner on the board is
            the live channel in the meantime.
          </p>
        </section>
      </div>
    </div>
  )
}
