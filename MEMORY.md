# MEMORY.md — Golf Bet Tracker

---

## Session Summary, May 11, 2026

**Worked on:** Full growth strategy and product vision from scratch.
No code written this session — pure strategy, market research, and architecture planning.

**Completed:**
- Defined core pain point: the math, not payment settlement
- Built freemium monetization model with correct premium gate
- Researched competitive landscape (Beezer, Golf Bettor, GolfSnap, Golf Wager)
- Designed claim-later multi-player ownership model
- Defined real-time sync vision (3 usage modes)
- Assessed native app path — deferred, validate first
- Created and delivered CLAUDE.md for local Claude Code project

**In progress:**
- No current code tasks in progress
- Validation (getting real users) not yet started

**Decisions made:**
- Pain point = math. No fintech ever.
- Individual golfer market first. Not B2B.
- Free: last 3 rounds summary. Paid: full history + cross-round analysis.
- Claim-later model = multi-player ownership + primary growth loop
- Real-time sync = core product differentiator, needs Supabase rebuild
- No native app until web app is validated with real users
- Product identity: personal betting ledger across all groups

**Next session:**
Pick up with building the live dashboard view (current bet standings per hole,
updating as scores are entered — works in solo mode before real-time is built).
This is the most impactful near-term feature and doesn't require a backend rebuild.
Then plan the Supabase migration architecture.

---

## May 11, 2026 — Core Product Decisions

**What was decided:** The product is a math/tracking tool only. No payment rails.
**Why:** Pain point is calculation complexity, not payment friction. Venmo already
solves settlement. Fintech adds compliance surface and complexity with no user value.
**What was rejected:** Payment integration, transaction fees.

---

## May 11, 2026 — Monetization Gate

**What was decided:** Freemium. Free = last 3 rounds summary. Paid = full history
+ season stats + head-to-head records + bet-type performance + export.
**Why:** The value that makes people pay is insight across rounds over time, not
detail of a single past round. "I'm up $340 against Dave across 9 rounds" is
worth paying for. Hole-by-hole detail from last Tuesday is not.
**What was rejected:** Time-based gate (5 days — wrong trigger for golf cadence),
group size limits (kills growth loop), history detail only gate (low actual value).

---

## May 11, 2026 — Claim-Later Model

**What was decided:** Scorekeeper runs round as normal. Post-round, players receive
a link, create an account, and claim the round into their personal history.
**Why:** All 4 players need to own their data for premium features to have value.
Requiring all 4 accounts upfront kills adoption. Claim-later removes friction
at the moment of play while still enabling full multi-player ownership.
**What was rejected:** Pre-registration requirement, single-owner round model.

---

## May 11, 2026 — Native App Deferred

**What was decided:** No native app build until web app is validated with real users.
Continue with Claude Code on the web app. React Native + Expo is the right path
when the time comes.
**Why:** Zero dev experience + product complexity + unvalidated market =
most expensive way to find out nobody uses it. App Store discovery matters
at 500-5,000 users, not at 0-50.
**What was rejected:** Lovable (wrong for this complexity), bare React Native
(toolchain nightmare solo), Swift (full rewrite + new language), native now
(premature without validation).

---

## May 11, 2026 — Real-Time Sync Vision

**What was decided:** Real-time is optional, not required. Three modes: post-round
entry, during-round solo, live connected. Requires Supabase backend rebuild.
Cart screen integration rejected.
**Why:** Courses have bad cell coverage. Forcing live mode kills adoption.
Cart screens are closed proprietary systems requiring enterprise partnerships.
Phone-based sync achieves the same goal with zero hardware dependency.
**What was rejected:** Cart screen integration, forced live mode, URL-based sync
(already failed — see errors.md).

---

## Session Summary, September 18, 2026

**Worked on:** Full documentation catch-up. No feature code changed. Reviewed all
local and cloud-project docs, reconciled them against actual git history and current
`golf_bet_tracker.html`, and rebuilt the docs to reflect ground truth.

**Completed:**
- Reconstructed the Jul 24 – Aug 13, 2026 build history from `git log`/`git diff` (10
  commits, zero of which had been logged anywhere) and wrote it into summary.md's
  Feature Log
- Found and fixed a real content mix-up: local `summary.md` held product-vision content
  that belonged in `CONTEXT_UPDATE.md`; the actual technical build log that CLAUDE.md's
  `@./summary.md` include expects was never in the local folder at all, only in the
  cloud project. Split them apart correctly.
- Reconstructed CLAUDE.md's referenced-but-missing "errors.md Bug 1–5" entries from code
  evidence (clearly marked as reconstructed, not recovered — no committed history exists
  to recover from)
- Identified and logged 7 unresolved issues, 2 of them newly found this session (dead
  API key exposed in public source; docs/source code never committed to git — this
  includes `golf_bet_tracker.html` itself, the stated single source of truth)
