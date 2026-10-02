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
