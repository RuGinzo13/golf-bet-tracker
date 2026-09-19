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
