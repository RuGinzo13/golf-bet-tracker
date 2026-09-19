# Golf Bet Tracker — Project Summary

## What This Is

A single-page web app for tracking golf bets during and after a round. It handles
handicap-adjusted scoring, multiple simultaneous bet types, fee splitting, and
automatic debt settlement — then shows every player exactly who owes what and why.

Deployed at: **https://ruginzo13.github.io/golf-bet-tracker/**
Backend proxy: **https://golf-proxy.rmg-1313.workers.dev** (Cloudflare Worker)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Single-file HTML + vanilla JS | No framework, no build step |
| Styling | Inline CSS (dark green/gold theme) | No external stylesheets |
| Storage (local) | `localStorage` via `storage` wrapper | Keys prefixed `gbt_` |
| Storage (cloud) | Cloudflare Workers KV (`GOLF_SYNC` namespace) | Requires KV binding in dashboard |
| Backend | Cloudflare Worker (`golf_proxy_worker.js`) | Proxies golf course API + handles sync |
| Golf data | golfcourseapi.com | API key in Worker secret `GCAPI_KEY` |
| Hosting | GitHub Pages | `deploy.sh` → cp + git commit + push |
| PWA | `manifest.json` + `sw.js` (cache-first) | Installable on iOS/Android |

---

## Deployment

```bash
cd "path/to/GolfBetting"
./deploy.sh          # copies golf_bet_tracker.html → index.html, commits, pushes
```

**Resolved Sep 19, 2026 (Phase 8):** the Cloudflare Worker no longer deploys via a
manual dashboard copy-paste — `.github/workflows/deploy-worker.yml` runs
`wrangler deploy` in CI on every push that touches `golf_proxy_worker.js` or
`wrangler.toml`. `SETUP.md`'s manual-dashboard walkthrough is superseded, kept only
for reference.

**Resolved Sep 18, 2026 (7-phase audit, Phase 1):** `golf_bet_tracker.html` and every
`.md` doc — previously never committed at all — are now under version control.
**Resolved Sep 19, 2026 (Phase 9):** `deploy.sh` used to only `git add index.html`,
silently leaving `golf_bet_tracker.html` (the actual source of truth) uncommitted on
any deploy that didn't also get a manual commit alongside it. Now stages both files:
`git add golf_bet_tracker.html index.html`.

---

## Architecture — Key Decisions

### Single-file HTML
Everything lives in `golf_bet_tracker.html`. `index.html` is always a copy of it
(the deploy script does the copy). This was a deliberate MVP choice to avoid build
tooling. It works but creates maintainability pressure as the file grows —
**2,129 lines as of Sep 18, 2026**, up from ~1,800 in May.

### State Model
All app state is plain JS variables in the global scope:

```
profile       {name, hcp}            — logged-in user
syncPin       string                 — PIN stored locally for background cloud sync
P[]           [{name, hcp, on}]      — up to 4 players per round
C[]           [{n, par, hcp}]        — 18-hole course definition
GR[][]        string[4][18]          — gross scores per player per hole
BT{}          bet config object      — all 8 bet types and their settings
DT[][]        {f, g}[18][4]          — dots tracking (fairway / green)
JK[][]        {gr,sa,ba,po}[18][4]   — junk tracking (manual side-bets; birdie/eagle/HIO auto-detect from GR)
P3C[]         {cp, tp}[18]           — Par 3 Clock (closest to pin, 3-putt flag)
WD[]          {dec}[18]              — Wolf decisions per hole
RF{}          {roundPayer, roundAmt, bookPayer, bookAmt, feeExclude[]}
rounds[]      saved round objects    — loaded from localStorage on start
sG[]          saved golfer roster    — persists across rounds
```

**`BT{}` sub-shape as of Sep 18, 2026** (grew since the May snapshot — see Feature Log):
- `BT.nassau` — `{on, h2h, teams, mus[], tmus[]}`. `h2h` and `teams` are independent
  on/off flags (added Aug 13); `mus` = 1v1 matchups, `tmus` = 2v2 best-ball matchups
  (added Jul 24).
