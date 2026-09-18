# Audit Phases — Sep 2026

Decided and logged in MEMORY.md ("September 18, 2026 — Decided: 7-Phase
Stale/Dead-Code/Calculation Audit"). Run in order, one at a time. Each
phase file is self-contained — read it in full before starting, and stop
where it tells you to stop for Ross's review.

To run one: tell Claude Code "run phases/PHASE_N_....md" (or just "run
phase N" — the numbering below is unambiguous).

1. `PHASE_1_repo_hygiene.md` — get everything under git, clear the stale lock
2. `PHASE_2_dead_code_and_secret.md` — remove dead API key + dead code
3. `PHASE_3_api_sync_audit.md` — audit API/Worker/PWA cache staleness (no fixes)
4. `PHASE_4_calculation_audit.md` — verify every bet calc against its stated rule (no fixes)
5. `PHASE_5_fix_findings.md` — fix what Phase 4 confirmed + the closure violation
6. `PHASE_6_end_to_end_test.md` — full-flow test pass (no fixes)
7. `PHASE_7_close_loop.md` — update docs, final commit, before/after summary

Phases 3, 4, and 6 are deliberately audit-only — they stop and report
before anything gets changed, since a couple of these (calculation math
in particular) touch real money numbers and shouldn't get an autofix
without a human reading the before/after first.
