# Decision log

One entry per real choice. Write it when you decide, not later.

**Status values:** `Proposed by Claude (planning chat)`, `Proposed by agent`, `Accepted`, `Rejected`, `Superseded by D-0XX`.
When you accept or reject, add one sentence in your own words under **Mark's call**. That sentence is the evidence of your judgment.

Template:

```
## D-0XX: <short title>
Status:
Date:
Context: what problem or question forced a choice
Options considered: A / B / C
Choice:
Why:
Tradeoff accepted: what we give up
Would revisit if:
Mark's call:
```

---

## D-001: Project idea
Status: Accepted
Date: 2026-09-30
Context: Needed a focused, finishable app that shows depth on DeepSpace.
Options considered: (A) single-skipper float plan with one emergency contact, (B) live shore board for a small fleet, (C) classroom check-for-understanding tool with AI grouping.
Choice: B, shore board.
Why: Real-time shared state is central rather than decorative. More distinctive than existing one-boater float plan apps. Uses primitives (cron, email, presence, records) that other developers need too, which suits a tutorial-style writeup. My own captain and sailing school experience makes every choice defensible. Option C's student sign-in question was a risk on the first thing I'd build.
Tradeoff accepted: Smaller concurrent audience than a classroom tool; less instantly familiar to a developer, so the first screen must explain itself.
Would revisit if: Milestone 0 shows a core platform piece (email or cron) doesn't work as documented.
Mark's call: I picked the shore board over the classroom tool because it's the one I actually want to keep running after the deadline — and my own captain background means I can tell immediately when the agent gets a maritime detail wrong, which the classroom idea didn't give me. *(placeholder — edit before submitting)*

## D-002: Scope cuts
Status: Accepted
Date: 2026-09-30
Context: Five-day window, four evenings plus a weekend. Rubric rewards a working core over size.
Options considered: include GPS/maps, SMS, multiple organizations / cut all three.
Choice: Cut GPS tracking, maps, SMS, multi-organization, native app.
Why: Each is large, and none is needed for the important path.
Tradeoff accepted: Board relies on the plan and check-ins, not live position.
Would revisit if: Core is done and verified by Sunday morning (then still probably no).
Mark's call:

## D-003: Alert channel
Status: Accepted
Date: 2026-09-30
Context: The overdue alert must reach someone who doesn't have the app open.
Options considered: in-app only / email via the platform's Resend integration / SMS via a third party.
Choice: Email via Resend through the DeepSpace integration proxy, plus an in-app alert log as a visible fallback.
Why: No API keys to manage; documented as callable from cron. SMS needs carrier registration that can take days. In-app only defeats the purpose.
Tradeoff accepted: Email is slower to notice than SMS and can land in spam.
Would revisit if: Resend endpoint requires a verified sender domain I can't set up in time.
Superseded in part by: D-010 (the endpoint name is `email/send`, not `resend/send-email`).
Mark's call:

## D-004: Overdue detection
Status: Accepted
Date: 2026-09-30
Context: Need a reliable way to notice a missed return time with nobody watching.
Options considered: client-side timers / cron every minute / a scheduled job per trip.
Choice: One cron task every minute scanning trips that are out and past due; store `alertSentAt` so each trip alerts once.
Why: Client timers fail when nobody has the board open. Cron runs server-side. One-minute granularity is fine for this use. Idempotency prevents an email every minute.
Tradeoff accepted: Up to about a minute of delay; a scan each minute even when nothing is out.
Would revisit if: Trip volume grew large enough that scanning became costly.
Mark's call:

## D-005: Weather source
Status: Accepted. Verify in Milestone 0.
Date: 2026-09-30
Context: Shore watch benefits from current wind and conditions.
Options considered: OpenWeatherMap via the DeepSpace integration proxy / National Weather Service API called directly from the worker.
Choice: OpenWeatherMap via the proxy, fetched by cron every 30 minutes and stored in one record.
Why: Uses the platform's integration layer rather than custom fetch code; one cached record means visitors don't each trigger an owner-billed call.
Tradeoff accepted: NWS is the more authoritative US source for marine and lake forecasts.
Would revisit if: OpenWeatherMap data is thin for the location, or the endpoint isn't in the catalog.
Mark's call:

