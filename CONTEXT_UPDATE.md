# Golf Bet Tracker — Project Context (Updated May 11, 2026)

## What This Is

A single-page web app solving one problem: the math of simultaneous golf bets
is too complex to track and settle manually. Handles handicap-adjusted scoring,
multiple simultaneous bet types, fee splitting, and automatic debt settlement.

**Not fintech.** Money does not move through this app. Players settle via
Venmo/cash. This is a calculation and tracking product only.

Deployed: https://ruginzo13.github.io/golf-bet-tracker/
Backend proxy: https://golf-proxy.rmg-1313.workers.dev (Cloudflare Worker)

---

## Product Vision

**"Your personal golf betting ledger across every group you've ever played with."**

The user is the constant. Groups change. Saturday crew, work trip, bachelor party,
charity tournament — all in one place. Your money won/lost. Your betting record.
Your handicap over time. Across all contexts, not just one group.

This is the differentiated positioning vs. competitors who track rounds but don't
track the individual across changing groups.

---

## Target Market

**Phase 1:** Individual casual golfer. Friends, weekend bettors, weekly money games.
The person who plays with different groups and wants their own history.

**Power-user tier within Phase 1:** The league organizer — runs a weekly game for
8-16 people, currently using spreadsheets. Brings multiple users with them.
Not a B2B product — same product, higher engagement.

**Deferred:** B2B clubs/enterprises, GHIN integration, native iOS/Android app.

---

## Competitive Landscape (researched May 11, 2026)

Space is NOT a vacuum. Established competitors with native apps and App Store presence:

- **Beezer Golf** — most feature-complete, 28+ bet types, Beezer Bank for cross-round
  balances, multi-group up to 120 players, live updates, GPS, premium tier
- **Golf Bettor** — 12 formats, 65 options, 18K courses, real-time mid-round status,
  auto-loads handicaps, $9.99/year
- **GolfSnap** — live leaderboard, real-time payouts, 20+ formats, multi-group
- **Golf Wager** — cloud scoring (paid), real-time sync, Nassau/Dots/Skins
- **Unknown Golf** — live dollar tracking per player, Nassau, presses
- **Bets and Strokes** — Android, flexible, no bet limit

**Gaps to exploit:**
1. UX complexity — competitors are powerful but hard to use
2. Personal ledger across all groups — underdeveloped in all competitors
3. Claim-later multi-player ownership model — not seen in any competitor
4. Simplicity of setup for casual groups

---

## Monetization Model

**Freemium.** Premium gate is depth of history and cross-round analysis.

**Free tier:**
- Full current round, always
- Last 3 rounds, summary only (date, course, players, final amounts)
- All bet types

**Paid tier (price TBD):**
- Full history, all rounds, full detail
- Season totals — money up/down overall
- Head-to-head records vs specific opponents
- Bet-type breakdown — your Nassau record, Wolf record, etc.
- Handicap drift over time
- Exportable data (PDF/CSV)

**Rejected gates:** Time-based (5 days) — wrong trigger for golf cadence.
Group size limits — kills the invite/growth loop.

---

## Growth Model

**Primary loop:** Scorekeeper sets up round → enters scores → shares results →
other players see product → claim-later creates accounts → their history builds →
premium conversion.

1 round = 4 potential new user acquisition events. Zero forced friction during play.

**Claim-later model:**
- Scorekeeper runs round as today
- Post-round: app generates results link per player
- Player opens link, sees full results
- Creates account → round claimed into their personal history
- Unclaimed rounds stay in scorekeeper's account

---

## Feature Roadmap (priority order)

### Immediate (validate current product)
1. Get 20-50 real users on the web app — actual rounds, actual friction data
2. Live dashboard — current bet standings updating after every hole (solo mode)
3. CLAUDE.md in local project — done (May 11, 2026)

### Near-term (premium foundation)
4. Claim-later flow — post-round share link, account creation, round claiming
5. 3-round free limit gate implementation
6. Season stats view — aggregate results, head-to-head, bet-type records

### Mid-term (real-time product)
7. Backend rebuild — Supabase (replaces Cloudflare KV)
8. Real-time sync — all 4 players connected, live updates via Supabase Realtime
9. Live dashboard in connected mode

### Deferred
10. Native iOS/Android — React Native + Expo when validated and revenue exists
11. GHIN handicap integration — requires USGA partnership
12. League organizer tools — season standings, roster management, admin view
13. Cart screen integration — requires enterprise hardware partnerships

---

## Real-Time Vision (3 Usage Modes)

Same app, same data model, different behavior:

| Mode | Who uses it | How |
|---|---|---|
| Post-round entry | Solo scorekeeper | Enter all 18 holes after round ends |
| During-round solo | Solo scorekeeper | Enter each hole as played, dashboard updates |
| Live connected | All 4 players | Real-time sync, everyone sees updates instantly |

Real-time is optional. Post-round always supported. Offline (PWA) = automatic
fallback when cell service is poor.

UI requirement: always show "through X holes" context so mid-round standings
aren't confused with final results.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Single-file HTML + vanilla JS | No framework, no build step |
| Styling | Inline CSS (dark green/gold theme) | No external stylesheets |
| Storage (local) | localStorage via storage wrapper | Keys prefixed gbt_ |
| Storage (cloud) | Cloudflare Workers KV (GOLF_SYNC) | Requires KV binding in dashboard |
| Backend | Cloudflare Worker | Proxies golf course API + handles sync |
| Golf data | golfcourseapi.com | API key in Worker secret GCAPI_KEY |
| Hosting | GitHub Pages | deploy.sh → cp + git commit + push |
| PWA | manifest.json + sw.js (cache-first) | Installable on iOS/Android |
| Future backend | Supabase | Required for real-time + multi-player ownership |

---

## Architecture — Constraints and Rules

- `golf_bet_tracker.html` is source of truth. `index.html` is always a copy.
- All state is plain JS globals. No framework. No build step.
- `render()` = full DOM rebuild. Exception: scorecard cells use targeted mutation.
- Never use `oninput` on inputs that trigger `render()`. Use `onchange`.
- Never define helpers inside render functions. Module-level only.
- Always use `ais()` (active player index list) when iterating players.
- Par 3 Clock and all real-world-event bets use gross scores, never net.
- Fee math must always net to zero across all active players.
- `invalidateCalcCache()` at top of every `render()`. Never skip.

---

## Known Pending Items

- Cloudflare KV namespace binding must be done manually in dashboard
- No HCP field on login screen — new users default to HCP 10, update in Setup
- No conflict resolution for simultaneous edits on two devices (last-write-wins)
- PWA: icon-192.png and icon-512.png referenced in manifest but not yet generated
- Backend rebuild (Supabase) required before real-time and claim-later can be built
- Pricing for premium tier not yet decided
