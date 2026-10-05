# Requirements checklist

Source: the DeepSpace build exercise brief and its "What we look for" rubric. Fill in the **Evidence** column as you go: a commit, a test name, a screenshot, or a sentence about what you checked.

## Submission (all required)

| Requirement | Status | Evidence |
|---|---|---|
| Live URL on `<name>.app.space` | [x] | https://shore-board.app.space (deployed 2026-10-02, commit e1bc772) |
| Repository link, accessible to reviewers (public) | [x] | https://github.com/macombe47/shore-board (public, D-014) |
| Note: what I built | [x] | `docs/WRITEUP.md`, "What I built" |
| Note: which DeepSpace integrations I used | [x] | `docs/WRITEUP.md`, "DeepSpace pieces I used, and why" |
| Note: the main tradeoff | [x] | `docs/WRITEUP.md`, "The main tradeoff" |
| Note: what the agent did | [x] | `docs/WRITEUP.md`, "What the agent did" |
| Note: what I verified myself | [x] | `docs/WRITEUP.md`, "What I verified or changed myself" |
| Submitted before Mon Oct 5, 11:59 PM ET (target: Sunday night) | [ ] | — still your action |

## Build rubric

| Rubric item | How this project meets it | Status | Evidence |
|---|---|---|---|
| Sensible scope for five days | One important path, explicit cut list in PROJECT_BRIEF | [x] | D-002; M1-M4 shipped, nothing beyond |
| Deployed result works on its important path | Depart, live sync, check-in, overdue, one email, call sheet, resolve | [ ] | Everything works except delivery of the email itself — platform-side limit (D-015, F-002), demoable via the in-app banner + the timeline's own "would have sent" preview instead. Leaving unchecked rather than overstating it — your call on how to frame this to reviewers. |
| Unfinished edges explained honestly | "What's next" section in writeup | [x] | `docs/WRITEUP.md`, "What's unfinished and what I'd do next" |
| Technical depth through working flows | Real-time shared board, scheduled detection, background AI job, server-validated status changes | [x] | M1-M4, verified live each milestone |
| Integrations used where useful; omissions explained | Resend, OpenWeatherMap, AI (Claude via platform). Explain why no SMS, maps, payments | [x] | `docs/WRITEUP.md`; cuts explained in D-002 |
| "At least three integrations" (helpful bar) | Three external, plus platform primitives: auth, records, permissions, presence, cron, jobs, server actions | [x] | email/send, openweathermap/current, anthropic/chat-completion — all confirmed via real calls |
| Not a basic tracker; adds something meaningfully new | Fleet-level shared watch plus automatic escalation, not a personal log | [x] | Shared real-time board + automatic overdue detection + AI call sheet, not a personal log |
| Code is understandable | Small files, clear names, comments on non-obvious choices | [x] | One schema/action/component per file; comments on the non-obvious calls (D-011, D-013, etc.) |
| Secrets protected | No keys in repo, `.dev.vars` ignored, integrations via platform proxy | [x] | `.gitignore`; no key ever committed, checked before every commit |
| Owner-billed actions protected | Auth-gated calls, owner-only cron controls, email caps | [x] | D-011 (owner-only cron), D-008/D-016 (caps) |
| Platform primitives used, not rebuilt | Records, permissions, presence, cron, jobs, integration proxy | [x] | No custom auth, queue, or scheduler code anywhere |
| Writeup covers tradeoff, agent's role, my verification | BUILD_LOG + DECISIONS feed the writeup | [x] | `docs/WRITEUP.md` + `docs/BUILD_LOG.md` + `docs/DECISIONS.md` |

## Rules from the brief

| Rule | Status |
|---|---|
| No confidential information from any employer, school, or client (sample data only; nothing from the tutor client project) | [x] |
| Coding agent allowed: show how I directed it, verified its work, and took over | [x] |

## Live session readiness (next round)

The rubric says they'll watch you:

| Skill | How to prepare | Ready |
|---|---|---|
| Explain and modify the submitted work | Read every file once. Make several changes by hand. | [x] |
| Read errors, form a hypothesis, test it | Log each real bug in BUILD_LOG as guess → test → result | [x] |
| Think aloud and ask useful questions | Practice narrating one small change out loud | [x] |
| Direct AI tools deliberately and verify output | Keep using plan mode; record rejections in DECISIONS | [x] |
| Respond constructively to review | Milestone 5 self-review; note what you changed and why | [x] |

Also prepare for GTM questions: who would use DeepSpace, how developers find it, and how you'd turn this project into a tutorial or demo.
