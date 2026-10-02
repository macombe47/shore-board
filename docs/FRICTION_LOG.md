# Friction log

Platform issues hit while building — real gaps between the docs and what
the platform actually does, not app bugs. One entry per issue, logged when
hit. Feeds the writeup's "omissions explained" section and is worth sending
to DeepSpace as feedback.

Template:

```
## F-00X: <short title>
Date:
Docs said: what the documentation or example claimed
Actually happened: the exact error / behavior, verbatim
How we confirmed it: the exact commands run
Suggested fix: what DeepSpace docs or product should change
```

---

## F-001: `resend/send-email` doesn't exist — the real endpoint is `email/send`

Date: 2026-10-02
Docs said: Three separate pages show the integration call as `resend/send-email`:
`/guides/scheduled-jobs` (`ctx.integrations.call('resend/send-email', ...)`),
`/sdk-reference/worker/cron` (same example), and the generic
`/guides/external-apis` worker-calling example.
Actually happened:
```
$ npx deepspace integrations info resend/send-email
Unknown integration 'resend'. Available: alphavantage, amazon, anthropic,
anymailfinder, api-american-football, ... email, exa, ... [unknown_integration]
```
The live catalog's entry for transactional email is `email` → `send`
(endpoint key `email/send`), not `resend/send-email`. Same provider
(Resend) under the hood, different integration key.
How we confirmed it: `npx deepspace integrations list` (full catalog scan)
found the real entry under `email`; `npx deepspace integrations info
email/send` returned a valid schema (`from`, `to`, `subject` required).
`npx deepspace integrations info resend/send-email` refused with
`unknown_integration`.
Suggested fix: Update the three doc pages' example code to `email/send`,
or add an alias so the documented name still resolves. Worth grepping the
rest of the docs corpus for other `<provider-name>/<verb>`-shaped examples
that may have the same drift from the catalog's actual `<category>/<verb>`
naming (the catalog groups by function — `email`, not by provider —
`resend`).

## F-002: The shared `email` integration can only deliver to the platform operator's own address

Date: 2026-10-02
Docs said: `/guides/external-apis` and `/guides/scheduled-jobs` describe
calling `email/send` (there, written as `resend/send-email`) as a
drop-in, no-API-key-management way to send transactional email — "You
don't store API keys... the platform handles billing, rate-limiting, and
provider routing." No doc page mentions a sender-domain verification step
or any limitation on which recipients the call can reach.
Actually happened: Two real (billed) test sends from this app:
```
$ npx deepspace integrations invoke email/send --body '{"from":"Shore Board <no-reply@shore-board.app.space>", ...}' --yes
email/send (502, 667ms): Resend API error 403: {"message":"The
shore-board.app.space domain is not verified. Please, add and verify your
domain on https://resend.com/domains", ...}

$ npx deepspace integrations invoke email/send --body '{"from":"Shore Board <onboarding@resend.dev>", ...}' --yes
email/send (502, 422ms): Resend API error 403: {"message":"You can only
send testing emails to your own email address (mcapi@eudaimonic.one). To
send emails to other recipients, please verify a domain at
resend.com/domains, and change the `from` address to an email using this
domain.", ...}
```
The second error names `mcapi@eudaimonic.one` — the Resend account
owner behind the platform's shared integration, not the app developer or
any app user. There is no app-level secret, `deepspace secrets`, or `app`
subcommand that lets a developer supply their own Resend API key or
verify their own domain against this integration — confirmed by `npx
deepspace secrets list` (empty) and `npx deepspace --help` (no
domain/email-provider subcommand under `app`, `secrets`, or
`integrations`). The integration proxy is in Resend's unverified sandbox
mode platform-wide, which caps every app's `email/send` calls to that one
address, for every DeepSpace app using the shared integration, not just
this one.
How we confirmed it: the two invokes above (`--yes`, billed $0.013 each,
visible in `npx deepspace app usage`), plus `npx deepspace secrets list`
and `npx deepspace --help` to rule out a self-service fix.
Suggested fix: Either (a) verify a domain on the shared Resend account so
the `email/send` integration can deliver to arbitrary recipients
platform-wide, or (b) support a developer-supplied Resend API key via
`deepspace secrets` for apps that need to send to real users, or (c) at minimum, document the sandbox limitation on the `email`/`external-apis`
guide pages so it's discoverable before a developer builds an entire
alert path around it. This is a significant gap for exactly the kind of
app DeepSpace's own cron+integrations story is pitched at (digests,
alerts, notifications) — "callable from cron" is true, but "will actually
reach the recipient" currently is not, for any app on the shared account.

