# Phase 1 — Repo Hygiene

Run this first. Everything after it depends on git actually working and
tracking these files.

---

Before any code changes: check `.git/index.lock` in this project — if it
exists and is stale, remove it so git commands work. Then confirm via
`git status` and `git log --oneline -- <file>` for each of
golf_bet_tracker.html, CLAUDE.md, summary.md, errors.md, MEMORY.md,
CONTEXT_UPDATE.md, SETUP.md, deploy.sh that they've truly never been
committed (per errors.md "Known Issues" #1). Add a .gitignore for
.DS_Store and the .claude/ folder. Then commit everything currently on
disk as-is in one commit: "Bring source and docs under version control
(previously uncommitted since project start)". Do not modify any file
content in this phase — pure git hygiene. Report the final
`git log --oneline -5` and `git status` when done.

---

**When done:** confirm with Ross before moving to Phase 2. Do not start
Phase 2 automatically.