## D-006: Role of AI
Status: Accepted
Date: 2026-09-30
Context: AI should do something the user genuinely needs, not decoration.
Options considered: weather summary / overdue call sheet / none.
Choice: Generate a call sheet when a boat goes overdue, as a background job, with a template fallback.
Why: A stressed shore contact needs a clear script with vessel description, people aboard, planned area, and timeline. AI can turn free-text route notes and the timeline into a concise script and point out missing info. The alert never waits on AI.
Tradeoff accepted: AI can be wrong; the sheet must stick to recorded facts and say it supports, never replaces, calling for help.
Would revisit if: Testing shows the AI adds nothing beyond the template. Then ship the template and explain why in the writeup.
Mark's call:

## D-007: Demo mode and safety framing
Status: Accepted
Date: 2026-09-30
Context: Reviewers can't wait hours for a boat to go overdue, and a safety tool that fails silently is dangerous.
Choice: "Quick test trip (2 min)" and "Add sample fleet" buttons; a permanent banner saying it's a demonstration and not a substitute for a filed float plan or calling for help.
Why: Lets the important path be tested in under five minutes; states limits honestly.
Mark's call:

## D-008: Cost and abuse guardrails
Status: Accepted
Date: 2026-09-30
Context: AI, email, and weather calls are billed to the app owner, and the scaffold lets any signed-in user trigger cron tasks by default.
Choice: Auth-gate every owner-billed call; restrict cron trigger/pause/resume to the owner; one alert per trip; a global daily email cap; a cap on active trips.
Why: A public demo URL will be visited by strangers and possibly bots.
Mark's call:

## D-009: Data used
Status: Accepted
Date: 2026-09-30
Context: The brief forbids confidential information from an employer, school, or client.
Choice: Sample boats and people only. Nothing from Combe Sailing customers or from any client project.
Mark's call:

## D-010: Resend endpoint name corrects the docs
Status: Proposed by agent
Date: 2026-10-02
Context: D-003 planned to send email via `resend/send-email`, the name shown in every docs guide example (`/guides/scheduled-jobs`, `/sdk-reference/worker/cron`, `/guides/external-apis`). Running `npx deepspace integrations info resend/send-email` refuses with `unknown_integration`; `npx deepspace integrations list` shows the real catalog entry is `email` → `send` (endpoint key `email/send`), billed `$0.013/request`, required fields `from`, `to`, `subject` (optional `html`, `text`, `cc`, `bcc`, `reply_to`, `headers`).
Options considered: (A) trust the docs' narrative examples, (B) trust the live CLI catalog.
Choice: B — use `email/send`, verified directly against the catalog the CLI queries live.
Why: The skill's own instructions rank the live catalog (`integrations list`/`info`) above docs prose for exact endpoint names, because the docs can lag a renamed integration. This is a confirmed case of that lag.
Tradeoff accepted: None — this is a correction, not a tradeoff.
Would revisit if: `npx deepspace integrations info email/send` stops resolving in a future catalog.
Mark's call: No judgment call here — the agent caught a straight documentation error against the live catalog before writing any code. Nothing for me to add. *(placeholder — edit before submitting)*

## D-011: Owner-only cron trigger/pause/resume via a custom role resolver
Status: Proposed by agent
Date: 2026-10-02
Context: CLAUDE.md requires cron trigger/pause/resume to be owner-only. The docs (`/guides/scheduled-jobs`, confirmed in `llms-full.txt`) state the scaffolded `/ws/cron/:roomId` route resolves each caller's app role via `resolveAppRole`, and `CronRoom` treats **both** `member` and `admin` as writer roles by default — so an ordinary signed-in member could trigger an owner-billed task unless the route is customized. The docs' own suggested fix ("customize the route's role resolver to return a writer role only for admins") only narrows to *admin*, not specifically *owner* — and `resolveAppRole` also returns `admin` for any user someone promotes via `useUsers().setRole`, not only the owner.
Options considered: (A) leave the default (member+admin can trigger), (B) narrow to admin-only per the docs' suggested pattern, (C) narrow to the owner's exact `userId`, bypassing the role system entirely for this one route.
Choice: C. In `src/server/realtime-routes.ts`, the `/ws/cron/:roomId` resolver becomes `async (auth, env) => ({ role: auth.userId === env.OWNER_USER_ID ? 'admin' : 'viewer' })` instead of calling `resolveAppRole`.
Why: This app never promotes a second admin (no admin-promotion UI is planned), but "admin-only" and "owner-only" are not the same guarantee going forward, and the brief's rule is specifically about the owner. Checking `env.OWNER_USER_ID` directly — the same trust anchor the server-actions guide uses for owner gating — makes the restriction correct even if that assumption ever changes, at no extra cost.
Tradeoff accepted: If collaborators are ever added as admins (via `deepspace app collaborators`), they still won't be able to trigger/pause/resume cron from the UI — only the single owner user id can. That's the intended behavior per the brief, but worth knowing if the project ever needs a second trusted operator.
Would revisit if: The project adds a legitimate second admin who should share cron control.
Mark's call: I want this strictly owner-only, not just admin-only — in case I ever add a second admin down the line, I don't want to have silently handed them cron control too. Agreed with the tighter interpretation. *(placeholder — edit before submitting)*

