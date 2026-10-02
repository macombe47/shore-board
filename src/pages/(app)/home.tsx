/**
 * Signed-in landing at /home — dynamic tier (src/pages/(app)/), so auth and
 * data hooks work, but nothing here requires sign-in: a signed-out visitor
 * who navigates here directly (rather than through the static "/" landing)
 * still gets a real page, not a blank one or an auth wall.
 *
 * The product's actual home is the board; this page's whole job is getting
 * people there in one click.
 */

import { Link } from 'react-router-dom'
import { useAuthProfileReady } from 'deepspace'
import { APP_NAME } from '../../constants'

export default function HomePage() {
  const { isSignedIn, user } = useAuthProfileReady({ requireUser: true })

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        A live watch board for a small fleet. Log a departure, see every boat on the
        water, and get an automatic flag — with a call sheet ready to read — the moment
        one misses its return time.
      </p>
      {isSignedIn && user && (
        <p className="text-sm text-muted-foreground">Signed in as {user.name ?? user.email}</p>
      )}
      <Link
        to="/board"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Open the board
      </Link>
    </div>
  )
}