- `BT.dots` — `{on, val, fwy, grn}`. `val` = single $-per-dot rate (added Aug 1,
  replaces the old separate fwy/grn stakes for payout purposes; `fwy`/`grn` are kept
  only as the legacy fallback value and for the "which action counts as a dot" rule).
- `BT.junk` — `{on, val, greenie, sandy, barky, polie, birdie, eagle, hio}`. `val` =
  single $-per-junk-item rate (added Aug 13, same pattern as dots). `birdie`/`eagle`/
  `hio` are auto-detected from gross score vs. par (added Aug 1); the other four are
  manually checked.

### Calculation Pipeline
```
NS()          → net strokes per player per hole (handicap-adjusted)
NET()         → net score per player per hole
nassauCalc()  → Nassau result (1v1 head-to-head + 2v2 best-ball teams, independently toggled)
matchCalc()   → Match Play result
wolfCalc()    → Wolf result
s666Calc()    → 6/6/6 result (best-ball team scoring — see errors.md bug fix, Aug 1)
s531Calc()    → 5-3-1 result
p3cCalc()     → Par 3 Clock result
dotsCalc()    → Dots result (leader-take-all pot model — see Feature Log, Aug 1)
junkCalc()    → Junk result (leader-take-all pot model — see Feature Log, Aug 13)
betsTotal()   → sums all active bet results
feesTotal()   → per-player fee adjustments from RF state
overall()     → betsTotal + feesTotal (final net position per player)
settleDebts() → greedy minimum-transaction settlement algorithm
```

`NS()` and `NET()` are memoized (`_nsCache`, `_netCache`) and invalidated via
`invalidateCalcCache()` at the start of every `render()`.

### Render Strategy
Full DOM re-render on almost every state change via `render()`. Exceptions:
- **Scorecard inputs** use `oninput` + targeted DOM mutation (`setSI`, `updateRowTotals`,
  `updateNassauLive`) to avoid destroying focus mid-typing.
- **Grid keyboard navigation** (added Aug 7): every editable grid cell — scorecard,
  Dots, Junk, Par 3 Clock, Wolf — is tagged `data-nav="grid:row:col"`. `gridTab()`
  handles Tab/Shift-Tab across the whole grid without a re-render, replacing the old
  scorecard-only `scTab()`.

**Known rule violation (found Sep 18, 2026):** `_feeSelHtml`, in the Round & Booking
Fees section of `rResults()`, is a closure defined inside a render function — exactly
the pattern the Critical Coding Rules below exist to prevent. Low practical risk (it's
a pure function, captures no mutable render-scoped state) but it's a live violation of
the project's own rule. Should be extracted to module level.

### Cloud Sync
- Login: user enters name + PIN → Worker checks KV → loads profile + rounds
- New user: profile created locally → immediately pushed to KV
- After every round save: `cloudSyncBg()` silently pushes full state to KV
- KV key format: `user:{lowercase_name}`
- KV value: `{pinHash (SHA-256), data: {profile, sG, rounds}, ts}`

### Saved-round recomputation (added Aug 1, 2026)
Rounds store a frozen `results` snapshot alongside the raw `state` they were played
with. `migrateRecentRounds()` runs once on app load and recomputes that snapshot from
`state` under today's bet-math rules — but **only for rounds saved within the last 7
days** (`cutoff = Date.now() - 7*24*60*60*1000`), and only once per round per rule
version (`RULE_FLAG`, currently `leaderRuleV2`, bumped whenever a scoring rule
changes). This is intentional — the in-code comment says settled history outside the
window should keep the numbers it was settled on — but it means: (1) any round older
than 7 days at the time a rule changes keeps stale numbers permanently, with no
user-facing way to force a re-score, and (2) a user who doesn't open the app within 7
days of saving a round misses the correction window entirely.

