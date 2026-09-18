# Golf Bet Tracker — Claude Code Project Context

@./summary.md
@./errors.md

---

## What This Project Is

A single-page web app that solves one problem: the math of simultaneous golf bets
is too complex to net out manually. This app handles handicap-adjusted scoring,
multiple simultaneous bet types, fee splitting, and automatic debt settlement.

**Not a fintech product.** Money does not move through this app. It tracks who owes
what. Players settle via Venmo/cash. Do not suggest or build payment rails.

Deployed: https://ruginzo13.github.io/golf-bet-tracker/
Backend: https://golf-proxy.rmg-1313.workers.dev (Cloudflare Worker)

---

## Deploy Command

```bash
./deploy.sh
```

Copies `golf_bet_tracker.html` → `index.html`, commits, pushes to GitHub Pages.
The Cloudflare Worker (`golf_proxy_worker.js`) is deployed separately via the
Cloudflare dashboard — paste into editor, Save & Deploy.

---

## File Structure

```
GolfBetting/
├── CLAUDE.md                  # This file — Claude Code context
├── summary.md                 # Architecture + full build history (was mislabeled — see errors.md, Sep 18 2026)
├── CONTEXT_UPDATE.md          # Product vision, market research, roadmap (split out of summary.md Sep 18 2026)
├── MEMORY.md                  # Decision log
├── errors.md                  # All bugs, failed approaches, lessons learned
├── golf_bet_tracker.html      # Source of truth — all app code (2,129 lines as of Sep 18 2026)
├── index.html                 # Copy of above — served by GitHub Pages
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker (cache-first)
├── icon.svg                   # PWA icon
├── golf_proxy_worker.js       # Cloudflare Worker source
├── SETUP.md                   # Cloudflare Worker setup walkthrough
└── deploy.sh                  # One-command deploy
```

**`golf_bet_tracker.html` is the only file that contains app logic.**
`index.html` is always a copy. Never edit `index.html` directly.

**Nothing in this list except `index.html`, `golf_proxy_worker.js`, `icon.svg`,
`manifest.json`, and `sw.js` is actually committed to git** — `golf_bet_tracker.html`
included. Confirmed via `git status` Sep 18, 2026: every `.md` doc and the source HTML
sit permanently staged as "new file," never committed. This is the single biggest
operational risk in this project right now — see errors.md "Known Issues."

---

## Active Audit — phases/ folder (Sep 18, 2026)

A 7-phase stale-code/dead-code/calculation audit is in progress — see
MEMORY.md's "Decided: 7-Phase Stale/Dead-Code/Calculation Audit" entry for why.
Each phase is a standalone instruction file in `phases/` (`PHASE_1_repo_hygiene.md`
through `PHASE_7_close_loop.md`, plus `phases/README.md` as the index). When told
to "run phase N," read that file in full and follow it exactly — several phases
are deliberately audit-only and must stop for Ross's review before any fix is
applied, especially Phase 4 (calculation correctness), since that touches real
betting math. Do not skip ahead to a later phase without confirming the current
one's stopping point was actually reached.

---

## Architecture Rules — Read Before Every Change

### State
All state lives in plain JS global variables. Key ones:
- `P[]` — up to 4 players `{name, hcp, on}`
- `GR[][]` — gross scores `[player][hole]`
- `BT{}` — all bet config. As of Sep 18 2026: `nassau.h2h`/`nassau.teams` are
  independent on/off flags (both can run at once); `dots.val`/`junk.val` are the
  current $-per-item rate for the leader-take-all payout model (see summary.md
  Feature Log, Aug 2026 — this replaced the original per-event flat-payout model)
- `DT[][]` / `JK[][]` / `P3C[]` / `WD[]` — per-hole tracking
- `RF{}` — round fees and booking fees
- `rounds[]` — saved round history (localStorage)
- `sG[]` — saved golfer roster

### Render Strategy
- `render()` does a full DOM rebuild. Call it for state changes.
- **Exception:** scorecard inputs use targeted DOM mutation (`setSI`,
  `updateRowTotals`, `updateNassauLive`) — never call `render()` from scorecard
  input handlers or focus/cursor will break.
- `invalidateCalcCache()` is called at the top of every `render()`. Do not skip it.

### Calculation Pipeline Order
```
NS() → NET() → nassauCalc() → matchCalc() → wolfCalc() →
s666Calc() → s531Calc() → p3cCalc() → dotsCalc() → junkCalc() →
betsTotal() → feesTotal() → overall() → settleDebts()
```
`NS()` and `NET()` are memoized. Everything else recalculates on render.
`dotsCalc()`/`junkCalc()` use a leader-take-all pot model as of Aug 2026 (only the
player(s) with the most dots/junk get paid) — not the original per-event flat
payout. See summary.md Feature Log before touching either.

