# Sync — Push Commits Left by a Cowork Bridge Session

This is a utility, not a numbered audit phase — run it any time, in any order,
whenever a Cowork/remote-devices bridge session (the claude.ai side, not this
local Claude Code) says it made local commits it couldn't push. See CLAUDE.md,
"Where Code Changes Actually Get Committed and Pushed," for why that session
can't push reliably and why this handoff exists at all.

To run it: tell local Claude Code "run phases/SYNC_push_pending_commits.md".

---

## Step 1 — See what's actually sitting there before pushing blind

```bash
git -C "$(dirname "$0")" status --short --branch
git -C "$(dirname "$0")" log origin/main..HEAD --oneline
```

(Adjust the path if you're not running this from the repo root — the point is
`git status --branch` and `git log origin/main..HEAD`.)

If `git status --branch` doesn't show `ahead N`, there's nothing to push —
stop here and say so; don't force a push that has nothing to do.

If it does show commits ahead, read each commit's full message
(`git show --stat <hash>` or just `git log -p origin/main..HEAD` for the full
diff) before pushing — this is still a real code change reaching the live
site, not a rubber stamp. Confirm the diff matches what the commit message
claims, the same way any of the numbered phases would.

## Step 2 — Confirm the working tree is otherwise clean

```bash
git status --short
```

Anything showing as modified-but-uncommitted (not the same as "ahead of
origin") means something is unfinished — stop and ask before pushing,
don't commit on someone else's behalf to force a clean push.

## Step 3 — Push

```bash
git push
```

## Step 4 — Confirm it actually landed

```bash
git fetch origin --quiet
git status --short --branch
```

Should now show no `ahead`/`behind` — `main...origin/main` with nothing
after it. If `golf_bet_tracker.html` or `index.html` were part of what
pushed, spot-check the live site
(https://raw.githubusercontent.com/RuGinzo13/golf-bet-tracker/main/index.html
is a fast way to confirm the exact bytes that are actually live, bypassing
any GitHub Pages cache) for whatever the commit message says changed.

---

**When done:** report which commit(s) got pushed, in one line each (hash +
first line of message), and confirm the working tree is clean and in sync
with `origin/main`. If Step 1 found nothing to push, that one-line report is
just "nothing pending."