- Identified a live violation of Critical Coding Rule #2 (`_feeSelHtml` closure inside
  `rResults()`) — same pattern as the original Bug 5, recurred

**In progress:**
- Docs are now current as of Sep 18, 2026. No code fixes applied yet — this was a
  read/document pass only, at the user's request, before starting new updates.

**Decisions made:**
- Doc backfill takes priority over new feature work until the docs match reality —
  otherwise every future session reasons from a stale snapshot, which is exactly what
  happened for three months here.
- The Jul–Aug reconstruction is treated as authoritative going forward, since the
  original session-by-session record is unrecoverable (never committed).

**Next session:**
Pick up with whatever update Ross specifies next. Before touching Dots, Junk, 6/6/6, or
Nassau math, read the new Jul 24 – Aug 13 entry in summary.md's Feature Log first — the
payout model for Dots/Junk changed twice in that window and is easy to re-break if
assumed unchanged from the original April build. The 7 unresolved issues in errors.md
are candidates for the next few sessions' cleanup work, particularly the uncommitted
git history (single point of failure) and the dead API key (cheap, high-value fix).

---

## September 18, 2026 — Decided: 7-Phase Stale/Dead-Code/Calculation Audit

**What was decided:** Before any new features, run a 7-phase cleanup pass via local
Claude Code in VS Code: (1) repo hygiene — get everything committed, clear the stale
git lock, (2) remove dead code + the exposed API key, (3) audit API/sync health +
PWA cache staleness, (4) re-verify every bet calculation against its stated rule,
(5) fix `_feeSelHtml` and any other closure-in-render violations, (6) full end-to-end
flow test, (7) close the loop — log fixes to errors.md/summary.md/MEMORY.md and commit.
**Why:** The Sep 18 doc catch-up surfaced enough real issues (uncommitted source,
exposed key, two undocumented rule rewrites, a recurring architecture-rule violation,
an unverified migration window) that "just start building the next feature" would be
building on ground that hasn't been checked. Sequenced so foundation (git, security)
comes before verification (calc correctness) comes before new work.
**What was rejected:** Jumping straight into product roadmap work (claim-later,
premium gate, etc.) without first confirming the existing MVP's math and
infrastructure are sound — that's how three more months of undocumented drift happens.

---

## Session Summary, September 18, 2026 — 7-Phase Audit Executed (Phases 1–7)

**Worked on:** Ran the full 7-phase audit decided above, across two sittings ("run
phase 1-3" then "run phase 4-7 sequentially"). Full detail in errors.md; condensed
version in summary.md's Sep 18 Feature Log entry.

**Completed:**
- Phase 1: got `golf_bet_tracker.html` and every `.md` doc under git for the first
  time ever; cleared a stale `.git/index.lock`.
- Phase 2: removed the exposed API key + its dead fallback code path, and `doReset()`
  (a sign-out handler never wired to any UI element — confirmed with Ross before
  deleting).
- Phase 3: audited `/sync/save`/`/sync/load` and `sw.js` — documented real security
  gaps (open CORS, no PIN rate limiting, unsalted hash) and cache-staleness risk,
  neither fixed yet (deliberately audit-only).
- Phase 4: verified all 10 bet-calc/settlement functions against their stated rules
  via hand-tracing plus a 20,000-trial randomized zero-sum test (run through
  `osascript -l JavaScript` since no Node was available). **No money-math bugs** —
  found 3 adjacent issues instead (stale 6/6/6 description, dead `BT.junk` stake
  fields, a fee/exclude silent no-op).
- Phase 5: fixed all 3 Phase 4 findings (Ross chose "fix all 3" when asked) plus the
  `_feeSelHtml` closure violation and a second instance found in the same grep
  (`flowArrow`) — 4 separate commits.
- Phase 6: ran the real save/load/calc code against stubbed storage (steps 1–7 of
  the checklist, all pass) and tested cloud sync against the actual live Worker
  (step 8). **Found the live Worker doesn't match the repo's `golf_proxy_worker.js`
  at all** — it's missing `/sync/save`/`/sync/load` entirely, meaning cloud sync has
  likely never worked in production since it shipped May 11. Confirmed Claude Code
  has no path to redeploy it (no wrangler/API token/authorized connector). Asked
  Ross how to proceed; he asked me to try the redeploy and fall back to noting it if
  I couldn't — I couldn't, so it's logged as the top item in errors.md Known Issues.
- Phase 7: this entry, plus dated entries in summary.md/errors.md and an updated
  CLAUDE.md Known Architectural Debt list (removed resolved items, added the Worker
  deploy gap).

**Decisions made:**
- When Phase 4/5's gate ("human must review before fixing money-math findings")
  came up, asked Ross via a scoped question rather than either fixing everything
  unilaterally or blocking entirely — he chose "fix all 3." Worth repeating this
  pattern: audit phases that explicitly call for human judgment on real bugs get a
  quick check-in even under a "run phases N-M" blanket instruction; mechanical
  phases (audits that found nothing, or pure doc updates) don't.
- Did not attempt the Cloudflare Worker redeploy via guesswork or ask Ross for
  credentials/tokens — confirmed no available path first, then reported that
  clearly rather than either faking progress or stalling on it.

**In progress / next session:**
- **Top priority: redeploy `golf_proxy_worker.js` via the Cloudflare dashboard.**
  Nothing else in this project is currently broken for users the way this is.
- Everything else flagged in errors.md's Known Issues list (as of this session:
  Worker redeploy, `/sync` security gaps, `migrateRecentRounds()` 7-day window,
  Dots/Junk changelog gap, PWA icons, KV conflict resolution, no sign-out UI,
  `deploy.sh` not `git add`ing `golf_bet_tracker.html`) is a candidate for a future
  cleanup session — none of it is money-math-correctness-critical the way the
  original 7-phase decision was concerned about, since Phase 4 came back clean.
