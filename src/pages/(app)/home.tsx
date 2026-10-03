/* home pattern: split-hero — one-line pitch + a sample trip-card mockup */

/**
 * Signed-in landing at /home — dynamic tier (src/pages/(app)/), so auth and
 * data hooks work, but nothing here requires sign-in: a visitor who lands
 * here directly (rather than through the static "/" landing) still gets a
 * real page. The right-hand mockup is static/illustrative — trips are
 * member-only read (D-012), so a signed-out visitor can't see the real
 * board — but this shows exactly what it produces without needing it.
 */

import { Link } from 'react-router-dom'
import { useAuthProfileReady } from 'deepspace'
import { Badge } from '@/components/ui'
import { APP_NAME } from '../../constants'

export default function HomePage() {
  const { isSignedIn, user } = useAuthProfileReady({ requireUser: true })

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
      <div className="max-w-md text-center lg:text-left">
        <p className="font-display mb-2 text-sm uppercase tracking-widest text-muted-foreground">
          {APP_NAME}
        </p>
        <h1 className="font-display mb-4 text-3xl font-bold tracking-tight text-foreground">
          The board, the moment you need it.
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Log a departure, watch the board update live, and get an automatic flag — with a
          call sheet ready to read — the moment a boat misses its return time.
        </p>
        {isSignedIn && user && (
          <p className="mb-4 text-sm text-muted-foreground">Signed in as {user.name ?? user.email}</p>
        )}
        <Link
          to="/board"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open the board
        </Link>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-destructive/50 bg-card p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold text-foreground">
            Example — Sea Swift
          </span>
          <Badge variant="destructive">Overdue</Badge>
        </div>
        <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div>
            <dt className="text-muted-foreground">Skipper</dt>
            <dd className="text-foreground">J. Alvarez</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Aboard</dt>
            <dd className="text-foreground">2</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Due back</dt>
            <dd className="text-foreground">5:30 PM</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Overdue by</dt>
            <dd className="text-foreground">12 min</dd>
          </div>
        </dl>
        <div className="rounded-md border border-border bg-background/50 p-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Call sheet: </span>
          &ldquo;Sea Swift departed Harbor Point at 3:15 PM, expected back 5:30 PM&hellip;&rdquo;
        </div>
      </div>
    </div>
  )
}
