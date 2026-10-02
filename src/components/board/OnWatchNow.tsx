import { usePresence } from 'deepspace'

/** Who's currently online, derived from the users-collection heartbeat (~60s granularity). */
export function OnWatchNow() {
  const { users, isOnline } = usePresence()
  const online = users.filter((u) => isOnline(u.id))

  if (online.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">On watch now:</span>
      {online.map((u) => (
        <span key={u.id} className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          {u.name}
        </span>
      ))}
    </div>
  )
}
