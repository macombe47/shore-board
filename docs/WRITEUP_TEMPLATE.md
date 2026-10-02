# Submission note (template)

Target: about one page. Write it like a short developer post: someone curious about DeepSpace should learn something from it. That's the GTM part of the job showing.

---

**What I built**
Two or three sentences. Who it's for, the problem, the important path. Link the live URL and say how to test it in two minutes ("Sign in, press Quick test trip, wait two minutes...").

**DeepSpace pieces I used, and why**
For each: what it does in the app, and why it was the right primitive.
- Records + permissions + real-time sync:
- Server actions:
- Scheduled tasks (cron):
- Background jobs:
- Presence:
- Integrations: Resend (email), OpenWeatherMap (weather), AI model:

**What I deliberately left out**
SMS, GPS/maps, multi-organization, payments: one line each on why they wouldn't improve this version. (From DECISIONS D-002, D-003.)

**The main tradeoff**
Pick one and explain it honestly. Likely candidate: one-minute cron polling plus email instead of SMS. It's simple, cheap, and reliable, but slower to notice than a text.

**What the agent did**
Plain summary from BUILD_LOG: scaffolding, schema, UI, tests, first drafts.

**What I verified or changed myself**
The most convincing section. Specific examples: a bug you caught and how you diagnosed it, an agent proposal you rejected and why, how you confirmed only one email sends, code you rewrote by hand.

**What's unfinished and what I'd do next**
Honest list. For example: SMS escalation, multi-fleet support with teams, check-in by the skipper's own phone.

**Safety note**
One line: demonstration only, not a substitute for a filed float plan or calling for help.
