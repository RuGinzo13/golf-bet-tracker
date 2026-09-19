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
5. **`_feeSelHtml` closure inside `rResults()`** — repeat of the exact pattern Bug 5
   fixed in May. Low risk, but a live violation of Critical Coding Rule #2.
6. **PWA icons still missing** — `icon-192.png`/`icon-512.png` referenced in
   `manifest.json`, not on disk. Flagged in May, unresolved.
7. **KV last-write-wins, no conflict resolution** — unresolved since May, untouched in
   the Jul–Aug commits.
8. **No sign-out UI.** Surfaced Sep 18, 2026 (Phase 2) — the app has no way for a
   logged-in user to sign out or switch profiles from the UI. A `doReset()` function
   that did this existed but was never wired to a button and was removed as dead code;
   if sign-out/switch-profile is wanted, it needs to be built (and wired), not restored
   as-is.
