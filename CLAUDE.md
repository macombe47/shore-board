See [AGENTS.md](./AGENTS.md).
## Project rules for this build (Shore Board)

**Read first:** `docs/PROJECT_BRIEF.md` and `docs/REQUIREMENTS.md`. Use the DeepSpace skill and docs for real SDK signatures. Never guess an API.

**Working style**
- Plan before coding. For each milestone, propose the files you'll touch and the approach, then wait for approval.
- Small steps. One milestone at a time. Stop at the end of each milestone so I can test it.
- Use platform primitives (records, permissions, presence, cron, integrations, server actions, background jobs) instead of rebuilding them. If you think a primitive doesn't fit, say why before working around it.
- Keep code readable for a reviewer: clear names, small files, a short comment where a choice isn't obvious.

**Decisions**
- When you make a non-trivial choice (data shape, library, which primitive, a tradeoff), add an entry to `docs/DECISIONS.md` using the template there, marked `Status: Proposed by agent`. Do not mark anything Accepted. I do that.

**Safety and secrets**
- Never commit `.dev.vars`, `~/.deepspace/*`, or any key or token.
- Owner-billed integrations (email, AI, weather) must only be callable by signed-in users, and cron trigger/pause/resume must be restricted to the app owner.
- The overdue alert must never depend on the AI call succeeding.

**Verification**
- After each milestone, tell me exactly how to verify it by hand (two browser windows, which buttons, what I should see).
- Extend the scaffolded Playwright specs, including the multi-user `users` fixture, for the core path.
- If something fails, state your hypothesis before changing code.