---

## Feature Log — In Build Order

### April 27, 2026 — Initial Deploy (1,158 lines)
Core MVP shipped:
- 4-player setup with handicap entry
- 18-hole scorecard with net scoring (handicap strokes per hole)
- **Bet types**: Nassau (multi-matchup), Match Play, Wolf (lone/partner), 6/6/6, 5-3-1, Par 3 Clock, Dots, Junk
- Results tab with final ledger and debt settlement
- History tab — save and reload rounds
- Golf course search via golfcourseapi.com proxy
- Tee selection with rating/slope
- Saved golfer roster

### May 8, 2026
- **Par 3 Clock fix**: Was showing net score instead of gross in the Extras tab
- **Scorecard Tab navigation**: Tab advances right across holes; at end of a player's row wraps to next player's hole 1. Shift+Tab goes backward.
- **6/6/6 custom team pickers**: Each of the three 6-hole segments has independent team dropdowns (previously auto-assigned)

### May 9, 2026
- **Round fees & booking fee splitting**: Who paid, how much, split evenly among active players. Individual players can be excluded (e.g., gifted round).
- **Fee Breakdown section**: Separate display for Round Cost and Booking Fee, per-player columns showing each person's share
- **Three-part Results layout**: Betting Ledger → Fee Breakdown → Final Ledger (net of everything)
- **Fixed input cursor-jump bug**: `oninput` on fee amount fields caused full re-render on every keystroke, destroying focus. Switched to `onchange`.

### May 10, 2026
- **Share button** (sticky header): Native share sheet, X/Twitter, Instagram copy, TikTok copy, clipboard copy. Shares condensed text summary — no dollar amounts.
- **Money Flow tab**: Per-game transaction cards showing who pays whom for each active bet
- **Architecture refactor**: `mkBetCard`, `mkBalGrid`, `mkSettleTxns` extracted to module-level functions (were re-defined as closures inside `rResults()` on every render). Eliminated `net2/net3/net4` variable duplicates.

### May 11, 2026 (Session 1)
- **Bet descriptions**: One-sentence plain-English description under each bet name in Setup
- **Share bar relocated**: Moved from Results tab to sticky header (always visible)

### May 11, 2026 (Session 2) — PWA + Setup improvements
- **PWA**: `manifest.json`, `sw.js` (cache-first service worker), `icon.svg`. App is installable from Safari/Chrome. Works offline after first load.
- **Bet filtering by player count**: Wolf and 6/6/6 only appear when 4 players selected; 5-3-1 only appears with 3. Warning badges removed — cards are simply hidden.
- **Auto-disable bets**: `setNumP()` now turns off player-count-restricted bets when group size changes.
- **All bets default OFF**: Nassau (previously `on:true`) now starts off like all others.
- **Collapsible Dots/Junk**: Each has a `▼ settings` toggle for the stake inputs. Settings collapse when the bet is toggled off.

### May 11, 2026 (Session 3–5) — Cross-device login (3 attempts)

**Attempt 1 — URL hash backup** (`#r=BASE64`):
Generated a restore link with all data encoded in the URL fragment. Failed: iOS Messages strips `#` fragments when opening links.

**Attempt 2 — Query string backup** (`?r=BASE64`):
Switched from hash to query string. Failed: URL was too long (full round state = 5–8 KB per round × N rounds). Messaging apps and link openers truncate very long URLs.

**Attempt 3 — Cloud login (shipped)**:
- Login screen: Name + PIN (replaces the old "Create Profile" form)
- Cloudflare Worker extended with `/sync/save` (POST) and `/sync/load` (GET)
- Cloudflare Workers KV stores profiles keyed by username, with SHA-256 hashed PIN
- Any device: enter name + PIN → full profile + all rounds loaded from cloud
- Background sync: every round save triggers `cloudSyncBg()` (silent, no user interaction)