---

## Critical Coding Rules

These are learned from real bugs. Violating them will break the app.

1. **Never use `oninput` to trigger `render()`.**
   Use `onchange` on all fee/config inputs. `oninput` fires every keystroke,
   `render()` rebuilds the DOM, focus is destroyed. See errors.md Bug 2.

2. **Never define helper functions inside `rResults()` or any render function.**
   Define them at module level and pass dependencies explicitly. See errors.md Bug 5.
   **This rule is currently being violated** — `_feeSelHtml` inside the Round & Booking
   Fees section of `rResults()` is exactly this pattern (found Sep 18 2026, not yet
   fixed). Extract it before adding anything else to that section.

3. **Always use `ais()` (active player index list) when iterating players.**
   Never assume players are indices 0–3. Only active players are in `ais()`.
   See errors.md Bug 3.

4. **Par 3 Clock always uses gross scores (`parseInt(GR[cp][hi])`).**
   Never use net scores for Par 3 Clock. See errors.md Bug 1.

5. **Any bet tracking real-world events (dots, junk, par 3 clock) uses gross scores.**
   Only stroke-play and match-play use net scores.

6. **Fee math must net to zero across all active players.**
   Payer gets `+amount - share`. Others get `-share`. Sum = 0. See errors.md Bug 4.

7. **Never attach full re-renders to scorecard cell inputs.**
   Use the targeted mutation approach for all 18×4 scorecard cells.

---

## Decision-Making Framework

Before every change, follow these steps:

1. **Review** `summary.md` and `errors.md` for context and prior decisions.
2. **Analyze** current build state and how it relates to the requested change.
3. **Understand** what worked, what didn't, what assumptions caused past failures.
4. **Think** — strip all assumptions. Consider multiple solutions. Evaluate impact
   on existing features. Never fill knowledge gaps with plausible-sounding guesses.
5. **Expand** — find the upside. What's the bigger version of this change?
6. **Expert Review** — identify structural problems, duplicate code, performance
   bottlenecks, maintainability risks before writing a single line.
7. **Output** — clean, scalable, maintainable code only.

---

## Known Architectural Debt

- Single file at 2,129 lines (Sep 18 2026, up from ~1,800 in May) — no module system.
  Use consistent comment headers (`// ── Section name ──`) and never define closures
  inside render functions.
- Cloudflare KV is last-write-wins. No conflict resolution for simultaneous edits
  on two devices.
- PWA icons: `manifest.json` references `icon-192.png` and `icon-512.png` but only
  `icon.svg` exists. Rasterized PNGs not yet generated (still true Sep 18 2026).
- KV namespace `GOLF_SYNC` must be manually bound in Cloudflare dashboard before
  cloud sync works. App degrades gracefully to local-only if not configured.
- `golf_bet_tracker.html` hardcodes the golfcourseapi.com key in plaintext as an
  unused fallback (line ~95) — dead code, but a real secret sitting in public source.
- `migrateRecentRounds()` only re-scores rounds saved in the last 7 days when a bet
  rule changes; older rounds are frozen on whatever math they were originally scored
  with, permanently, with no manual recompute option.
- `_feeSelHtml` (in `rResults()`) is a closure defined inside a render function —
  the exact pattern Critical Coding Rule #2 prohibits. Found Sep 18 2026, not fixed.

---

## Product Constraints — Do Not Violate

- **No custom bet scenarios.** The app implements standard rules for each bet type.
  Players who stray from standards are on their own.
- **No money movement.** Tracking only. Never suggest integrating payment rails.
- **No framework.** This is intentionally vanilla JS with no build step. Do not
  suggest React, Vue, or any framework without explicit direction.
- **`onchange` not `oninput`** for any input that triggers a state change.

---

## Current Product Direction (Strategy Context)

- Target: individual golfer market first. Friends, casual betters, weekly games.
- Premium gate: depth of history and cross-round analysis (season stats, head-to-head
  records, bet-type performance over time). Free tier = last 3 rounds summary only.
- Multi-player round ownership via claim-later model (scorekeeper runs round,
  others claim it via link post-round).
- Real-time sync (all 4 players on their phones, live updates) is a planned feature
  requiring backend rebuild. Do not implement on current KV architecture.
- Backend rebuild target: Supabase (relational DB + real-time). Not yet started.
- Native iOS/Android: future. Current focus is web app validation first.
