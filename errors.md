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