### Jul 24 – Aug 13, 2026 — Nassau teams, bug fixes, and a Dots/Junk payout rewrite

**Documentation note:** this entire window shipped with zero entries in MEMORY.md /
errors.md / summary.md — the docs stopped at the May 11 strategy session while code
kept moving. Reconstructed Sep 18, 2026 from git history (`git log`, `git diff` between
commits), since `deploy.sh`'s generic commit messages ("Update Aug 01 2026") carry no
information of their own. Treat this entry as the authoritative record.

**Jul 24, 2026 — Nassau 2v2 Best Ball teams**
Added team matchups (`BT.nassau.tmus`) alongside the existing 1v1 head-to-head
matchups. Team score per hole = lower ("best ball") of the two partners' net scores.
Front/back/overall match play, same as 1v1. At this point both formats always ran
together whenever configured — no independent on/off (that came Aug 13).

**Aug 1, 2026 (six commits, one session) — bug fixes + two new mechanics**
- **Bug fix:** 6/6/6 team scoring was summing both partners' net scores per hole
  instead of taking the lower one (best ball is the standard rule for this bet). Any
  6/6/6 round played before this fix was scored on a non-standard sum-based rule.
- **Bug fix:** `fm()`, the dollar-formatting function, rounded every displayed amount
  to the nearest whole dollar (`Math.round(v)`). Replaced with `amt$()`/`fm()` using
  cent precision (`Math.round(v*100)/100`). Any amount with cents displayed before this
  fix was silently rounded to a whole dollar in the ledger.
- Junk gained auto-detected birdie/eagle/hole-in-one bonuses, computed off gross score
  vs. par (no manual checkbox needed) — new `BT.junk.birdie/eagle/hio` stakes.
  (These per-item stake fields, plus `sandy`/`barky`/`polie`, became dead weight once
  Aug 13's leader-take-all rewrite made every junk item worth the same flat rate —
  removed Sep 18, 2026; see the 7-phase audit entry below.)
- 6/6/6 got a live in-progress tracker (`build666LiveHtml`/`update666Live`), matching
  the live views Nassau and Wolf already had.
- **Dots payout model rewritten.** Old model: every fairway-hit/GIR dot paid its flat
  stake from every other active player, individually, additively, uncapped. New model:
  only the player(s) with the most dots get paid anything — everyone else owes
  `(leader's count − their count) × rate`, and that pot is split evenly (to the cent)
  among the leaders. This is a genuinely different game, not a bug fix — a group used
  to the old per-dot payout will see very different numbers under the new one.
  `BT.dots.val` replaces the old `fwy`/`grn` split-rate config with a single
  $-per-dot rate (falls back to the old `fwy` value for saved rounds that predate this).
- **Saved-round recomputation system added** — see Architecture section above.

**Aug 7, 2026 — Grid keyboard navigation, generalized**
The scorecard's old Tab/Shift-Tab handler (`scTab`) only worked on the 18×4 score-entry
grid. Replaced with a generic `data-nav="grid:row:col"` system (`navCells`/`focusNav`/
`gridTab`) that now also drives Tab navigation across the Dots grid, Junk grid, Par 3
Clock selects, and Wolf decision buttons — not just score entry.

**Aug 13, 2026 (three commits)**
- **Junk payout model rewritten** to match the Dots leader-take-all model above
  (`junkRate()`/`junkTotals()`/`junkCalc()`). `RULE_FLAG` bumped from `dotsLeaderV1` to
  `leaderRuleV2` so rounds inside the 7-day window get re-scored under both new rules
  on next load.