- No roadmap work (claim-later, premium gate, Supabase rebuild) started — this
  audit was explicitly meant to happen before that, not instead of it.

---

## September 19, 2026 — Decided: Worker deploy moves to CI (GitHub Actions), not a one-time manual redeploy

**What was decided:** Instead of just redeploying `golf_proxy_worker.js` once
via the Cloudflare dashboard to fix the Phase 6 finding, built a permanent
CI/CD pipeline (`wrangler.toml` + `.github/workflows/deploy-worker.yml`) that
auto-deploys the Worker on every push to `main` that touches it. Requires
Ross to do two one-time setup steps (Cloudflare API token + 2 GitHub secrets)
before it activates — see errors.md Known Issues #9 / phases/PHASE_8.
**Why:** The root cause of the 4-month silent outage wasn't a missed deploy,
it was that deploy required a human to remember a manual dashboard step with
zero enforcement and zero drift detection. A one-time fix leaves the same
failure mode in place for the next Worker change. Riding the existing
`git push` habit (already used by `deploy.sh` for the frontend) means the
Worker can't silently diverge from the repo again — there's no new habit to
build, just one that already exists doing double duty.
**What was rejected:** A one-time manual dashboard redeploy (fixes the
symptom, not the cause — same drift can recur). A local `deploy-worker.sh`
wrapper around Wrangler (still depends on a human remembering to run it,
same failure class as the dashboard, just with a nicer command). Asking the
Cloudflare MCP connector to do it directly — confirmed it has no deploy tool
in its surface, not a matter of trying harder.


---

## September 19, 2026 — Decided: Git credential moved off plaintext URL storage

**What was decided:** The repo's git remote URL had a GitHub token embedded
directly in it (`https://user:token@github.com/...`), stored in plaintext in
`.git/config`. Fixed the remote-devices bridge session's copy immediately
(stripped the token from the URL, moved credential storage to that session's
own global git config instead of the shared repo file). Added Phase 9 Step
3a instructing Ross's real local machine to do the equivalent fix there —
`gh auth setup-git` if the GitHub CLI is installed, otherwise `git config
--global credential.helper osxkeychain` plus one interactive push to seed
Keychain — since that's the machine that actually runs deploys.
**Why:** A token sitting in a plaintext file inside the project folder is
readable by anything that reads the folder — backups, zips, screen shares —
not just deliberate attackers. Moving it to a credential helper (Keychain or
gh's own store) keeps the secret out of any file that travels with the
project. Also recommended revoking the specific exposed token, since it has
now been displayed in a chat transcript — a different, additional exposure
surface beyond the original file-storage issue.
**What was rejected:** Leaving it as-is because "it's a local file, not a
public commit" (true, but backups/screen-shares/zips of the project folder
are a real transmission path, and this project has already been burned once
by treating "not technically public" as "safe enough" — see the GCAPI_KEY
history). Also rejected: writing the fix only from the remote-devices bridge
session and calling it done — that session's filesystem is not the same
machine that runs real deploys, so the fix had to be handed off as an
explicit instruction for Ross's actual local Claude Code session too.

---

## September 19, 2026 — Decided: Claude now self-maintains MEMORY.md/errors.md without a /close trigger