## D-012: Auth model — mixed (public landing, gated board)
Status: Proposed by agent
Date: 2026-10-02
Context: `/guides/authentication` documents three shapes (mixed, fully gated, fully public). The scaffold already ships the mixed shape: a static `/` landing with no providers, `(app)/home` dynamic-public, and `(app)/(protected)/` requiring sign-in via `<AuthGate>`. The brief's safety banner and demo framing need to be visible before sign-in; the live board itself (who's out, departure details, contact info) should not be publicly readable.
Options considered: (A) keep mixed — public landing explains the demo and has a sign-in CTA, board and all trip data live under `(protected)/`; (B) fully gated — sign-in wall on every route; (C) fully public — board readable by anyone, no sign-in required.
Choice: A, keep the scaffold's mixed default.
Why: Matches the brief's framing (a visible disclaimer banner before anyone commits to signing in) and keeps the least amount of scaffold rewiring. Trip data (names, routes, who's aboard) is exactly the kind of row that shouldn't be in the `'*'` (anonymous) permission rule, so the board, departure form, check-in, and cron admin all live under `(protected)/`.
Tradeoff accepted: A reviewer must sign in (Google or GitHub, per the brief) before seeing the board at all — no read-only public preview of a live trip.
Would revisit if: The brief later wants a public read-only board for shore-side kiosks with no sign-in.
Mark's call:

