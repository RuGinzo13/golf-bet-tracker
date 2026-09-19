# ERRORS.md — Session Summary Additions

## Session Summary, May 11, 2026

---

## Strategic Planning — Monetization Gate

**What didn't work:** Time-based gate (5 days). Wrong trigger for a sport played
1-2x per week. One viewing session before the gate hits is not enough to feel value.

**What worked:** Depth-of-history gate. Free tier = last 3 rounds summary. Paid =
full history + cross-round analysis. Locks what people actually want to pay for
(season insight) not what they'll rarely revisit (old hole-by-hole detail).

**Note for next time:** When designing freemium gates, ask "how often does the
user actually return to this content?" not just "is this content premium?"
Golf cadence is weekly, not daily. Triggers must match usage frequency.

---

## Strategic Planning — Native App Assessment

**What didn't work:** Assuming native app is the right near-term move.
Zero dev experience + product complexity + zero validated users = wrong time.

**What worked:** Honest assessment. Continue Claude Code web app development.
Validate with real users first. Native (React Native + Expo) is the right
path eventually but not before the product is proven.

**Note for next time:** Never recommend a major platform rebuild before the
product has validated users. Discovery problems are real but solvable through
word of mouth at 0-50 users. App Store matters at 500-5,000.

---

## Market Research — Competitive Landscape

**What didn't work:** Assuming the golf betting app space was a vacuum.
It is not. Beezer Golf, Golf Bettor, GolfSnap, Golf Wager all exist with
native apps, real-time features, and App Store presence.

**What worked:** Actual search before making any competitive claims.
Per GolfClaude.md: never fill gaps with plausible-sounding information.

**Note for next time:** Always search before making competitive positioning claims.
The market may be more developed than assumed. Differentiation must be specific
and defensible — not just "we do it better" but "we do something they don't."

Confirmed gaps vs. competitors:
1. UX simplicity (competitors are complex)
2. Personal ledger across all groups (unique positioning)
3. Claim-later ownership model (not seen in any competitor)

---

## Architecture Planning — Claim-Later Model

**What didn't work:** Single-owner round model for multi-player premium features.
If only the scorekeeper owns the round, other players have no personal history.
Premium features (season stats, head-to-head records) require individual ownership.

**What worked:** Claim-later model. Scorekeeper runs round, others claim via
post-round link. Removes friction at play time while enabling full ownership.
Also creates the organic growth loop: 1 round = 4 acquisition events.

**Note for next time:** Multi-player products need to solve the "who owns the data"
question before designing premium tiers. Ownership model determines whether
premium features have actual value for all users.

---

## Platform Planning — Cart Screen Integration

**What didn't work:** Cart screen integration concept. Most golf cart screens
are closed proprietary systems (Visage, GPS Industries, Club Car Tempo).
Cannot run arbitrary code without enterprise hardware partnerships.

**What worked:** Reframing to phone-based real-time sync. Same experience,
zero hardware dependency, works at every course, works for walking rounds.

**Note for next time:** When a feature requires proprietary hardware partnerships,
always look for the software-only equivalent that achieves the same user goal.
The user was right about the desired experience (real-time for all players),
wrong about the delivery mechanism (hardware vs. software).

---

## Session Summary, September 18, 2026 — Codebase Catch-Up

Docs had not been touched since May 11, 2026 while the app kept shipping through
mid-August. This session reconciled the docs with actual code/git state. Entries below
are grouped by what was found.

---

## Reconstructed — CLAUDE.md's "errors.md Bug 1–5" References