## F-003: A new page route 404s until `node_modules/.vite` is cleared, even after a full dev-server restart

Date: 2026-10-02
Docs said: `/get-started/project-structure` describes `src/pages/` routing as
file-based via generouted — "every file under `src/pages/` becomes a route" —
with no caveat about needing anything beyond adding the file. The scaffold's
`vite.config.ts` comment on `optimizeDeps.entries` only describes a
dep-scanner limitation around `import.meta.glob` causing a one-time reload
on first boot; nothing suggested a *new* page file could need more than that.
Actually happened: Added `src/pages/(app)/(protected)/cron-admin.tsx`, and
`src/router.ts` (generouted's own generated type file) correctly listed
`/cron-admin` in its `Path` union after the next `deepspace dev start` —
`[generouted] scanned 7 routes in 8 ms` in the server log confirmed the file
was found. But navigating to `/cron-admin` (both a hard URL load and a
client-side nav-link click) rendered the app's own 404 catch-all
(`[...all].tsx`), with no console error, across **three full
`deepspace dev kill` / `deepspace dev start` cycles**, including killing
the exact PID holding port 5173 and confirming a fresh process ID started
after the file existed. Only `rm -rf node_modules/.vite` followed by a
restart fixed it — confirmed immediately after by both a hard URL load and
a nav-link click.
How we confirmed it: `curl localhost:5173/cron-admin` (200, but just the SPA
shell — not proof either way), browser console (no errors logged), comparing
`cron-admin.tsx`'s mtime against `ps -o lstart` for the vite process (file
predated every server start attempted), and finally bisecting by clearing
the Vite cache directory and retesting both navigation paths.
Suggested fix: Document that `deepspace dev kill` / `deepspace dev start`
does not clear Vite's on-disk dependency-optimizer cache
(`node_modules/.vite`), and that cache is keyed off `package.json`/lockfile
content — not off which files match an `optimizeDeps.entries` glob — so it
does not invalidate when a brand-new page file is added to a directory
already covered by the glob. A one-line note on `/get-started/project-structure`
or in the scaffold's own `vite.config.ts` comment ("added a new page and it
404s? `rm -rf node_modules/.vite`") would have saved real debugging time —
checked `deepspace dev start --help` and there is currently no flag that
clears this cache. Ideally `deepspace dev start` would detect this itself
(new file under a glob'd `optimizeDeps` entry not present in the cached
route list) and clear the cache automatically.

Update (same day, M3 session): hit the identical symptom again on
`/cron-admin` — same route, no new page files added this time, only edits
to `src/jobs.ts`, `src/cron.ts`, and an existing component. Sequence was:
`rm -rf node_modules/.vite` → `npx deepspace test run all` (which runs its
own Vite dev server against the same `node_modules/.vite`) → killed that →
`npx deepspace dev start` for manual browsing, **without clearing the cache
again in between**. `/cron-admin` 404'd again, confirmed on two separate
navigations a few seconds apart (ruling out a one-off race). Clearing
`node_modules/.vite` a second time and restarting fixed it immediately.
So the cache is apparently also incompatible between a `deepspace test run`
invocation and a plain `deepspace dev start` sharing the same cache
directory, not only between two `dev start` runs with a new page file
between them — a second, broader trigger for the same underlying fix.
Updated suggestion: clear `node_modules/.vite` before starting `dev start`
for manual verification any time the previous Vite process was started by
`test run` rather than `dev start`, until the platform handles this itself.