- Nassau copy tightened ("Play it head-to-head, or as 2v2 teams... both formats can run
  at once").
- **Nassau H2H and 2v2 Teams made independently toggleable.** Previously both ran
  together automatically whenever either was configured. Now each has its own ON/OFF
  (`nassauH2HOn()`/`nassauTeamsOn()`), so a group can run 2v2-only or 1v1-only without
  the other format silently taking money too.

### September 18, 2026 — 7-Phase Stale/Dead-Code/Calculation Audit

Before any new feature work, ran a 7-phase cleanup pass (decided and logged in
MEMORY.md) to verify the codebase and infrastructure this whole project rests on
before building further on top of it. Full detail for every phase is in errors.md;
this is the condensed version.

**Phase 1 — Repo hygiene.** Cleared a stale `.git/index.lock`. Confirmed
`golf_bet_tracker.html` and every `.md` doc had genuinely never been committed since
project start — committed all of it in one commit, added `.gitignore`.

**Phase 2 — Dead code & exposed secret.** Removed the plaintext `API_KEY`/`API_BASE`
fallback and the direct-fetch branch in `apiFetch()` — course search now only goes
through the Worker proxy. Removed `doReset()`, a sign-out handler that was never
wired to any UI element (the app currently has no sign-out UI at all as a result —
flagged, not rebuilt, since that's a feature decision not a cleanup one).

**Phase 3 — API & sync audit.** Confirmed the golfcourseapi.com route shape is still
current. Documented real security gaps in `/sync/save`/`/sync/load` (open CORS, no
PIN rate limiting, unsalted SHA-256 hash) and the `sw.js` cache-first staleness risk
(a bet-rule fix may not reach a user until their second visit after a deploy) —
neither fixed yet, both logged for a future session.

**Phase 4 — Calculation correctness audit.** Traced all 10 calc/settlement functions
against their stated Setup rules and verified zero-sum with a 20,000-trial randomized
test plus hand-checked scenarios. **No money-math bugs found** — the Aug 1 6/6/6
best-ball fix and the Aug 1/13 Dots/Junk leader-take-all model both hold up. Found
three adjacent issues instead: a stale 6/6/6 description that still said "combined"
(sum) when the code had already been fixed to best-ball; six dead `BT.junk` stake
fields (`sandy`/`barky`/`polie`/`birdie`/`eagle`/`hio`, superseded by the Aug 13
flat-rate model but never removed); and `feesTotal()` silently no-opping a fee when
its payer was also marked excluded.

**Phase 5 — Fixes.** All three Phase 4 findings fixed, plus the `_feeSelHtml`
closure-in-render violation (Critical Coding Rule #2) — and a second, previously
unflagged instance of the same violation, `flowArrow` inside `rFlow()`, found by
grepping the whole file for the pattern while in there. The fee/exclude conflict is
now structurally prevented (excluded players are filtered out of the payer dropdown,
and excluding someone who's currently a payer clears the payer field) rather than
just silently absorbed.

**Phase 6 — End-to-end flow test.** No browser automation was available, so this ran
the real extracted save/load/calc code (not a reimplementation, not a pure trace)
against stubbed storage via a system JS engine. Setup → scoring (incl. edge cases:
an ace on a non-par-3 hole, an eagle-that's-also-an-ace on a par 3, a 3-putt bogey) →
save → reload → reopen-and-re-edit all passed. **Cloud login/sync did not** — the
live Cloudflare Worker was found to be running code from before cloud sync shipped
(missing `/sync/save`/`/sync/load` entirely), meaning cross-device sync has likely
never worked in production since the May 11, 2026 feature shipped. This isn't a code
bug — the repo's `golf_proxy_worker.js` is correct — it's a deploy gap that requires
a Cloudflare dashboard redeploy Ross has to do manually.

**Net result:** the core betting math was already correct going into this audit and
remains correct — nothing here changed how any bet is scored. What changed is
everything *around* the math: the codebase is now actually version-controlled, one
exposed secret and several pieces of dead code/config are gone, two architecture-rule
violations are fixed, and a real (if not code-level) production gap in cloud sync was
found that had gone completely undetected.

---

## Current File Structure

```
GolfBetting/
├── golf_bet_tracker.html   # Source of truth — all app code (2,130 lines, Sep 18 2026)
├── index.html              # Copy of above — served by GitHub Pages
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first, v3)
├── icon.svg                # PWA home screen icon
├── golf_proxy_worker.js    # Cloudflare Worker source (deploy via dashboard)
├── deploy.sh               # One-command deploy script
├── SETUP.md                # Cloudflare Worker setup walkthrough
├── CLAUDE.md                # Claude Code project context (@summary.md, @errors.md)
├── MEMORY.md                # Decision log
├── errors.md                # Bug / lesson log
├── summary.md                # This file — architecture + build history
└── CONTEXT_UPDATE.md         # Product vision, market research, roadmap (added Sep 18 2026 —
                               # this content used to live (mislabeled) in this file; see errors.md)
```

**Resolved Sep 18, 2026 (7-phase audit, Phase 1):** every file above is now committed
to git. Previously only `index.html`, `golf_proxy_worker.js`, `icon.svg`,
`manifest.json`, and `sw.js` were.

---

## Known Pending Items (updated Sep 19, 2026)

- ~~Live Cloudflare Worker doesn't match `golf_proxy_worker.js` — cloud sync never
  worked in production.~~ **Resolved Sep 19, 2026 (Phase 8).** Worker now deploys via
  CI (`.github/workflows/deploy-worker.yml`); confirmed live end-to-end (`/health`,
  `/sync/save`, `/sync/load` all verified against the real deployed Worker).
- ~~Cloudflare KV namespace binding.~~ **Resolved Sep 19, 2026** — attached via
  `wrangler.toml`, confirmed working (`/health` returns `sync:true`).
- ~~Course search never actually loaded real scorecard data — every course
  selection threw silently.~~ **Resolved Sep 19, 2026 (Phase 9).** Root cause and
  fix in errors.md's "pickCourse() Always Threw on Real Results" entry; verified
  against live Pebble Beach data (all 18 holes' par/handicap cross-checked exactly
  against the raw API response).
- ~~`deploy.sh` only staged `index.html`, leaving `golf_bet_tracker.html` able to go
  uncommitted on a routine deploy.~~ **Resolved Sep 19, 2026 (Phase 9)** — now stages
  both files.
- No HCP field on the new login screen — new users default to HCP 10 and update in Setup
- Full round state (scorecards) is included in cloud sync but not in any URL-based fallback
- No conflict resolution if same profile is edited on two devices simultaneously (last write wins)
- PWA icon is SVG only; `icon-192.png` and `icon-512.png` referenced in manifest but
  **still not generated as of Sep 18, 2026** — confirmed not on disk. Flagged in May, never done.
- `/sync/save`/`/sync/load` security gaps, now live and real (not hypothetical): CORS
  wide open, no PIN rate limiting, unsalted SHA-256 hash. Documented, not fixed.
- **`migrateRecentRounds()` only fixes rounds saved in the last 7 days** — see
  Architecture section above. No user-facing way to force-recompute an older round.
- **Dots and Junk payout math changed twice (Aug 1, Aug 13) with no user-facing
  changelog.** Anyone comparing an old settled round to a new one for these two bet
  types will see numbers computed under a completely different rule and won't know why.
- No sign-out/switch-profile UI (removed as unreachable dead code in the audit rather
  than left half-wired — needs to be built, not restored).
- A GitHub token was found embedded in plaintext in this repo's `.git/config` remote
  URL — stripped from this local machine's config (now uses the `osxkeychain`
  credential helper), but the specific exposed token itself should still be revoked
  via GitHub settings (it was displayed in a chat transcript). Ross-only action.
- Zero progress on the product roadmap (claim-later, premium gate, season stats,
  Supabase/real-time backend, live dashboard) — see CONTEXT_UPDATE.md. All work since
  May has been bug fixes, UX polish, and infrastructure — no roadmap movement yet.