CLAUDE.md's Critical Coding Rules cite five numbered bugs ("See errors.md Bug 2", etc.)
that do not exist anywhere in this file — only the May 11 strategic-planning entries
above exist. `git log` confirms errors.md has never been committed, so there is no
older committed version to recover either. These bugs are real (the fixes are visibly
present in the current code and match the May feature log — e.g. the May 9 entry "Fixed
input cursor-jump bug" in summary.md is clearly Bug 2 below) but the original
write-ups are gone. Reconstructed from code + feature-log evidence, not recovered —
flagging per GolfClaude.md's own rule against filling gaps with plausible-sounding
information.

**Bug 1 — Par 3 Clock used net score instead of gross**
**What didn't work:** Par 3 Clock initially displayed/scored using handicap-adjusted
net score. Confirmed fixed in the May 8 feature log entry ("Par 3 Clock fix: Was
showing net score instead of gross").
**What worked:** `p3cCalc()` now always reads gross via `parseInt(GR[cp][hi])`.
**Note for next time:** any bet tracking a real-world event (closest to pin, sandy,
hole-in-one) must use gross score. Only stroke-play and match-play bets use net.

**Bug 2 — `oninput` on fee fields destroyed input focus**
**What didn't work:** Fee amount fields used `oninput`, which fires every keystroke.
Each keystroke triggered a full `render()` DOM rebuild, which destroyed focus —
confirmed in the May 9 feature log entry ("Fixed input cursor-jump bug").
**What worked:** Switched to `onchange` (fires on blur/Enter, not per keystroke) on all
fee/config inputs. Scorecard cells are the one deliberate exception — they use `oninput`
paired with targeted DOM mutation instead of `render()`, so focus survives.
**Note for next time:** `oninput` + `render()` is never safe. Either use `onchange`, or
if live-as-you-type is required, mutate the DOM directly and skip `render()` entirely.

**Bug 3 — Player iteration assumed indices 0–3**
**What didn't work:** Code that assumed all 4 player slots were active and iterated
0–3 directly breaks once a round has fewer than 4 players or specific slots disabled.
**What worked:** `ais()` (active player index list) is the only correct way to iterate
players; used consistently in the current calc pipeline (`nassauCalc`, `dotsCalc`,
`junkCalc`, etc. all call `ais()` rather than hardcoding a range).
**Note for next time:** never assume array position implies "active." Group size is
variable (2–4) and any slot can be off.

**Bug 4 — Fee math didn't net to zero**
**What didn't work:** An earlier fee-splitting calculation left the sum of all players'
fee adjustments nonzero, meaning the "who owes what" ledger didn't reconcile.
**What worked:** Payer gets `+amount − their own share`; everyone else gets
`−their share`. Verified in the current `feesTotal()` — the sum across active players
is always zero by construction.
**Note for next time:** any settlement-style calculation (fees, dots pot, junk pot) must
be checked for exact zero-sum before shipping. The Aug 1/13 Dots and Junk pot-splitting
code follows this same discipline — it explicitly distributes leftover cents so the
leaders' credits sum to the pot exactly (`base+(k<extra?1:0)` pattern).

**Bug 5 — Helper functions defined inside `rResults()`**
**What didn't work:** `mkBetCard`, `mkBalGrid`, `mkSettleTxns` were originally defined
as closures inside `rResults()`, re-created on every render call — confirmed in the May
10 feature log entry ("Architecture refactor... were re-defined as closures inside
`rResults()` on every render").
**What worked:** Extracted to module-level functions with dependencies passed in
explicitly.
**Note for next time:** this exact pattern has recurred since — see "`_feeSelHtml`
closure" below. The rule needs to be checked on every new render-function addition, not
just fixed once.

---

## Real Bugs Found and Fixed, Jul 24 – Aug 13, 2026 (undocumented at the time)

**Bet Math — 6/6/6 Team Scoring**
**What didn't work:** `s666Calc()` computed each team's per-hole score as the SUM of
both partners' net scores (`net[t1[0]][h]+net[t1[1]][h]`). Standard 6/6/6 (like all
best-ball formats) uses the LOWER of the two partners' scores, not the sum. Any 6/6/6
round played before the Aug 1 fix was scored under this non-standard rule, and — because
`migrateRecentRounds()` only re-scores rounds saved in the last 7 days — any 6/6/6 round
saved more than 7 days before Aug 1, 2026 still shows results computed under the broken
sum-based rule and will never be corrected automatically.
**What worked:** Changed to `Math.min(net[t1[0]][h], net[t1[1]][h])` vs. the same for
team 2 — one-line fix, single commit (`5bc1635`).
**Note for next time:** best-ball scoring bugs are easy to miss because the app still
produces *a* number — it just isn't the number the stated rule promises. Cross-check new
bet-math against the plain-English rule description shown in Setup before shipping.

**Display — Dollar amounts rounded to whole dollars**
**What didn't work:** `fm()` used `Math.round(v)`, so every displayed dollar amount —
stakes, results, ledger totals — was silently rounded to the nearest whole dollar. A
$2.50 stake would render as "$3" or "$2" with no indication cents were dropped.
**What worked:** Replaced with `amt$()`/`fm()` using `Math.round(v*100)/100` (cent
precision) and proper decimal formatting.
**Note for next time:** confirm whether pre-fix saved rounds have cent-accurate
underlying `state`/math (likely yes — this looked like a display-layer bug in `fm()`,
not a data-storage bug) or whether the rounding happened before storage. Worth a
five-minute check next time this file is opened, since it affects whether historical
rounds need re-verification.

---

## Process Failure — Local `summary.md` Held the Wrong Content

**What didn't work:** The local folder's `summary.md` (loaded automatically by
CLAUDE.md's `@./summary.md`) contained the product-vision/roadmap content that belongs
in a doc called `CONTEXT_UPDATE.md` (and does, in the cloud project). The actual
technical build log — state model, calc pipeline, feature history — that CLAUDE.md's
architecture rules assume exists in `summary.md` was never present in the local folder
at all; it only ever existed as a same-named doc in the cloud project. Any local Claude
Code session reading `@./summary.md` for the last several months was reading product
strategy, not architecture/build history.
**What worked:** Sep 18, 2026 — moved the vision/roadmap content to `CONTEXT_UPDATE.md`
locally (matching the cloud project's existing doc of that name) and rewrote local
`summary.md` with the correct technical content, including the reconstructed Jul–Aug
feature log above.
**Note for next time:** when a doc gets dropped into the local project folder from the
cloud project, verify the filename actually matches its counterpart doc, not just that
"a file with that name exists." A silent content swap like this is invisible unless
someone reads the full file.

---

## Session Summary, September 18, 2026 (cont'd) — Phase 1 & 2 (Repo Hygiene, Dead Code)

**Phase 1 — Repo Hygiene.** Removed a stale, zero-byte `.git/index.lock` (confirmed no
git process held it via `ps`/`lsof` — only Spotlight's `mdworker` had it open for
reading). Confirmed via `git log --oneline -- <file>` that all 8 files listed in the
"Known Issues" #1 entry above had genuinely never been committed. Added `.gitignore`
for `.DS_Store` and `.claude/`, unstaged `.DS_Store` itself (now ignored, not tracked).
Committed all 8 files plus `CONTEXT_UPDATE.md` and the new `phases/` directory in one
commit.

**Phase 2 — Dead Code & Exposed Secret.**
- Removed the plaintext `API_KEY` fallback and the entire direct-fetch branch in
  `apiFetch()` (Bearer-then-`x-api-key` retry against `api.golfcourseapi.com`
  directly). `API_BASE` var removed too — it was only referenced from the deleted
  branch. `apiFetch()` now takes a single `proxyPath` argument (the `directSuffix`
  second argument was always dead once the direct branch is gone) and throws a clear
  "Course search not configured" error if `PROXY_URL` is unset, instead of silently
  falling back to a client-side key. Both call sites (`csSearch`, `pickCourse`)
  updated to drop the now-unused second argument.
- Full-file dead-code scan (every top-level `function` and `var` checked for
  reference count beyond its own declaration): found exactly one genuinely dead
  function, `doReset()` — a sign-out handler that cleared `profile`/`syncPin` and
  logged the user out, but was never wired to any UI element (no `onclick="doReset()"`
  anywhere in either `golf_bet_tracker.html` or `index.html`). Confirmed with Ross
  before deleting (per this phase's instructions) — deleted. **Note:** this means the
  app currently has no way for a user to sign out / switch profiles from the UI at
  all; if that's wanted, it needs a button wired to a reset function, not just
  restoring the deleted one blind.
- No leftover `DOTS_RULE_FLAG`/`JUNK_RULE_FLAG`-style naming found — the single
  `RULE_FLAG` pattern described in summary.md's Architecture section is already
  consistently used everywhere; nothing to clean up there.
- `golf_bet_tracker.html` copied to `index.html` (deploy.sh convention). Not pushed —
  that's a live-site deploy action, left for Ross to trigger via `./deploy.sh` or an
  explicit push request.

---

## API & Sync Audit — September 18, 2026 (Phase 3, audit-only — no fixes applied)

Scope: `golf_proxy_worker.js` and how `golf_bet_tracker.html` talks to it. Per this
phase's instructions, nothing below was changed in code — findings only.

**1. golfcourseapi.com route shape — still current.**
Checked `golfcourseapi.com/changelog/`: latest entry is **v1.1.0 (Sep 13, 2026)**,
described as "purely additive" — it adds `location.latitude`/`location.longitude` to
`GET /v1/search` and `GET /v1/courses/{id}` responses, no breaking changes, no
authentication changes. Those are exactly the two paths `golf_proxy_worker.js` calls
(`BASE_URL + '/search?search_query=...'` and `BASE_URL + '/courses/' + id`). The
proxy route still matches the live API shape. Could not get the full endpoint/param
reference from `api.golfcourseapi.com/docs` — that page renders client-side and
WebFetch only sees the empty shell, so this is confirmed from the changelog, not a
full spec diff. If Ross wants full certainty, log into the golfcourseapi.com dashboard
directly and check the docs there.

**2. `/sync/save` and `/sync/load` security gaps — real, undocumented until now.**
- **CORS is wide open** (`Access-Control-Allow-Origin: '*'` in `golf_proxy_worker.js`
  `CORS` const). Any website can call `/sync/save` and `/sync/load` directly from a
  visitor's browser — there's no origin restriction limiting calls to
  `ruginzo13.github.io`.
- **No rate limiting on PIN attempts.** `/sync/load` takes `user` + `pin`, hashes the
  PIN with SHA-256, and compares — with no attempt counter, no lockout, no delay.
  Client-side, the PIN field only enforces a **minimum of 4 characters**
  (`golf_bet_tracker.html` `doLogin()`: `pin.length<4`) and is `inputmode="numeric"`
  as a mobile-keyboard hint only — nothing stops a non-numeric PIN, and nothing is
  enforced server-side either. A 4-digit numeric PIN is 10,000 combinations; combined
  with wide-open CORS and no rate limit, any known or guessed username (`user:` +
  lowercase name — usernames are effectively public, they're just first names people
  type in) is brute-forceable in a small number of requests from anywhere.
- **PIN hashing is bare, unsalted SHA-256** (`sha256(String(pin))` in the Worker).
  Since PINs are short and numeric-ish, this is not meaningfully different from
  storing them in plaintext against offline attack (rainbow table over 10,000 4-digit
  values is instant) — it only protects against a casual glance at the raw KV value.
- **Impact if exploited:** an attacker who brute-forces a PIN gets that user's full
  synced state (`profile`, `sG` roster, all `rounds`) via `/sync/load`, and can
  overwrite it via `/sync/save` (last-write-wins, no ownership check beyond the PIN
  match). Not financial data — this app explicitly does not move money — but it is
  personal round history and could let someone silently corrupt another user's data.
- **Not fixed in this phase per instructions.** Candidate fixes for Ross to weigh
  (none implemented): rate-limit `/sync/load` by IP+user in KV (e.g. exponential
  backoff after N failures), restrict CORS to the known GitHub Pages origin, salt the
  PIN hash (a per-user random salt stored alongside `pinHash`), and/or require a
  longer minimum PIN client- and server-side.

**3. `sw.js` cache-first staleness — confirmed, propose-only per instructions.**
`sw.js`'s fetch handler (`return cached || networkFetch`) serves the cached
`index.html`/app shell immediately if present, and only updates the cache in the
background for the *next* load. Combined with `self.skipWaiting()` +
`self.clients.claim()` in `install`/`activate`, a new service worker takes control of
open tabs immediately, but the page itself was already served from the old cache on
that load — so a bet-math rule change (like the Aug 1/13 Dots/Junk rewrite, or the
6/6/6 best-ball fix) may not actually reach a user's screen until their *second*
visit after a deploy, not their first. **Proposed fix (not implemented — needs Ross's
OK):** have the client listen for `navigator.serviceWorker.controllerchange` (fires
when a new SW takes over) and show a small "Update available — reload" banner via
`showN()`-style notification, or auto-reload once no unsaved scorecard input is
in-flight. This is a genuinely new capability (new event listener + a bit of UI), not
a one-line fix, so it's being proposed rather than applied in this audit-only phase.

**4. `GOLF_SYNC` KV binding documentation — accurate, with one adjacent stale line.**
CLAUDE.md's Known Architectural Debt entry ("KV namespace `GOLF_SYNC` must be
manually bound... App degrades gracefully to local-only if not configured") is still
correct — traced through `doLogin()`'s catch branch: a Worker 503 (`KV storage not
configured`) falls into the generic error branch, which signs the user in local-only
with a "cloud offline" notice, exactly as documented. **However**, the very next
bullet in that same section — "`golf_bet_tracker.html` hardcodes the golfcourseapi.com
key in plaintext as an unused fallback (line ~95)" — is now **stale**, since Phase 2
(this session, earlier) removed that key entirely. Not fixed here since it's a docs
edit outside this phase's stated scope (API/sync audit, not doc cleanup), but flagged
for Phase 7 (Close the Loop) or an explicit ad-hoc fix now if Ross wants it sooner.

---

## Calculation Correctness Audit — September 18, 2026 (Phase 4, audit-only — no fixes applied)

Traced `nassauCalc()`, `matchCalc()`, `wolfCalc()`, `s666Calc()`, `s531Calc()`,
`p3cCalc()`, `dotsCalc()`, `junkCalc()`, `feesTotal()`, and `settleDebts()` against
their plain-English Setup descriptions, one at a time. Also ran a 20,000-trial
randomized synthetic test (2/3/4-player rounds, all 8 bet types active
simultaneously, varied dot/junk rates including deliberately "ugly" fractional-cent
values) plus two hand-checked deterministic scenarios, against the real extracted
calc code (lines 88–614 of `golf_bet_tracker.html`, run as-is, not reimplemented) —
no Node available in this environment, so the harness ran via `osascript -l
JavaScript` (JXA), a real JS engine, not a parallel/simulated implementation.

**Result: no money-math correctness bugs found.** Every payout function matches its
stated rule and is exactly zero-sum. Max floating-point residual across all 20,000
trials (summed `betsTotal()`, `feesTotal()`, `overall()`): ~5.7e-14 — pure IEEE-754
noise, far below the app's own 0.005 cent-rounding threshold. `settleDebts()`
transactions were checked every trial to fully reconstruct each player's rounded net
balance — zero mismatches.

Specific verifications:
- **Nassau** (1v1 + 2v2 best-ball, independently toggleable) — front/back/overall
  segments pay the stake to the segment winner only on a clear win, ties pay
  nothing, zero-sum per matchup. Matches "match play... head-to-head, or as 2v2
  teams... both formats can run at once."
- **Match Play** — running net-hole tally with standard early-close-out
  (`abs(run)>holesRemaining`) or full 18; matches "lowest net wins each hole; most
  holes won takes the match."
- **Wolf** — lone wolf (1v3, win/lose 3×) and partner (2v2 best ball) branches both
  verified zero-sum and match the stated stake multiplier exactly.
- **6/6/6** — `s666SegState()` uses `Math.min()` of the two partners' net scores
  (best-ball), confirmed via a deterministic test built specifically to distinguish
  best-ball from the old Aug 1 sum-based bug (a hole where best-ball and sum-of-two
  pick opposite winners) — the fix holds. **But see Finding 1 below** — the Setup
  screen's description text was never updated to match.
- **5-3-1** — all four point-distribution branches (no tie, tie-low → 4/4/1, tie-high
  → 5/2/2, all-tie → 3/3/3) verified against the exact point values shown in Setup;
  pairwise point-difference settlement is zero-sum.
- **Par 3 Clock** — uses gross score (`parseInt(GR[cp][hi])`), compliant with
  Critical Coding Rule #4. Birdie/par/3-putt-bogey branches match the description
  exactly; a non-3-putt bogey correctly triggers no payment (there's no 4th dollar
  field for it, and the description never promises one).
- **Dots / Junk leader-take-all** — hand-verified with a deterministic 4-player
  scenario (2 tied leaders, 2 trailing players, uneven pot split) matching the exact
  expected payout to the cent, plus the 20k-trial sweep. **See Finding 2 below.**
- **Fees** — `feesTotal()` verified zero-sum (payer gets `amt−share`, everyone else
  `−share`) per Critical Coding Rule #6, across every trial. **See Finding 3 below.**
- **`migrateRecentRounds()` / `RULE_FLAG`** — traced by hand: correctly limits to
  rounds saved within the 7-day window, recomputes using the round's OWN saved
  `state` (scores/handicaps/bet-config as originally played) against the CURRENT
  code's calc functions (not the globals of whatever round happens to be open —
  `withSavedState()` swaps and restores globals explicitly), and marks each round
  with the current `RULE_FLAG` so it's never re-migrated twice under the same flag.
  Runs both at app boot and again after cloud login (since login replaces `rounds`
  wholesale with the cloud copy). No bug found.

**Finding 1 — 6/6/6 Setup description is stale, describes the pre-fix behavior.**
`golf_bet_tracker.html` ~line 1417: `"Combined net score per hole · low team total
wins hole · most holes wins segment."` "Combined" reads as a sum — which was the
Aug 1 bug this exact file already documented fixing (see "Real Bugs Found and Fixed,
Jul 24 – Aug 13, 2026" above). The code is correct (best-ball/lowest-of-two); the
text was simply never updated after the fix shipped, and has been telling users the
wrong rule ever since.

**Finding 2 — `BT.junk` carries 6 dead stake fields.**
`sandy`, `barky`, `polie`, `birdie`, `eagle`, `hio` are all still initialized with
nonzero defaults (`golf_bet_tracker.html` ~line 108) but never read by
`junkCalc()`/`junkTotals()`/`junkRate()` — only `val` (the flat per-item rate) and
`greenie` (legacy fallback for `val`) are live. This confirms the Setup UI's "every
junk item counts the same" text is accurate and intentional — it's not a payout bug
— but these 6 fields are genuine dead state. Phase 2's dead-code scan didn't catch
this because it only checked top-level functions and variables, not object
properties nested inside `BT`.

**Finding 3 — `feesTotal()` silently no-ops when a fee's payer is also excluded.**
The "Paid by" dropdown for Round Cost / Booking Fee offers every active player with
no awareness of the "Exclude from Fees" checkboxes — a user can pick the same
person for both. When that happens, `feesTotal()`'s `if(paying.indexOf(payer)<0)
return;` guard skips the entire fee: nobody is charged, the payer isn't reimbursed,
and the amount the user typed in (e.g. a real $60 round cost) simply has zero effect
on every ledger view, with no message explaining why. The math still nets to zero
(nothing charged is still zero-sum), so this isn't a wrong-number bug, but it's a
silent-no-op UX gap that could look like the app lost data.

**Ross's call (asked after this report):** fix all three in Phase 5, alongside the
mandatory `_feeSelHtml` closure extraction.

---

## Session Summary, September 18, 2026 (cont'd) — Phase 5, Fix 1: Closures in Render Functions

**What didn't work:** `_feeSelHtml` (Round & Booking Fees section of `rResults()`)
was a closure defined inside a render function — exactly the pattern Bug 5 fixed in
May, re-introduced since. Grepping the whole file for the same pattern (a `function`
declared inside a top-level `function r*(){...}` render function) while in there, per
this phase's instructions, turned up a **second, previously-unflagged instance**:
`flowArrow(fr,to,amt,color)` inside `rFlow()`, re-created on every Money Flow tab
render.
**What worked:** Extracted both to module level next to `mkBetCard`/`mkBalGrid`/
`mkSettleTxns` (golf_bet_tracker.html "Module-level helpers" section). `flowArrow`
needed no interface change — it only ever depended on its own params plus the
already-module-level `pn()`/`amt$()`. `_feeSelHtml` was renamed to `feeSelHtml` and
now takes the active-player list `a` as an explicit third parameter instead of
closing over it; the two call sites in `rResults()` were updated to pass `a`
through. No behavior change in this fix — `_selStyle`, a var that existed solely to
feed the closure, was inlined into the extracted function and removed.
**Note for next time:** the grep pattern that found both (`function r[A-Z]` as the
outer boundary, looking for a nested `  function name(` at any depth inside it)
should be re-run any time a new render function or render-section is added — this is
the second time this exact violation has recurred despite being called out as a
named rule.

---

## Session Summary, September 18, 2026 (cont'd) — Phase 5, Fix 2: Stale 6/6/6 Description

**What didn't work:** The 6/6/6 Setup screen's info text read "Combined net score
per hole" (golf_bet_tracker.html ~line 1421) — "combined" reads as a sum. That was
the exact wording left over from before the Aug 1, 2026 fix that changed the actual
scoring from sum-of-two-partners to best-ball (lower of the two). The code was
correct (confirmed in Phase 4's audit); the text was never updated when the code
was, so the app had been telling users the wrong rule for the format for six weeks.
**What worked:** Changed the text to "Best ball: lower of the two partners' net
scores counts per hole · low team score wins hole · most holes wins segment." — now
matches `s666SegState()`'s actual `Math.min()` behavior.
**Note for next time:** when a bet-math bug fix changes what a calc function does,
grep the Setup screen's description text for that bet type in the same commit — a
fixed calculation with a stale description is arguably worse than an honest bug,
since a stale description actively tells the user something false about a rule
they're trusting for real money settlement.

---

## Session Summary, September 18, 2026 (cont'd) — Phase 5, Fix 3: Dead Bet-Config Fields

**What didn't work:** `BT.junk`'s default object carried six numeric stake fields —
`sandy`, `barky`, `polie`, `birdie`, `eagle`, `hio` — left over from the pre-Aug-13
per-item-stake payout model. Since the Aug 13 leader-take-all rewrite, `junkCalc()`/
`junkTotals()`/`junkRate()` only ever read `val` (the flat per-item rate) and
`greenie` (legacy fallback for `val`) — confirmed by grep, these six fields are never
read anywhere in the app. While fixing this, found the exact same pattern one field
over: `BT.dots.grn` was never read either (only `BT.dots.fwy` is used, as `dotRate()`'s
fallback) — this wasn't called out in the Phase 4 report (that audit focused on
calc-function correctness, not a field-by-field dead-property sweep of `BT`), but
it's the identical bug class Ross had just approved removing on the `junk` side, so
it was fixed in the same commit rather than left inconsistent.
**What worked:** Trimmed `BT.junk` to `{on,val,greenie}` and `BT.dots` to
`{on,val,fwy}` (golf_bet_tracker.html ~line 107-108). Re-ran the Phase 4 20,000-trial
zero-sum test against the trimmed state — still zero real failures, confirming
nothing outside these two objects depended on the removed fields.
**Note for next time:** Phase 2's dead-code scan checked top-level functions and
`var` declarations but not properties nested inside object literals like `BT` — that
gap let both of these survive two rounds of cleanup. Worth adding "grep every key of
every top-level state object for read-sites" to the dead-code checklist next time.

---

## Session Summary, September 18, 2026 (cont'd) — Phase 5, Fix 4: Fee Payer/Exclude Conflict

**What didn't work:** The "Paid by" dropdown for Round Cost and Booking Fee offered
every active player as an option with no awareness of the "Exclude from Fees"
checkboxes, and the checkbox handler didn't check the payer fields either. A user
could pick someone as payer and then also mark them excluded (or the reverse order),
landing `RF` in a state where `feesTotal()`'s `if(paying.indexOf(payer)<0)return;`
guard silently skipped the entire fee — nobody charged, payer not reimbursed, the
dollar amount the user typed just had zero effect on every ledger view with no
explanation.
**What worked:** Made the conflict unreachable from the UI in both directions —
`feeSelHtml()` (already extracted to module level in Fix 1) now takes the exclude
list and filters excluded players out of the payer options entirely; the "Exclude
from Fees" checkbox handler was pulled out of its inline `onchange` string into a
new module-level `toggleFeeExclude(i)` that also clears `RF.roundPayer`/
`RF.bookPayer` if the player being excluded was currently set as either payer.
`feesTotal()`'s existing skip-guard was left in place (not removed) — it's still the
correct defensive fallback for any old saved round from before this fix that has the
conflicting state baked into its stored `state`.
**Note for next time:** verified with a scratch test (not just reasoning) — excluding
a payer live now clears the payer field and removes them from the dropdown; excluding
first then trying to pick them as payer isn't offered as an option at all. The old
"stale saved round" case was also tested directly against `feesTotal()` and confirmed
it still degrades to a safe zero-sum no-op rather than crashing.

**This closes out the 3 Phase 4 findings + the closure violation — Phase 5 complete.**

---

## End-to-End Flow Test — September 18, 2026 (Phase 6, test-only — no fixes applied)

No browser automation tool was available in this session, so steps 1–7 weren't
literal UI clicks — but they weren't a pure code trace either. I extracted the real
`golf_bet_tracker.html` calc/save/load functions verbatim (`storage`, `svRound`,
`loadRound`, `newRound`, `ldAll`, `migrateRecentRounds`, every calc function) and ran
them, unmodified, against a stubbed `localStorage`/`document`, via `osascript -l
JavaScript` (a real JS engine — no Node available in this environment). Step 8 was
tested against the actual live Worker over the network.

### Checklist

1. **New round setup, 4 players** — PASS. `ais()` correctly returns all 4 active
   indices after setting `P`/`numP`.
2. **All 8 bet types enabled with non-trivial stakes** — PASS. All 8 configured and
   active (`nassau` h2h+2v2, `match`, `wolf`, `s666`, `p3c`, `dots`, `junk`; `s531`
   correctly stays off since it's 3-player-only and this test used 4).
3. **18 holes incl. birdie, eagle, hole-in-one, push hole, 3-putt par-3** — PASS. Ace
   on a par-4 correctly classified as hole-in-one (not double-counted as eagle);
   eagle on a par-3 correctly resolves as an ace per real golf rules (they're the
   same score); Par 3 Clock 3-putt flag correctly produced a negative (owed) result
   for the 3-putting player.
4. **Results math for ≥2 bet types, hand-checked** — PASS. `dotsCalc()` and
   `p3cCalc()` both verified to sum to exactly zero across active players; the
   3-putting player was confirmed to owe money as expected.
5. **Save the round** — PASS. `svRound()` persisted to storage, set `editingRoundId`,
   and the round appeared in `rounds[]` — all against the real function, not a mock.
6. **Reload History** — PASS. Wiped the in-memory `rounds[]` (simulating a fresh app
   boot) and re-ran the real `ldAll()`; the round came back from storage with results
   identical to what was saved.
7. **Reopen a saved round into Setup, confirm no state corruption** — PASS.
   Deliberately corrupted live `GR`/`BT` state before calling `loadRound()`, then
   confirmed it restored the saved state (not the corrupted live state) exactly;
   confirmed re-saving an opened round edits in place rather than duplicating;
   confirmed `newRound()` fully resets `GR`/`RF`/`editingRoundId`.
8. **Cloud login/sync round-trip against the real Worker** — **FAIL. Serious,
   previously-undiscovered finding**, not a code bug:

   **The live Cloudflare Worker at `golf-proxy.rmg-1313.workers.dev` is running code
   that predates the entire cloud-sync feature — it does not match
   `golf_proxy_worker.js` in this repo, which has had `/sync/save`/`/sync/load`
   since the commit that shipped cloud login on May 11, 2026.** Evidence, tested live
   just now:
   - `GET /health` → `{"status":"ok","service":"golf-proxy"}` — no `sync` field.
     The repo's `/health` handler returns `{status:'ok', sync: !!env.GOLF_SYNC}`; the
     `"service"` key doesn't exist anywhere in the repo's worker source at all.
   - `POST /sync/save` → **405 Method Not Allowed** (plain text body, not JSON).
   - `GET /sync/load?user=...&pin=...` → **404 Not Found** (plain text body).
   - The CORS preflight (`OPTIONS /sync/save`) returns
     `access-control-allow-methods: GET, OPTIONS` — **POST is not in the allowed
     list at all.** The repo's `CORS` const explicitly includes `POST`.
   - `GET /search?q=pebble` works fine and returns real course data — the course
     search proxy is unaffected, only the sync routes are missing.

   **Practical impact:** cloud login/sync has likely never worked in production,
   possibly since the May 11 feature shipped (the dashboard deploy step in
   `CLAUDE.md`/`SETUP.md` — "paste `golf_proxy_worker.js` into the editor and Save &
   Deploy" — was evidently never done after that commit, or was reverted). Traced
   what a real user experiences: `cloudLoad()`'s `r.json()` on the 404's plain-text
   body throws a `SyntaxError`; `doLogin()`'s catch-all doesn't match that message
   against `'No profile found'` or `'Incorrect PIN'`, so it falls into the generic
   branch and signs the user in **local-only** with **"Signed in (cloud offline —
   will sync when reconnected)."** — this does NOT crash and does NOT lose data, but
   it is **permanently misleading**: it reads as a transient outage ("will sync when
   reconnected") when the real state is that sync has never been deployed at all.
   Every "new user" signup's best-effort `cloudSave()` push silently fails the same
   way (swallowed in a bare `catch(e){}`), so no profile has ever actually reached
   the `GOLF_SYNC` KV store via this Worker. Multi-device sync — a documented,
   supposedly-shipped feature — is not currently functional for anyone.

   **Not fixed here** — Phase 6 is test-only, and this isn't a code fix in this repo
   anyway: `golf_proxy_worker.js` in the repo already has the correct code. The fix
   is **Ross redeploying it** via the Cloudflare dashboard (Worker editor → paste
   current `golf_proxy_worker.js` → Save & Deploy), per `SETUP.md`. Worth
   double-checking the `GOLF_SYNC` KV binding is still attached after redeploy too,
   since that's a separate manual step from the code deploy itself.

### Summary

7 of 8 checklist items pass outright. Item 8 surfaced a real, currently-live
production gap that has nothing to do with any code in this repo being wrong — the
repo's Worker source is correct; it's simply not what's actually deployed. This is
arguably the single highest-impact finding of the whole 7-phase audit, since it means
a documented, shipped feature (cross-device profile sync) has silently not worked for
months with no error surfaced to any user.

---

## Known Issues — Unresolved (as of Sep 18, 2026)

Not fixed yet, flagged for prioritization:

1. ~~**Docs and source code not committed to git.**~~ **Resolved Sep 18, 2026 (Phase
   1).** All 8 files (`golf_bet_tracker.html` + every `.md` doc + `deploy.sh`) committed
   in one commit; stale `.git/index.lock` cleared first (confirmed no live git process
   held it), `.gitignore` added for `.DS_Store`/`.claude/`.
2. ~~**Dead API key in public source.**~~ **Resolved Sep 18, 2026 (Phase 2).** Removed
   the `API_KEY`/`API_BASE` vars and the direct-fetch fallback branch in `apiFetch()` —
   the app now only ever talks to the Worker proxy, and fails with a clear "Course
   search not configured" error if `PROXY_URL` is ever unset. **This does not undo the
   exposure** — the key (`T5G624EKF3RWOEP3M3UICPKAVI`) is still visible in every past
   commit of `index.html`. Real fix still needed: rotate the key at golfcourseapi.com
   and update the Worker's `GCAPI_KEY` secret.
3. **`migrateRecentRounds()` 7-day window.** Rounds older than 7 days at the time a
   scoring rule changes are frozen on old math permanently, with no manual recompute
   option exposed to the user.
4. **Dots/Junk payout model rewrite has no in-app changelog.** Users comparing rounds
   across the Aug 1 / Aug 13 boundary will see different math for these two bet types
   with no explanation surfaced in the app.
5. ~~**`_feeSelHtml` closure inside `rResults()`**~~ **Resolved Sep 18, 2026 (Phase
   5).** Extracted to module level as `feeSelHtml`, along with a second
   previously-unflagged instance (`flowArrow` inside `rFlow()`).
6. **PWA icons still missing** — `icon-192.png`/`icon-512.png` referenced in
   `manifest.json`, not on disk. Flagged in May, unresolved.
7. **KV last-write-wins, no conflict resolution** — unresolved since May, untouched in
   the Jul–Aug commits.
8. **No sign-out UI.** Surfaced Sep 18, 2026 (Phase 2) — the app has no way for a
   logged-in user to sign out or switch profiles from the UI. A `doReset()` function
   that did this existed but was never wired to a button and was removed as dead code;
   if sign-out/switch-profile is wanted, it needs to be built (and wired), not restored
   as-is.
9. ~~**Live Cloudflare Worker doesn't match `golf_proxy_worker.js` — cloud sync has
   never worked in production.**~~ **RESOLVED Sep 19, 2026.** Worker redeployed for
   real for the first time since April 26, 2026, via the new CI pipeline
   (`.github/workflows/deploy-worker.yml` + `wrangler.toml`). Confirmed live:
   `GET /health` now returns `{"status":"ok","sync":true}` — the `GOLF_SYNC` KV
   binding is attached and working, and the deployed code has `/sync/save`,
   `/sync/load`, and `POST` in CORS. Root cause was that Worker deployment was
   100% manual (dashboard copy-paste) with nothing enforcing it ever happened; fix
   is structural — deploy now rides the same `git push` that already happens for
   every frontend change, via CI, so this can't silently drift again. See the
   Phase 8 entry below for the full incident: two wrong values (account ID, then an
   API token that was never actually saved) before the real fix landed.

---

## CRITICAL — September 19, 2026 — Deployed Worker Is Not the Local Worker

Discovered by connecting Cloudflare's own MCP connector and reading the live Worker
directly, rather than assuming the dashboard matched the local file.

**What didn't work:** Assumed `golf_proxy_worker.js` on disk was what's actually running
at https://golf-proxy.rmg-1313.workers.dev, because summary.md's Feature Log says cloud
login was "shipped" May 11. It was written and works locally, but was never deployed.

**What was actually found:**
- The live `golf-proxy` Worker was last modified **April 26, 2026** — the day of the
  original course-search-only proxy. It has never been touched since.
- The deployed code has no `/sync/save`, no `/sync/load`, no KV usage at all — it only
  handles `/search`, `/course/:id`, and `/health`, and only allows GET (CORS
  `Access-Control-Allow-Methods: GET, OPTIONS` — no POST). Any `/sync/save` POST from
  the app 404s against this code.
- The Cloudflare account has **zero KV namespaces** — `GOLF_SYNC` was never created,
  let alone bound. Consistent with the deployed code never needing it.
- Net effect: every cross-device login / cloud sync attempt against the real deployed
  backend since May has been silently failing and falling back to local-only storage
  (the client's own error handling: "Network/worker error: fall back to local-only").
  The feature has never worked in production, only in whatever environment it was
  built and tested in.

**What worked:** Created the `GOLF_SYNC` KV namespace via the Cloudflare MCP connector
(id `8698ae17677f4f08baa9ef1a1ed9a589`) so it exists and is ready to bind. That
connector can list/inspect Workers and manage KV/D1/R2 resources, but has **no tool to
push Worker script code or attach a binding** — actual deployment still requires
Wrangler CLI or the dashboard. See PHASE_3 for the redeploy steps.

**Note for next time:** "It's in the feature log as shipped" and "it's actually running
in production" are two different claims. Verify a backend change reached the actual
deployed service before writing it up as done — a local file matching intent is not
evidence of a live deploy.

---

## Session Summary, September 19, 2026 — Cloudflare Worker CI/CD Redeploy Pipeline (Phase 8)

Ross asked how to redeploy the stale Worker (found Sep 18, Phase 6) and, critically,
how to make sure it never silently goes stale again — and whether the Cloudflare MCP
connector could just do it directly.

**What didn't work:** Assuming the Cloudflare Developer Platform connector could push
Worker code. Checked directly this session: `workers_list`, `workers_get_worker`,
`workers_get_worker_code`, and the KV/D1/R2 tools are all read/resource-management
only (confirmed by reading every tool in the connector's surface). There is no
`workers_deploy` or equivalent — the connector can inspect and confirm drift, and
manage KV/D1/R2 as resources, but cannot push script code or attach a binding to a
Worker. This is a hard capability gap, not a permissions issue — reconfirms Sep 18's
finding rather than contradicting it.

**What worked:** Used the connector for what it CAN do — confirmed via
`workers_get_worker` that the live `golf-proxy` Worker (account id
`b8dd155df0654dea955956e9ad70203f`) was last touched April 26, 2026, and via
`kv_namespaces_list` that the account had zero KV namespaces (fixed Sep 18 by
creating `GOLF_SYNC`, id `8698ae17677f4f08baa9ef1a1ed9a589`). Then, instead of a
one-time manual redeploy (which is exactly the process that already failed silently
once), built a CI pipeline so redeploy is no longer a manual step at all:
- `wrangler.toml` — declares the Worker name, entry file, and the `GOLF_SYNC` KV
  binding, so `wrangler deploy` (run by CI) produces a Worker that has the binding
  attached automatically. No more "redeploy the code" and "bind the KV" as two
  separate manual dashboard steps that can drift apart.
- `.github/workflows/deploy-worker.yml` — runs `wrangler deploy` via Cloudflare's
  official `wrangler-action` on every push to `main` that touches
  `golf_proxy_worker.js` or `wrangler.toml`, plus a manual `workflow_dispatch`
  trigger. Since `deploy.sh` already pushes to `main` for every HTML change, the
  Worker now rides the same commit/push habit that already exists — there's no new
  process for Ross to remember, just the existing `./deploy.sh` habit (or any push)
  now also keeping the backend honest.

**Note for next time:** the original failure mode wasn't "nobody redeployed it" —
it's "the *only* way to deploy it required a human to remember a manual dashboard
step with no enforcement and no drift detection." Any infra that depends on someone
remembering a manual step will eventually silently drift, exactly like this did for
4 months with zero errors surfaced to anyone. The fix for "make sure X doesn't happen
again" is almost never "be more careful next time" — it's "make the failure
structurally impossible," which here means: deploy triggered by the same action
(git push) that already happens for every other change, not a second action nobody
has a habit of doing.

**Two steps only Ross can do — nothing else blocks this from working:**
1. Cloudflare dashboard → My Profile → API Tokens → Create Token → template "Edit
   Cloudflare Workers" (scoped to this account) → copy the token. Claude cannot
   create this: it requires an interactive Cloudflare OAuth/login flow this
   environment cannot complete.
2. GitHub repo (`RuGinzo13/golf-bet-tracker`) → Settings → Secrets and variables →
   Actions → New repository secret, twice:
   - `CLOUDFLARE_API_TOKEN` = the token from step 1
   - `CLOUDFLARE_ACCOUNT_ID` = `b8dd155df0654dea955956e9ad70203f`
   Claude cannot create GitHub Actions secrets from this session — no available tool
   writes repo secrets (the git remote's push token is not sufficient/appropriate to
   reuse for this, and doing so wasn't attempted).

Once both secrets exist, the next push to `main` (or a manual run from the Actions
tab) deploys the Worker for real, for the first time since April. **Also worth
checking after the first real deploy:** confirm the `GCAPI_KEY` secret is still set
on the Worker (Cloudflare Settings → Variables and Secrets) — Worker secrets are
independent of code deploys and should survive, but this hasn't been verified live
since the account showed zero KV namespaces despite the Worker apparently having
run since April, so nothing about this Worker's config should be assumed intact
without checking.

---

## Session Summary, September 19, 2026 (cont'd) — Phase 8 First Deploy Attempt Failed: Wrong Account ID

Ross completed the 3 setup steps (workflow file via GitHub web UI, Cloudflare API
token, both GitHub secrets) and ran the verification prompt. Both the initial
workflow-file-add push and the verification-comment push triggered `Deploy Cloudflare
Worker`, and both failed in ~19s at the "Deploy to Cloudflare" step.

**What didn't work:** `wrangler.toml`'s `account_id` (`b8dd155df0654dea955956e9ad70203f`)
was wrong. It was sourced from the Cloudflare Developer Platform MCP connector's
`workers_get_worker` call, which returns a field simply labeled `id` next to the
Worker's name — this was wrongly assumed to be the Cloudflare account ID. It is not
(most likely the Worker's own internal resource ID). The connector has no tool that
lists or confirms an account ID directly, so this couldn't be caught before a real
deploy was attempted. Confirmed via the actual GitHub Actions log (pulled through the
GitHub REST API using the repo's existing push-token, since `gh` CLI isn't installed
locally and the log's real content lives behind a redirect to Azure blob storage that
this environment's network policy blocks by default):
```
ERROR   A request to the Cloudflare API (/accounts/***/workers/services/golf-proxy) failed.
Authentication failed (status: 400) [code: 9106]
```
Also confirmed independently, directly against the live Worker via the Cloudflare
connector (`workers_get_worker_code`), that no deploy had actually happened — the
live code was still byte-identical to the original April 26, 2026 version.

**What worked:** Ross pulled the real Account ID from the Cloudflare dashboard sidebar
(`bb148aa0b9c81b62e22cd305050d8810`) and confirmed it differs from what was in
`wrangler.toml`. Corrected `wrangler.toml` to the real value. **Still needs Ross to
also update the `CLOUDFLARE_ACCOUNT_ID` GitHub repo secret** to
`bb148aa0b9c81b62e22cd305050d8810` — it was set to the same wrong value originally,
since both `wrangler.toml` and the GitHub secret were populated from the same bad
source. Once both match the real account ID, re-trigger the workflow (a push touching
`golf_proxy_worker.js` or `wrangler.toml`, or a manual `workflow_dispatch` run).

**Note for next time:** don't treat an unlabeled `id` field from an API/connector as a
specific ID type (account vs. resource vs. script) without the field name or docs
confirming which — different Cloudflare resource types return different ID
namespaces that are easy to conflate, and they're all 32-char hex strings so nothing
about the value itself signals which kind it is. When a durable config value can be
grabbed from the account owner's own dashboard in 10 seconds, that's a more reliable
source than inferring it from a tool call, even when the tool call succeeds.

---

## Session Summary, September 19, 2026 (cont'd) — Phase 8 Closed: Worker Live for the First Time Since April

Three failed attempts before success, each a distinct root cause — worth recording
all three since they're different failure classes, not one bug fixed three times:

**Attempt 1 — wrong account ID.** `wrangler.toml`'s `account_id` was sourced from an
ambiguous `id` field in a Cloudflare MCP connector response, wrongly assumed to be
the account ID. Real error: `Authentication failed (status: 400) [code: 9106]` on
the account-scoped Workers API path. Fixed by Ross pulling the real ID from the
Cloudflare dashboard sidebar (`bb148aa0b9c81b62e22cd305050d8810`).

**Attempt 2 — identical error after the "fix."** Same exact 9106 error, same line,
after both `wrangler.toml` and the `CLOUDFLARE_ACCOUNT_ID` secret were corrected.
This ruled out the account ID as the (sole) cause and pointed at the token itself.

**Attempt 3 — root cause: the API token was never actually saved.** Ross discovered
the original Cloudflare API token he created hadn't been saved/copied correctly —
so `CLOUDFLARE_API_TOKEN` had been holding an invalid value the entire time,
independent of whether the account ID was right. A fresh token, created and pasted
correctly, fixed it on the next run.

**Verification, not just a green checkmark:** confirmed the actual deployed code
via the Cloudflare connector (not just GitHub Actions' pass/fail) — `/sync/save`,
`/sync/load`, `POST` in CORS all present, matching the repo's source exactly. Ross
independently confirmed `GET /health` returns `{"status":"ok","sync":true}` from
his own browser. Both checks agree: the Worker is live, matches the repo, and the
`GOLF_SYNC` KV binding is attached and functioning.

**Note for next time:** three different failures produced the same-shaped symptom
(a fast, generic Cloudflare auth rejection) — a 400/9106 error alone doesn't tell
you *which* credential is wrong, only that *a* credential is wrong. When
retrying after a believed fix produces the identical error, that's a signal the
first fix wasn't the (whole) cause, not a signal to retry the same fix harder.
Worth then checking the other credential in the pair, not just re-verifying the one
already changed.

**Resolved Sep 19, 2026 (later same day):** `GCAPI_KEY` confirmed to have survived
the redeploy — tested `GET /search?q=pebble` live and got real course results back,
not a 503. All three of Phase 6's original cloud-sync checks were also independently
re-verified live in a separate session: `GET /health` → `{"status":"ok","sync":true}`,
`POST /sync/save` → `{"saved":true}` (200, not 405), `GET /sync/load` → the exact
data just saved (200, not 404). **This closes out Phase 6 item 8 for good** — the
original end-to-end test failure from Sep 18 is fully resolved and independently
confirmed, not just reported fixed.

---

## Session Summary, September 19, 2026 — pickCourse() Always Threw on Real Results

**What didn't work:** `pickCourse()` read
`var data=courseCache[id]||await apiFetch('/course/'+encodeURIComponent(id));`.
`courseCache[id]` is unconditionally populated by `csSearch()` for every search
result *before* a user ever clicks one, so by the time `pickCourse()` ran, the left
side of `||` was always truthy — the `apiFetch(...)` on the right side never
evaluated at all. `data` was always the *search-result snippet* (e.g.
`{id, club_name, location, tees:{male:3,female:3}}` — `tees.male`/`tees.female` are
plain **counts** from `/search`), never the full course detail
(`tees.male`/`tees.female` are **arrays** of tee-set objects, only from
`/course/:id`). `extractTees()` only knows how to read the array shape, so it always
returned `[]` for the snippet, tripping `if(!sets.length)throw new Error('No
scorecard data in response')`. **Every course selection from search results has been
throwing this error** — confirmed via `git log -p` that this predates the current
session entirely (present in the very first commit of `golf_bet_tracker.html`),
so this is not a regression from any recent work, just a bug nobody had traced
before. Found because Ross pointed directly at the caching line and the comment in
`pickCourse()`, not found by this session's earlier 7-phase audit (which scoped to
bet-math correctness, not the course-search feature).
**What worked:** Only treat `courseCache[id]` as a real cache hit if
`extractTees()` can actually produce tee sets from it. If not (which is always true
right after a search), fetch the real detail via `apiFetch()` and overwrite
`courseCache[id]` with that — *now* the cache is genuinely useful for a second pick
of the same course within the same session. Verified against the live Worker with a
before/after test: old code throws `No scorecard data in response` on every attempt;
new code correctly fetches on the first pick (6 real tee sets returned for a real
course) and hits a true cache with zero extra fetch on a repeat pick of the same
course.
**Note for next time:** a cache keyed by the same ID across two API responses with
different shapes (list-summary vs. single-detail) needs the read side to verify the
cached value is actually usable for what's about to be done with it — `if(cached)`
is not the same check as `if(cached is the shape I need)`. This is the same category
of bug as `feesTotal()`'s payer/exclude conflict from Phase 4: a `||`/ternary
fallback that looks like a safe default but silently produces the wrong branch under
a real, common input shape. Worth grepping for other `X||await fetch(...)` or
`cached ? ... : []` patterns in this file for the same mistake.

**RESOLVED Sep 19, 2026 (Phase 9) — full fix, verified against real data.** A
separate session wrote `phases/PHASE_9_course_search_fix.md` covering this same bug
in more depth, without being aware the caching fix above had already landed and
been pushed — its "before" code block for that specific fix no longer matched the
file. Caught by checking the actual file before applying anything (Phase 9's own
Step 0 exists for exactly this reason: verify assumptions against real code, don't
trust a written description of what the code does). What Phase 9 added that
genuinely was still missing:
- **`csSearch()`'s dead cache write removed entirely** — the line that populated
  `courseCache[id]` from search results, whose promise ("without a second API call")
  never held for any course (proven above). Now `courseCache` starts empty and only
  ever gets populated with real, usable detail data.
- **A second bug in `pickCourse()`'s tee auto-pick, fixed:** the old loop
  (`src.forEach` over all tees, last substring match wins) had no ranking and no
  exclusion for combo tees — it could silently auto-select something like "White/
  Green Combo" over a real single "White" tee. Replaced with a priority-ordered
  `for` loop over `prefer` that explicitly skips any tee whose name contains
  "combo".
- **`deploy.sh` fixed** to `git add golf_bet_tracker.html index.html` instead of
  just `index.html` — closes the exact staging gap `summary.md`'s Deployment
  section had been flagging as a known, unfixed issue.
- **Verified end-to-end against live Pebble Beach data** (id `3j4b4ar8`), using the
  actual patched functions copied verbatim, not reimplemented: confirmed the real
  `apiFetch` call happens (count ≥1, not short-circuited), the auto-picked tee
  ("White") does not contain "Combo", and all 18 holes' `par`/`handicap` in the
  resulting `C[]` match the raw API response exactly (0 mismatches, cross-checked
  independently). A second pick of the same course then correctly hit a real cache
  with zero additional fetches — the caching optimization the original code
  promised now actually works, just correctly (only after the first real fetch,
  which is the earliest it structurally can).
**Note for next time:** when picking up a phase file another session wrote, treat
its description of "current" code as a claim to verify, not a given — same rule as
recommending anything from memory. A phase file can go stale exactly like a memory
record can.

---

## Session Summary, September 19, 2026 (cont'd) — Git Credential Stored in Plaintext, Partially Fixed Remotely

**What didn't work:** This repo's `.git/config` had a GitHub token embedded
directly in the remote URL (`https://RuGinzo13:gho_...@github.com/RuGinzo13/
golf-bet-tracker.git`) instead of being handled by a credential helper. This
was discovered while confirming git push access worked at all (it did — the
embedded token authenticated fine on a `git push --dry-run`). A token sitting
in plaintext inside a file that lives in the project folder is a real
exposure: anyone who reads `.git/config` (a folder backup, a zip of the
project, a screen share) gets push access to the repo, no separate
credential needed.

**What worked (partial — only covers the remote-devices bridge session,
not Ross's own Mac terminal/VS Code):**
- Stripped the token out of the remote URL: `git remote set-url origin
  https://github.com/RuGinzo13/golf-bet-tracker.git`. Confirmed `git remote
  -v` and `.git/config` now show a bare URL with no credential in it.
- First attempt at fixing storage set `credential.helper = store
  --file=...` at the REPO level (`git config credential.helper ...` with no
  `--global`) — this was wrong, caught immediately: repo-local config lives
  in the shared `.git/config` file that both this remote session and Ross's
  real Mac read, but the file path pointed at was specific to this remote
  session's own sandboxed filesystem (`/sessions/.../`.), meaningless on the
  real Mac. Corrected by unsetting it locally (`git config --unset
  credential.helper`) and setting it at `--global` scope instead, scoped to
  this remote session's own git config, not the shared repo file. Verified
  `.git/config` is clean (no `[credential]` block, no token) after the
  correction, and `git push --dry-run` still succeeds via the global store.
- **This only fixes credential storage for git operations run through this
  remote-devices bridge session.** It does NOT touch whatever git credential
  setup exists (or doesn't) on Ross's actual Mac, which is the machine that
  matters — Phase 9 and all real deploys are meant to run via Ross's local
  Claude Code session in VS Code, on his real Mac, not through this bridge.
  That machine needs its own fix, added as Phase 9 Step 3a (see
  `phases/PHASE_9_course_search_fix.md`) since Phase 9 was already open —
  two options given: `gh auth login` + `gh auth setup-git` (preferred, if
  the `gh` CLI is installed) or `git config --global credential.helper
  osxkeychain` plus one interactive push to seed the Keychain entry.

**Note for next time:** a fix applied through the remote-devices bridge only
verifiably fixes the environment the bridge itself runs in (an isolated
Linux sandbox with the project folder mounted), not the user's actual local
machine — even though both read/write the same shared repo files. Anything
that touches machine-level state outside the repo (credential stores,
global git config, Keychain) needs to be either done directly on the real
machine (which this bridge cannot do — no keychain access from a Linux
sandbox) or handed off as an explicit instruction for the user's real local
session to run. Don't assume a fix "worked" just because a dry-run succeeded
from the sandbox; state plainly which environment was actually verified.

**Also flagged, not yet resolved:** the exposed token (a `gho_`-prefixed GitHub
OAuth token — value deliberately not repeated here; GitHub's push protection
blocked an earlier commit for containing it in plaintext, which is the right
outcome) has appeared in a Claude chat transcript, which is a distinct exposure
surface from the local-file issue above. Recommended Ross revoke it at
https://github.com/settings/applications (likely an OAuth App token, `gho_`
prefix suggests a `gh auth login` origin) or
https://github.com/settings/tokens, and issue a fresh credential via
whichever setup path (Step 3a) he uses. Not something this session can do
for him — revoking a token requires his GitHub account action.


---

## Session Summary, September 19, 2026 (cont'd) — Credential Revocation Confirmed, Phase 9 Fully Closed

**What was verified, not just trusted:**
- Ross revoked the exposed GitHub OAuth token via
  https://github.com/settings/applications (Authorized OAuth Apps). Confirmed
  it's actually dead, not just a UI toggle: re-ran `git push --dry-run` from
  the remote-devices bridge session using the exact same stored credential
  that had authenticated cleanly earlier in this session. It now fails —
  `remote: Invalid username or token. Password authentication is not
  supported for Git operations.` / `fatal: Authentication failed`. That's a
  real before/after test against the live GitHub API, not an assumption.
- **Side effect, expected and harmless:** this also killed the
  remote-devices bridge session's own push access, since it had been using
  that same token (see the Sep 19 "Git Credential Stored in Plaintext"
  entry above). That's fine — this bridge was never the machine real
  deploys run through. Ross's actual local Claude Code session on his Mac
  separately confirmed push access is live there via a fresh credential,
  which is the machine that matters and closes out Phase 9 Step 3a for
  real.
- **The Phase 9 code fix itself was verified live, independently, a second
  way:** fetched `https://raw.githubusercontent.com/RuGinzo13/
  golf-bet-tracker/main/index.html` directly (bypassing any GitHub Pages
  cache) and confirmed the fixed `pickCourse()` code — the `var
  cached=courseCache[id]; var sets=cached?extractTees(cached):[];`
  pattern with the "cache the FULL course detail, not the search snippet"
  comment — is genuinely present in what's live on `main`, not just
  committed locally.
- The leftover `Claude outputs/` scratch folder (duplicate copies of the
  Phase 9 files, already correctly placed in `phases/`) was deleted by
  Ross. `git status` now shows a fully clean working tree, in sync with
  `origin/main`.

**This closes Phase 9 completely** — course search fix (live, verified
twice, two different ways), `deploy.sh` staging gap (fixed), the credential
exposure this phase's prep surfaced (token out of the repo, revoked,
confirmed dead), and the scratch-file cleanup. Nothing from this phase is
still open.


---

## Session Summary, September 19, 2026 (cont'd) — Nassau H2H / Match Play Strokes Distorted by a Third Player's Handicap

**What didn't work:** `nassauHoles()`, `nassauLiveState()`, and `matchCalc()` all
compared players' hole-by-hole scores using the shared, memoized `NET()` —
which allocates each player's strokes relative to `minH()`, the LOWEST
handicap among ALL active players in the round, not relative to the other
player in that specific 1v1 matchup. Reported by Ross: in a 4-player round
(Ross 18, Brett 12, Graser 10, Josh 18), the Ross-vs-Brett Nassau H2H
matchup's TOTAL stroke count displayed correctly (6 — `hcp` differences
cancel the reference point out, so that part was always right), but the
actual match outcome wasn't isolated from Graser and Josh being in the
round. Confirmed and reproduced with the real extracted functions: with
Graser (hcp 10) as the field's low handicap, Ross's 6-stroke advantage over
Brett landed on stroke-index holes 3–8 (both Ross and Brett already get a
stroke relative to Graser on holes SI 1–2, so those cancel out and the
*effective* advantage shifts to the next 6 hardest holes) — not on the
correct SI 1–6 that a standalone Ross-vs-Brett match would use. Proven with
an isolated single-hole test: on hole SI 1, with Ross and Brett shooting an
identical gross 5, the old field-relative code calls it **halved** (both get
a stroke off Graser, net scores tie); the correct pairwise calculation calls
it a **Ross win** (Ross gets a stroke relative to Brett specifically, Brett
doesn't). A second full-front-9 test showed the actual win/loss tally
differing (0-3, halved 6 under the old code vs 1-4, halved 4 under the
fix) for the same identical scores — a real, not theoretical, accounting
difference. `matchCalc()` (Match Play) had the exact same bug, since it also
read the shared `net=NET()`.
**What worked:** Added `NETPair(p1i,p2i)` — a new, non-memoized helper that
computes net scores for exactly two players, using ONLY those two players'
handicaps (the lower of the pair as the 0 reference), so a third player's
handicap can never influence a 1v1 matchup's stroke allocation. Wired it
into `nassauHoles()`, `nassauLiveState()` (the live in-round Nassau tracker),
and a new shared `matchRun(p1,p2)` helper used by `matchCalc()` and the 3
other places that had duplicated Match Play's hole-tally loop inline (the
share-text builder, the Gross Money Flow detail view, and `rResults()`'s
Match Play card detail) — all 4 previously read the shared field-relative
`net`, all 4 now call `matchRun()`. Deliberately did NOT touch `NET()`
itself, the Scores summary table, `nassauHolesTeam()`/`nassauLiveStateTeam()`
(2v2 Nassau), `wolfCalc()`, `s666Calc()`, or `s531Calc()` — those are genuine
group formats where every active player needs ONE consistent net score
relative to the same reference point; only pure 1v1 matchups (Nassau H2H,
Match Play) were distorted by this bug. Verified against the patched file's
actual extracted functions (not reimplemented) with Node: syntax check
passes, the hole-1 single-hole proof and the full front-9 W-L tally both
confirm the fix, and a `matchCalc()` sanity run produces a coherent result.
**Not yet committed/pushed** — code change is written to
`golf_bet_tracker.html` and `index.html` (kept in sync), awaiting Ross's
go-ahead per this project's standing practice of not pushing real-money-math
changes without explicit confirmation.
**Note for next time:** "the total matches" is not the same proof as "the
per-hole allocation matches" for any golf handicap calculation — match play
outcomes depend on exactly which holes get a stroke, not just the count.
Any function comparing two specific players head-to-head needs its own
pairwise stroke reference, never a shared field-wide one, even when the
totals happen to check out. Group formats (best-ball teams, Wolf, point
formats) are the opposite case — those genuinely need one shared reference
per player, so don't blanket-apply this fix pattern without checking which
category a given bet type falls into first.


---

## Feature — Par 3 Clock Carry-Over (Optional), Sep 20, 2026

**Requested:** Ross reported that when nobody is designated "on the clock" for a
par-3 hole, the Par 3 Clock stake just evaporates for that hole. He asked for an
optional toggle so an unclaimed hole's stake rolls forward - as far as necessary -
until someone is finally back on the clock, at which point the payout is cumulative
across however many holes carried in.

**What worked:** Added `BT.p3c.carry` (default `false`) and a new `p3cCarryMap()`
helper that walks the par-3 holes in order and tracks a running carry count: it
increments only when nobody is on the clock (`cp==null`) for a par-3, and resets to
0 the moment a hole with someone on the clock actually resolves a payout (birdie,
par, or 3-putt bogey - a plain bogey with someone on the clock also resets it, since
per Ross's literal spec the carry condition is specifically "nobody on the clock,"
not "no money changed hands"). An unresolved hole (someone assigned but score not
yet entered) is left alone - it neither adds to nor resets the carry, so live
scoring mid-round doesn't produce flickering carry counts as holes get filled in.
`p3cCalc()` multiplies whichever birdie/par/bogey rate applies by that hole's carry
multiplier (carry count + 1) before computing the payout, so N carried holes pay
(N+1)x stakes on the hole that finally resolves. If the carry is never claimed
again before the round ends, it's simply never paid - same as a normal skins-style
carry.

**Verified, not just reasoned through:** extracted `ais()`/`p3cCarryMap()`/
`p3cCalc()` verbatim from the patched file and ran them under Node (`node
/tmp/p3c_test.js`, 4 scenarios): (1) carry OFF produces byte-identical output to
the pre-carry code for a plain single-hole birdie - confirms the default is a true
no-op for every existing saved round, since old rounds' stored `BT.p3c` has no
`carry` key at all and `undefined` is falsy; (2) carry ON, two empty par-3s then a
birdie on the third pays exactly 3x and the carry correctly resets to 1x on the
next par-3 after that; (3) carry ON, an unresolved hole (assigned but no score
yet) does not disturb the carry chain building around it; (4) carry ON, carry never
resolves by the last par-3 - no crash, all payouts stay 0. All four scenarios were
also checked for exact zero-sum per Critical Coding Rule #6.

**Deliberately NOT a `RULE_FLAG` bump.** Unlike the Aug 1 6/6/6 fix or other rule
changes that altered math for existing rounds, this is strictly additive and
opt-in: with `carry:false` (the default, and what every previously-saved round's
`BT.p3c` implicitly has since the key didn't exist before), `p3cCalc()`'s output is
provably identical to the pre-change code (see verification above). No existing
round's numbers change unless a user explicitly turns the new checkbox on for a
round they're actively scoring.

**UI:** new checkbox in the Par 3 Clock Setup card ("Carry over stakes when
nobody's on the clock"), wired `onchange` (never `oninput`) per Critical Coding
Rule #1, with the info text below it switching to describe whichever mode is
active. The Dots/Junk tab's per-hole Par 3 Clock cards now show a "— carries Nx"
tag on any hole whose payout, if it resolves, will be multiplied, plus a note on
empty holes that their stake is rolling forward when carry-over is on.

**Pushed and live, Sep 20, 2026.** Ross ran `phases/SYNC_push_pending_commits.md`
in local Claude Code, which pushed this commit (`412c3bb`) together with the two
others that were pending (`4549383` division-of-labor rule, and `37977b6` the
Nassau/Match Play fix) in one batch, then re-ran `deploy.sh` so `index.html` picked
up the change too. Confirmed from the bridge session: local `main` matches
`origin/main` exactly, working tree clean, `index.html` byte-identical to
`golf_bet_tracker.html`. First real-world use of the new SYNC utility - worked as
designed on the first try.
