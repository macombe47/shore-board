# Shore Board: project brief

*Working title. Pick a final name before deploying. It becomes the `<name>.app.space` address.*

## One sentence

A live shore-side board for a small fleet (sailing school, club, rental dock, guided paddle trip) that shows every boat that's out, flags any boat that misses its return time, and alerts the people on shore watch with a ready-to-use call sheet.

## Why it exists

When several boats are out, the shore team needs one shared, current picture: who's out, how many people aboard, where they planned to go, when they're due back. Paper sheets and group texts go stale. The dangerous moment is a boat that's quietly late and nobody notices. Existing float plan apps are mostly built for one boater and their personal contacts, not a shore team watching a fleet together.

Mark's background: USCG 100-ton Master, commercial jet boat operations, runs a small sailing school. The problem is real to him.

## Users and roles

- **Dock lead (app owner, admin):** controls settings and scheduled-task controls.
- **Shore watch (signed-in members):** log departures, check boats in, see alerts, opt in to alert emails.
- Reviewers will sign in with Google or GitHub and act as shore watch members.

## The important path (must work flawlessly)

1. Shore watch logs a departure: vessel name, vessel description (type, color, length), skipper, persons aboard, planned area or route, expected return time.
2. Every signed-in viewer sees it on the board instantly.
3. On return, anyone on watch checks the boat in. It updates for everyone.
4. If a boat passes its return time without check-in, a scheduled task flags it **overdue** (red, top of board) within about a minute and sends **one** alert email to opted-in watch members.
5. An AI-generated call sheet appears on the overdue card. Resolving (checking in) the boat clears the alert for everyone.

## Features by milestone

**M1: Live board.** Trips collection, board grouped by status (Overdue / Out / Returned today), departure form, check-in, event timeline per trip (departed, checked in, flagged overdue, alert sent, resolved). "Add sample fleet" button creates a few clearly labeled sample trips with staggered return times.

**M2: Overdue + alerts.** Cron every 1 minute. Idempotent: store `alertSentAt`, never send twice. Email via the platform's Resend integration. Alert opt-in per member. Global cap on alert emails per day. "Quick test trip (2 min)" button. Cron controls owner-only.

**M3: AI call sheet.** Background job triggered when a trip goes overdue. Inputs: trip fields, event timeline, latest weather. Output: a short script for calling 911/Coast Guard/sheriff, plus a "missing information" note. Template fallback if AI fails. The alert never waits on AI.

**M4: Weather + presence.** Cron every 30 minutes fetches weather for one configured location (default: Lost Creek Lake, Oregon) via OpenWeatherMap, stored in one record and synced to all clients. "On watch now" list via `usePresence`.

## Explicitly out of scope (and why)

| Cut | Why |
|---|---|
| GPS tracking / live maps | Big scope, needs device location and background tracking. The board works from the plan and check-ins. |
| SMS alerts | US carrier registration can take days. Email through the platform needs no key management. |
| Multiple organizations / fleets | One board per deployment keeps permissions simple. Teams are a clear next step. |
| Native mobile app | The web app works on phones. |
| Automatic calls to authorities | A human must make that call. The app supports it, never replaces it. |

## Guardrails

- A visible banner: "Demonstration project. Not a substitute for a filed float plan or calling for help."
- AI never says whether conditions are safe. It summarizes data only.
- Sample data only. No real customers, students, or Combe Sailing records. No code or content from any client project.
- Times stored in UTC, displayed in the board's time zone (America/Los_Angeles).
- Owner-billed calls (AI, email, weather) are auth-gated and rate-limited.

## Definition of done

A stranger can open the live URL, sign in, add a 2-minute test trip, watch it go overdue on two screens, receive one email, read a sensible call sheet, check the boat in, and see everything clear. The writeup explains the tradeoffs honestly.
