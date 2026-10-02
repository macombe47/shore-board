# Requirements checklist

Source: the DeepSpace build exercise brief and its "What we look for" rubric. Fill in the **Evidence** column as you go: a commit, a test name, a screenshot, or a sentence about what you checked.

## Submission (all required)

| Requirement | Status | Evidence |
|---|---|---|
| Live URL on `<name>.app.space` | [x] | https://shore-board.app.space (deployed 2026-10-02, commit e1bc772) |
| Repository link, accessible to reviewers (public) | [x] | https://github.com/macombe47/shore-board (public, D-014) |
| Note: what I built | [ ] | |
| Note: which DeepSpace integrations I used | [ ] | |
| Note: the main tradeoff | [ ] | |
| Note: what the agent did | [ ] | |
| Note: what I verified myself | [ ] | |
| Submitted before Mon Oct 5, 11:59 PM ET (target: Sunday night) | [ ] | |

## Build rubric

| Rubric item | How this project meets it | Status | Evidence |
|---|---|---|---|
| Sensible scope for five days | One important path, explicit cut list in PROJECT_BRIEF | [ ] | |
| Deployed result works on its important path | Depart, live sync, check-in, overdue, one email, call sheet, resolve | [ ] | |
| Unfinished edges explained honestly | "What's next" section in writeup | [ ] | |
| Technical depth through working flows | Real-time shared board, scheduled detection, background AI job, server-validated status changes | [ ] | |
| Integrations used where useful; omissions explained | Resend, OpenWeatherMap, AI (Claude via platform). Explain why no SMS, maps, payments | [ ] | |
| "At least three integrations" (helpful bar) | Three external, plus platform primitives: auth, records, permissions, presence, cron, jobs, server actions | [ ] | |
| Not a basic tracker; adds something meaningfully new | Fleet-level shared watch plus automatic escalation, not a personal log | [ ] | |
| Code is understandable | Small files, clear names, comments on non-obvious choices | [ ] | |
| Secrets protected | No keys in repo, `.dev.vars` ignored, integrations via platform proxy | [ ] | |
| Owner-billed actions protected | Auth-gated calls, owner-only cron controls, email caps | [ ] | |
| Platform primitives used, not rebuilt | Records, permissions, presence, cron, jobs, integration proxy | [ ] | |
| Writeup covers tradeoff, agent's role, my verification | BUILD_LOG + DECISIONS feed the writeup | [ ] | |

## Rules from the brief

| Rule | Status |
|---|---|
| No confidential information from any employer, school, or client (sample data only; nothing from the tutor client project) | [ ] |
| Coding agent allowed: show how I directed it, verified its work, and took over | [ ] |

## Live session readiness (next round)

The rubric says they'll watch you:

| Skill | How to prepare | Ready |
|---|---|---|
| Explain and modify the submitted work | Read every file once. Make several changes by hand. | [ ] |
| Read errors, form a hypothesis, test it | Log each real bug in BUILD_LOG as guess → test → result | [ ] |
| Think aloud and ask useful questions | Practice narrating one small change out loud | [ ] |
| Direct AI tools deliberately and verify output | Keep using plan mode; record rejections in DECISIONS | [ ] |
| Respond constructively to review | Milestone 5 self-review; note what you changed and why | [ ] |

Also prepare for GTM questions: who would use DeepSpace, how developers find it, and how you'd turn this project into a tutorial or demo.