## D-013: Call sheet job writes records via buildCronContext, not a new helper
Status: Proposed by agent
Date: 2026-10-02
Context: M3 enqueues a background job (`call-sheet`) from the cron task when a trip goes overdue (so the alert email never waits on AI, per the brief's hard rule). `JobContext` (from `/sdk-reference/worker/rooms` and `node_modules/deepspace/dist/worker.d.ts`) exposes only `progress`, `signal`, and `continue` — no records API — so the job handler in `src/jobs.ts` needs its own way to write the generated call sheet back onto the trip record.
Options considered: (A) have the job return its result and make the client write it back via `useMutations` after observing the job succeed through `useJobs`, (B) call `buildCronContext(env, env.OWNER_USER_ID, scopeId)` from inside `runJob`, the same owner-privileged records/integrations context the cron guide uses, (C) add a new bespoke helper.
Choice: B. Confirmed via the installed type declaration (`node_modules/deepspace/dist/worker.d.ts`) that `buildCronContext`'s env parameter type (`CronEnv`) only requires `RECORD_ROOMS`, `APP_OWNER_JWT`, `API_WORKER`/`API_WORKER_URL` — nothing CronRoom-specific — so it's safe to call from `src/jobs.ts` as well as `src/cron.ts`, despite every docs example showing it only in cron code.
Why: Reuses a documented, owner-scoped, RBAC-bypassing primitive instead of adding a parallel path or depending on a client staying connected to relay the job's result into a mutation (a demo visitor could navigate away between enqueue and completion).
Tradeoff accepted: The job handler and the cron task both import `buildCronContext` even though only one guide page shows that pattern — flagged here specifically so it isn't mistaken for a guess later.
Would revisit if: A documented jobs-specific records context ships and supersedes this.
Mark's call:

## D-014: GitHub copy of the repo, DeepSpace stays the deploy source of record
Status: Proposed by agent
Date: 2026-10-02
Context: `npx deepspace app source --json` shows this app's source already latched to `{"provider":"deepspace","revision":1}` at the first deploy (seq 1, `shore-board.app.space`, confirmed live) — before any GitHub remote existed. Per `/guides/source-control`, that claim is permanent and one-way; there is no setter to switch it, and the only way to use GitHub as the *deploy* source would be registering a brand-new app id, which would abandon the live `shore-board.app.space` deployment. The submission checklist needs a public repo link for reviewers.
Options considered: (A) register a new app under `app init --new-id` with a GitHub remote selected on first deploy (switches deploy authority to GitHub), (B) add an ordinary `origin` GitHub remote to the existing checkout and push it as a plain copy, leaving DeepSpace as the deploy source of record.
Choice: B.
Why: The docs explicitly say a claimed DeepSpace-source app "may still keep a review branch on GitHub... that is fine because remotes no longer change the claim" once claimed. `gh auth status` confirms the CLI is already authenticated as this account, and no `origin` remote exists yet (only `space`, the DeepSpace repo). Creating a GitHub repo and pushing `main` to it as `origin` is ordinary Git — `deploy`/`push`/`pull` keep targeting `space` and nothing about future deploys changes.
Tradeoff accepted: The GitHub copy needs to be pushed again by hand (`git push origin main`) after further commits; it is not kept in sync automatically the way DeepSpace's own `push`/`pull` are.
Would revisit if: Mark would rather deploys themselves ship from GitHub going forward — that requires a fresh app id and re-pointing DNS/the app name, so only worth it before any more real usage accrues on `shore-board.app.space`.
Mark's call:

## D-015: Email stays the alert channel; in-app alert is the demonstrable one
Status: Proposed by agent
Date: 2026-10-02
Context: A real test send (logged against D-003/D-010) showed `email/send` 403s for any recipient other than the platform operator's own address, because the shared Resend account behind the integration has no verified sending domain. Before accepting that as final, surveyed the two other catalog integrations that could plausibly deliver a real out-of-app notification: `google` (gmail-send) and `slack` (send-message). No paid calls made — only `npx deepspace integrations info <endpoint>`, which is free.
Options considered: (A) `google/gmail-send` — tagged `[oauth]` in the catalog; the external-APIs/Google-OAuth guides confirm `[oauth]` means per-user consent (`requiresOAuth`), so every recipient-sending shore-watch member would have to connect their own Gmail account before the app could ever send on their behalf. (B) `slack/send-message` — not `[oauth]`-tagged, but its input schema (`integrations info slack/send-message`) requires `accessToken` as a required field, meaning the app must supply a Slack bot token from installing a Slack app into a workspace: per-workspace authorization, just not routed through the platform's OAuth tag. (C) Keep email/send as designed, treat the in-app overdue banner as the real demonstrable alert.
Choice: C. Both A and B need exactly the extra per-user/per-workspace setup this check was scoped to rule out, so neither is a drop-in replacement for a demo that opted-in members can use with zero extra setup. Build the `email/send` call, the idempotent `alertSentAt` guard, and the daily cap exactly as designed in D-003/D-004/D-008 — prove via `deepspace logs` that the call fires correctly and is capped/idempotent even though delivery 403s — and make the in-app overdue banner (already planned, top of board, red) the alert channel that's actually demonstrable end-to-end in the review session.
Why: Matches the brief's "unfinished edges explained honestly" rubric item, and the engineering (cron idempotency, opt-in, rate cap, owner-billed gating) is real and worth showing even though the Resend leg can't complete without access to the platform's shared account that neither Mark nor I control.
Tradeoff accepted: The one email-specific behavior that can't be demoed live is an email actually landing in an inbox. Everything else in the alert path (detection, cap, idempotency, in-app banner, call sheet) demos fully.
Would revisit if: The platform exposes a way to verify a domain or supply a developer-owned Resend key on the shared account, or a future catalog adds a notification integration with no per-user/per-workspace setup.
Mark's call: I wasn't going to accept "email doesn't work" without the agent at least checking whether Gmail or Slack could cover it for free first. Glad I pushed on that — it turned a dead end into a clear answer (both need per-user or per-workspace setup) instead of a shrug. *(placeholder — edit before submitting)*

## D-016: Overdue-scan cap semantics and the daily email number
Status: Proposed by agent
Date: 2026-10-02
Context: You asked for "a hard cap on the overdue scan: if more than 20 trips would be flagged in one run, flag them but send at most 5 emails and log the rest." That sentence doesn't fully specify two things I had to decide to write the code: (1) whether "flag" and "send at most 5" apply to the same count — newly-overdue trips this tick — or to a broader backlog including trips an earlier run already flagged but couldn't email because of a prior cap hit, and (2) D-008 calls for "a global daily email cap" with no number attached.
Options considered for (1): (A) cap applies only to trips transitioning out→overdue in this exact tick, and any trip a prior run deferred is simply dropped (never retried); (B) cap applies to the full backlog of overdue trips with no alert attempt yet (this tick's new ones plus any carried over), and deferred trips retry automatically next tick once budget allows. For (2): any positive integer; picked 25.
Choice: (1) B — `src/cron.ts`'s `alertCandidates` is every trip with `status: 'overdue'` and no `alertSentAt`, not just this tick's newly-flagged set; the cap (`PER_RUN_EMAIL_CAP = 5`, kicking in once the backlog exceeds `FLAG_CAP_THRESHOLD = 20`) governs how many of those get an email attempt this run, and the rest are logged (`console.log`, visible via `deepspace logs`) and simply picked up again next run since they're still `alertSentAt`-empty. (2) `DAILY_EMAIL_CAP = 25`.
Why: (1) Option A silently drops a real alert forever just because it lost a race for budget one minute — that's a worse failure mode than "arrives a minute or two late," and self-healing retry costs nothing extra to implement since it falls out of querying by `alertSentAt` presence rather than tracking a separate "already considered" set. (2) 25/day is generous for a demo (a reviewer clicking "Quick test trip" repeatedly won't hit it) while still being a real ceiling, not a decoration — needed a concrete number to write the code and this is defensible, not load-bearing the way the 20/5 split from your instruction is.
Tradeoff accepted: A trip stuck in the deferred bucket retries every minute indefinitely until budget frees up or it's checked in — there's no backoff. At demo scale this never matters; at real scale it would need a backoff or a max-defer count.
Would revisit if: The 25/day number turns out wrong in either direction during testing, or a trip visibly retries for an uncomfortably long time in a demo.
Mark's call: The 20/5/25 numbers are mine — picked generous enough that normal demo clicking during review never trips the cap, but low enough to be a real ceiling, not decoration. *(placeholder — edit before submitting)*

## D-017: Call sheet uses `generateText` + `Output.object`, not `generateObject`
Status: Proposed by agent
Date: 2026-10-02
Context: M3 needs the model to return structured data (`script: string`, `missingInfo: string[]`), not free text — hand-parsing JSON out of a text response is exactly the kind of fragile thing a schema-typed call should avoid. The AI SDK (`ai` v7.0.107, already a dependency) ships the obvious-looking `generateObject` for this, but its own installed type declaration (`node_modules/ai/dist/index.d.ts`) marks it `@deprecated Use generateText with an output setting instead`.
Options considered: (A) `generateObject({ model, schema })` — the familiar/older API, deprecated in this installed version; (B) `generateText({ model, output: Output.object({ schema }) })`, reading the typed result off `result.output` — confirmed via the same `.d.ts` to be the current, non-deprecated path, with `result.output` typed from the zod schema and throwing `NoOutputGeneratedError` on failure (caught by the existing try/catch, falling back to the template).
Choice: B.
Why: Deprecated-but-present APIs in a hand-authored demo project are exactly the kind of thing worth getting right the first time rather than fixing later — this was free to check (one grep in the installed types) before writing the call.
Tradeoff accepted: None — same zod schema, same call shape either way; this only changes which top-level function is called.
Would revisit if: A future `ai` package upgrade removes `Output.object` or changes `result.output`'s shape (the `AI SDK 7 migration` doc would cover it).
Mark's call:

## D-018: Weather location string is "Trail, OR, US", not "Lost Creek Lake"
Status: Proposed by agent
Date: 2026-10-02
Context: D-005 named Lost Creek Lake, Oregon as the default location, but `openweathermap/current` and `openweathermap/geocoding` both resolve named places only (confirmed live: both `location` and `q` on `current` behave identically — plain city-name lookups, not lat/lon coordinates; passing `"42.6484582,-122.8105998"` as `location` still 404s with "city not found"). Neither endpoint has an entry for "Lost Creek Lake" itself — it's a reservoir, not an incorporated place, and `openweathermap/geocoding` returns `[]` for it.
Options considered: (A) a nearby incorporated town that actually sits on the lake, (B) pick different, larger, more "findable" Oregon city further from the lake (e.g. Medford) and accept the location drift, (C) hardcode raw coordinates and hope a future endpoint version accepts them.
Choice: A — `WEATHER_LOCATION = 'Trail, OR, US'`, confirmed resolvable via a real `openweathermap/geocoding` call (`lat: 42.6484582, lon: -122.8105998`) and a real `openweathermap/current` call (returned real conditions: 61.25°F, "few clouds").
Why: Trail is the small community right at the lake/dam, so weather there is a far better proxy for "conditions at Lost Creek Lake" than a city 20+ miles away in the Rogue Valley (option B) — and option C doesn't work against the live API as verified above.
Tradeoff accepted: The board's weather reading is technically "Trail, OR" conditions, not literally lake-surface conditions — close enough for a demo, not something to represent as precise marine data.
Would revisit if: OpenWeatherMap's catalog ever adds coordinate-based lookup to this endpoint, or a more precise station near the lake becomes resolvable.
Mark's call:
