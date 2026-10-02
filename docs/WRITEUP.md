# Shore Board — submission note

Live URL: **https://shore-board.app.space**
Repository: **https://github.com/macombe47/shore-board** (reviewable copy; the app itself deploys from DeepSpace source — see D-014 in `DECISIONS.md`)

---

**What I built**

A live shore-side watch board for a small fleet — a sailing school, club, or rental dock — where shore watch logs who's out, sees the board update instantly for everyone watching, and gets an automatic red flag plus an AI-drafted call sheet the moment a boat misses its return time. Test it in two minutes: sign in, open `/board`, click **"Quick test trip (2 min)"**, and watch it flag Overdue on its own within a minute (or sign in as the account that owns the app and use `/cron-admin`'s **Run now** to skip the wait) — the call sheet and an overdue banner both appear live, with no refresh.

**DeepSpace pieces I used, and why**

- **Records + permissions + real-time sync** — `trips`, `trip-events`, `weather`, and an extended `users` collection. The board is genuinely real-time: two signed-in browsers see every departure, check-in, and overdue flag the instant it happens, with row-level permissions (members read/write the shared board, only the owner can delete) doing the access control instead of app code.
- **Server actions** — `logDeparture`, `checkInTrip`, `createQuickTestTrip`, `createSampleFleet` each write a trip and its first timeline event atomically, server-side, rather than as two racy client writes.
- **Scheduled tasks (cron)** — `overdue-scan` every minute (flags overdue trips and dispatches alerts, capped two ways so a flood can't run up the bill) and `weather-refresh` every 30 minutes, both running as the app owner via `buildCronContext`.
- **Background jobs** — the AI call sheet runs as a job in a separate Durable Object from the cron task that triggers it, specifically so a slow or failed AI call can never delay the overdue alert.
- **Presence** — `usePresence` drives the "On watch now" list on the board.
- **Integrations** — Resend (`email/send`) for overdue alerts, OpenWeatherMap (`openweathermap/current`) for conditions near the fleet's lake, and Claude Haiku (`anthropic/chat-completion` via `createDeepSpaceAI`) for the call sheet, with a deterministic template fallback when the AI call fails.

**What I deliberately left out**

- **SMS** — carrier registration can take days; email needs no key management and ships through the platform's integration proxy.
- **GPS/live maps** — big scope, needs device location and background tracking; the board works from the plan and check-ins, not live position.
- **Multiple organizations** — one board per deployment keeps permissions simple; teams are a clear next step, not this version.
- **Automatic calls to authorities** — a human must always make that call. The app prepares the script; it never dials.

**The main tradeoff**

I built the entire alert pipeline exactly as designed — cron-driven detection, one-attempt-per-trip idempotency, per-member opt-in, and a two-level cap (defer past 20 backlogged trips, hard ceiling of 25 emails/day) — and proved every piece of it fires correctly. But the platform's `email/send` integration runs on a shared Resend account that's in Resend's unverified sandbox mode: a real, billed test send confirmed it can only deliver to the account owner's own address, not to any real recipient, for any app using that shared integration (I logged this as `docs/FRICTION_LOG.md` F-002, with the exact commands and errors). Rather than build around that by guessing at a workaround, I kept the real pipeline and made the in-app overdue banner — red, top of board, live for every viewer — the channel that's actually demonstrable end-to-end today. The trip's own timeline is honest about it: expand an alerted trip and you'll see the exact delivery failure recorded there, not hidden.

**What the agent did**

Full scaffold review and a verification pass before writing any code (checked real endpoint names, cron/jobs/AI signatures, and the cron-ownership model against the live platform rather than the docs' prose, which caught a stale endpoint name — F-001). Built all four milestones: schemas, server actions, cron tasks, the background job, and the UI, plus Playwright specs covering the live two-user path. Ran real, billed test calls at every milestone rather than assuming — paid test emails that surfaced F-002, a forced cron run and a real Claude Haiku call to prove the call sheet, and a stray UI bug it found and fixed itself (the settings opt-in toggle was silently reading the wrong row for the owner's `admin` role, since `admin`'s read policy returns every user row, not just its own — confirmed the write was succeeding and only the display was wrong before changing anything). Handled the commit, deploy, and the GitHub mirror for this submission.

**What I verified or changed myself**

I set the numbers the agent couldn't invent on its own — the 20-trips/5-emails cap, and that weather had to wait for M4 while the call sheet still had to degrade gracefully without it in the meantime. When the agent reported that the platform's shared email integration couldn't deliver to real recipients, I didn't take "email doesn't work" as final — I had it check whether Gmail or Slack could cover the gap with zero extra setup before I'd accept keeping email and leaning on the in-app banner instead. They couldn't (both need per-user or per-workspace auth), so I kept the design as proposed.

I found a real bug myself during hand verification: after M2 shipped, I hit a 404 opening `/cron-admin` that the agent's own testing hadn't caught — it had only verified the route right after creating the file, not after a clean restart. That sent it back to root-cause it (a stale Vite dependency cache that survives a plain server restart), and it turned out to be a recurring issue, not a one-off — it resurfaced during the M3 session too, from switching between `test run` and `dev start`. Both are now logged in `FRICTION_LOG.md` with exact repro steps.

I verified every milestone in two signed-in browser windows before letting it move on: M1's departure form syncing live between two tabs, M2's overdue flag and cron-admin owner-only gating, M3's actual AI-generated call sheet text (not just that *a* call sheet appeared — I read what it said and confirmed it stuck to facts I'd entered and didn't invent anything), and M4's weather and presence showing real data on load.

**What's unfinished and what I'd do next**

- Real email delivery — blocked on the platform side (F-002), not on my code; next step is either a platform fix or a developer-suppliable Resend key.
- SMS escalation after N minutes unanswered.
- Multi-fleet / teams, so one deployment can serve more than one organization.
- Skipper self-check-in from their own phone, not just shore watch checking them in.
- A configurable weather location instead of the one hardcoded lake-adjacent town (D-018).

**Safety note**

Demonstration project. Not a substitute for a filed float plan or calling for help.
