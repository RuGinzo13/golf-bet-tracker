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
8. `PHASE_8_worker_ci_deploy.md` — Cloudflare Worker CI/CD pipeline (built Sep
   19 2026; not a "run this" phase — it's the record of what exists and the
   2 steps only Ross can finish, per errors.md Known Issues #9)
9. `PHASE_9_course_search_fix.md` — fix course search never loading real
   scorecard data (root cause: `pickCourse()`'s `courseCache[id]||apiFetch()`
   short-circuit always uses the search-result snippet, which never has hole
   data), plus the `deploy.sh` staging gap. Found and fix verified against
   real live API data Sep 19, 2026 — see errors.md.

Phases 3, 4, and 6 are deliberately audit-only — they stop and report
before anything gets changed, since a couple of these (calculation math
in particular) touch real money numbers and shouldn't get an autofix
without a human reading the before/after first.

**Status as of Sep 19, 2026: Phases 1–9 complete.** See errors.md for full
write-ups of each. Phase 8 (Worker CI/CD) is live in production — Worker
deploys automatically via CI now, verified end-to-end (`/health`, `/sync/save`,
`/sync/load` all confirmed live). Phase 9 (course search fix) is complete and
verified against real live API data — see that file's close-out note.
