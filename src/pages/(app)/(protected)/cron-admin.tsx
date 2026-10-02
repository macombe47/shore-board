/**
 * Cron monitor — everyone signed in can see task status and run history;
 * only the app owner can trigger/pause/resume. Server-enforced in
 * src/server/realtime-routes.ts (D-011, docs/DECISIONS.md) — the `isOwner`
 * check below is UX only, matching the pattern from
 * https://docs.deep.space/guides/scheduled-jobs#monitor-and-trigger-from-the-ui-usecronmonitor.
 */

import { useState } from 'react'
import { useCronMonitor, useAuth, useUser, type CronMutationResult } from 'deepspace'
import { SCOPE_ID } from '@/constants'

export default function CronAdminPage() {
  const { tasks, history, connected, canWrite, lastError, trigger, pause, resume } = useCronMonitor(SCOPE_ID)
  const { userId } = useAuth()
  const { user } = useUser()
  const isOwner = !!userId && user?.role === 'admin'
  const [mutationResult, setMutationResult] = useState<string | null>(null)

  const runMutation = async (mutation: Promise<CronMutationResult>) => {
    setMutationResult('pending')
    const receipt = await mutation
    setMutationResult(receipt.ok ? 'ok' : (receipt.error ?? receipt.reason))
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cron</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwner
            ? 'You can trigger, pause, and resume tasks.'
            : 'Read-only — only the app owner can trigger, pause, or resume tasks.'}
        </p>
      </div>

      {!connected ? (
        <p className="text-sm text-muted-foreground">Connecting…</p>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tasks</h2>
            <ul className="flex flex-col gap-3">
              {tasks.map((t) => (
                <li key={t.name} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">{t.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {t.paused ? 'paused' : `next: ${t.nextRunAt ?? '—'}`}
                    </span>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label={`Run now: ${t.name}`}
                        disabled={!canWrite}
                        onClick={() => void runMutation(trigger(t.name))}
                        className="rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Run now
                      </button>
                      <button
                        type="button"
                        disabled={!canWrite}
                        onClick={() => void runMutation(t.paused ? resume(t.name) : pause(t.name))}
                        className="rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t.paused ? 'Resume' : 'Pause'}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {lastError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {lastError}
              </p>
            )}
            {mutationResult && (
              <p data-testid="cron-trigger-result" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
                {mutationResult}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              History
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {history.map((h, i) => (
                  <li key={i} data-testid="cron-history-row" className="text-sm text-foreground">
                    {h.taskName} — {h.success ? 'ok' : 'failed'} — {h.durationMs}ms
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
