# Build log: what the agent did vs. what I did

One entry per work session. Five minutes at the end of each session. This feeds the writeup directly.

Template:

```
## Session N: <date>, <rough time spent>
Goal:
What I asked the agent: (paste or summarize the key prompt)
What the agent did:
What I verified, and how: (which windows, accounts, buttons, what I saw)
What I changed or rejected myself, and why:
Bugs: symptom → my hypothesis → how I tested it → result
Decisions logged: D-0XX
Commits:
```

---

## Session 0: 2026-09-30, planning (Claude chat, not Claude Code)
Goal: Understand the task, pick an idea, confirm the platform can support it.
What I asked: Pressure-test my float plan idea and a teaching-based alternative; verify four platform capabilities.
What Claude did: Read the DeepSpace docs source and examples. Confirmed email via a Resend integration callable from cron, cron down to every minute with a manual trigger, a weather integration (OpenWeatherMap) plus the NWS option, and usePresence for online lists. Proposed reframing single-skipper float plans into a fleet shore board, and drafted this kit.
What I decided myself: Chose the shore board over the classroom tool (D-001).
Still to verify in Milestone 0: exact integration endpoint names and fields, since the docs copy reviewed was from July and the catalog couldn't be queried from Claude's environment.

## Session 1: 2026-10-02, ~2 hours
Goal: Verify the platform pieces the plan depends on before writing any code, then build M1 (live board).
What I asked the agent: Verify real endpoint names and signatures against the live platform rather than docs prose (cron, AI, presence, owner-only cron, the GitHub-vs-DeepSpace source question), and propose a plan before coding. After approving the plan, told it to spend five minutes checking whether Gmail or Slack could deliver alerts with no extra setup before I'd accept Resend's limits, create two test accounts, and start a friction log.
What the agent did: Found a stale docs example (resend/send-email → the real endpoint is email/send) and confirmed the owner-only cron model needed a custom check, not just admin-only. Ran real test sends and found the shared Resend integration can only deliver to the platform operator's own address — not usable for real alerts yet. Confirmed Gmail (per-user OAuth) and Slack (per-workspace token) both need setup we don't have either. Built the trips/trip-events schemas, the departure form, the status-grouped board, check-in, sample-fleet/quick-test-trip actions, and the Playwright spec for the live two-user path.
What I verified, and how: Two signed-in browser windows on /board — logged a departure in one, watched it appear live in the other with no refresh, checked it in from the second window, watched it move to "Returned today" in both.
What I changed or rejected myself, and why: Didn't accept "email doesn't work" at face value — made the agent rule out Gmail/Slack first so the eventual decision (D-015) rests on a real comparison, not a shrug.
Bugs: none — the Resend limitation is a platform constraint, not our code; logged as friction instead (F-001, F-002).
Decisions logged: D-010 through D-014 (proposed by agent this session)
Commits: e1bc772 (bundled with Sessions 2-4's work into one commit during the Session 4 submission pass — nothing was committed incrementally along the way)

## Session 2: 2026-10-02, ~1.5 hours
Goal: Build M2 — overdue-scan cron, alert emails, owner-only cron admin, per-member opt-in, alert caps.
What I asked the agent: Build M2 as approved, with the owner-only restriction, per-member opt-in, and the 20/5/25 cap numbers.
What the agent did: Built the overdue-scan cron (every minute), the owner-only /ws/cron role check (D-011), the settings opt-in toggle, and the two-level alert cap (D-016). Found and fixed a real bug itself: the opt-in toggle wrote correctly but displayed wrong for my (owner/admin) role, because admin's read policy returns every user row, not just mine — it added debug logging, confirmed the write was succeeding, and fixed the lookup rather than guessing.
What I verified, and how: Signed in as the owner and as a test account in two windows. Used Quick test trip plus the owner-only Run now on /cron-admin to force an overdue flag, and watched the timeline record a real alert attempt and its (honest) delivery failure. Confirmed the non-owner test account saw no trigger/pause/resume controls at all.
What I changed or rejected myself, and why: Hit a 404 on /cron-admin that the agent's own earlier testing hadn't caught — sent it back to root-cause it rather than accepting a restart as the fix; it found a stale Vite dependency cache issue (F-003).
Bugs: /cron-admin 404'd right after I'd watched it get created and work → hypothesis: broken route → agent found the real cause was `node_modules/.vite` going stale across `dev kill`/`dev start` cycles → tested by clearing the cache and restarting → fixed, documented in FRICTION_LOG.md.
Decisions logged: D-011, D-016
Commits: e1bc772 (same bundled commit — see Session 1's note)

## Session 3: 2026-10-02, ~2 hours
Goal: Add the AI-generated call sheet on an overdue trip, with a template fallback, never blocking the alert.
What I asked the agent: Build M3 as a background job, decoupled from the alert path.
What the agent did: Found the AI SDK's generateObject is deprecated in the installed version and used the current generateText + Output.object API instead (checked the installed types rather than assuming). Wrote the prompt to forbid inventing facts or judging safety, require a fixed safety disclaimer, and handle "weather not available yet" honestly since M4 hadn't shipped. Enqueued the job from the cron task the moment a trip is flagged overdue, in a separate Durable Object so a slow or failed AI call can't delay the alert.
What I verified, and how: Logged a trip with real detail and a past return time, used the owner-only /cron-admin Run now to flag it immediately, and read the actual generated call sheet text — confirmed it only used facts I'd entered, said weather wasn't available, and ended with the required safety sentence.
What I changed or rejected myself, and why: Nothing to push back on — the first draft matched what I wanted.
Bugs: none.
Decisions logged: D-017
Commits: e1bc772 (same bundled commit — see Session 1's note)

## Session 4: 2026-10-02, ~1.5 hours
Goal: Add the 30-minute weather fetch and "on watch now" presence list, wire weather into the call sheet now that it exists, then actually ship the submission.
What I asked the agent: Build M4, then write the submission note and get the app deployed and public.
What the agent did: Found that "Lost Creek Lake" isn't a geocodable place (it's a reservoir, not a town) — verified live against the weather API and used Trail, OR instead, the town that actually sits on the lake. Built the weather-refresh cron, the on-watch-now and weather-chip components, and updated the call-sheet job to report real weather as a plain fact now that it exists. Then committed everything, deployed to shore-board.app.space for the first time since the initial scaffold, created and pushed the public GitHub copy, and drafted docs/WRITEUP.md.
What I verified, and how: Weather chip and on-watch-now list showed real data immediately on load. Logged one more overdue trip and confirmed its call sheet stated real conditions near Trail, OR instead of "not available." Loaded the live production URL after deploy to confirm it showed the real app, not the old scaffold placeholder.
What I changed or rejected myself, and why: Asked for the display name to read "Shore-Board" instead of the lowercase technical name — kept the URL itself unchanged since subdomains can't be capitalized.
Bugs: none this session (the Vite-cache issue from Session 2 had already been root-caused).
Decisions logged: D-018
Commits: e1bc772 (M1-M4 build), 3742b5a (writeup), 9909736 (display name)