**What was decided:** The Claude Projects project instructions that used to
define the MD-maintenance workflow (MEMORY.md/errors.md format, `/close`
session-log output) were removed by Ross from the project's instructions.
Going forward, this repo's Claude sessions maintain MEMORY.md, errors.md,
and CONTEXT_UPDATE.md proactively — reading them before acting, and writing
entries for decisions/fixes/findings as they happen — without waiting for an
explicit `/close` command or being told each time to log something.
**Why:** Ross removing the instruction doesn't mean the need for a running
decision/error log went away — it's been load-bearing for this project
since May (the Sep 18 doc catch-up session exists specifically because three
months went by with zero entries while code kept shipping). Rather than
silently dropping the practice because the formal trigger disappeared, or
asking every single session whether to log something, defaulting to "keep
doing it, in the same format these files already use" avoids a repeat of
that exact failure mode.
**What was rejected:** Stopping doc maintenance entirely since it's no
longer explicitly instructed (this is exactly the kind of manual-habit
dependency that already failed once for this project — see errors.md's
"Session Summary, September 18, 2026 — Codebase Catch-Up" and the Worker
CI/CD entries' broader lesson: don't depend on someone remembering to do a
thing, make it structural). Also rejected: asking Ross for sign-off on every
individual doc update going forward — logging findings/decisions as they
happen is the same class of action as the decisions themselves, not a
separate thing that needs its own approval each time.


---

## Session Summary, September 19, 2026 (cont'd) — Phase 9 Closed Out, Credential Incident Resolved

**Worked on:** Closing out Phase 9 (course search fix) after a parallel
local session had already applied and pushed the actual code changes.
Independently re-verified everything rather than taking the parallel
session's summary at face value, per standing preference for checked claims
over trusted ones.

**Completed:**
- Verified the live code fix two independent ways: local git history/diff
  inspection, and a direct raw-GitHub fetch of the deployed `main` branch
  file (bypassing cache) confirming the fixed `pickCourse()` logic is
  genuinely serving live, not just committed.
- Verified the exposed GitHub token is actually dead after Ross revoked it —
  re-ran the same push test that had worked earlier in the session and
  confirmed it now fails authentication. Not assumed, tested.
- Cleaned up (Ross deleted) the leftover `Claude outputs/` scratch
  directory. Repo working tree is fully clean, in sync with `origin/main`.
- Documented the full credential-exposure-to-resolution arc in errors.md:
  the original plaintext-token-in-URL finding, the mistake of pasting the
  literal token into doc files as a "revoke this" reference (caught by
  GitHub's push protection before it reached the remote), the redaction,
  and the final confirmed revocation.

**Decisions made:** None new this stretch — this was verification and
close-out work following decisions already logged (credential storage
fix, self-maintained MD docs).

**Next session:** Phase 9 is fully closed, nothing pending from it. No
other work has been requested yet — check errors.md's Known Issues list
(still open: `migrateRecentRounds()` 7-day window, `/sync` security gaps,
PWA icons, KV conflict resolution, no sign-out UI) for candidates if Ross
wants to pick something up, but don't start any of it unprompted.


---

## September 19, 2026 — Decided: 1v1 bet types (Nassau H2H, Match Play) get pairwise stroke allocation, not field-relative

**What was decided:** Added a `NETPair(p1,p2)` helper and rewired
`nassauHoles()`, `nassauLiveState()`, and a new `matchRun()` helper (used by
`matchCalc()` and 3 duplicate inline blocks) to use it instead of the shared,
field-relative `NET()`. This isolates any two-player Nassau H2H or Match
Play matchup from being influenced by a third player's handicap. Left the
Scores table, 2v2 Nassau, Wolf, 6/6/6, and 5-3-1 on the shared `NET()`
unchanged — those are genuine group formats that need one consistent net
score per player.
**Why:** Ross reported (and this session reproduced with the real code) that
a Nassau H2H matchup's total stroke count was always right, but WHICH holes
that advantage landed on shifted depending on who else was in the round —
because every player's strokes were computed relative to the whole field's
lowest handicap, not relative to just the two players actually in that
matchup. Confirmed with an isolated single-hole test that this can flip a
specific hole from halved to won (or vice versa) for identical gross scores,
and that a full front-9 win/loss tally genuinely differs between the old and
fixed code for the same scorecard. This is a real settlement-correctness
bug, not a cosmetic one — it can change which player actually gets paid on
a Nassau or Match Play bet whenever 3+ players with different handicaps are
in the round, which is the normal case, not an edge case.
**What was rejected:** Leaving `nassauHoles`/`matchCalc` on the shared
`NET()` and treating the "total strokes still add up" fact as sufficient
(it isn't — the total is a red herring here, since `d1-d2` always equals
`hcp1-hcp2` regardless of the reference point; only the per-hole allocation
actually determines who wins). Also rejected: rewriting `NET()` itself to
be pairwise — that would break every group-format bet (Scores table, 2v2
Nassau, Wolf, 6/6/6, 5-3-1), which correctly depend on one shared net score
per player across the whole round.
**Not yet committed/pushed** — see errors.md for the full write-up and
verification detail. Confirm with Ross before shipping, per standing
practice for real-money-math changes.
