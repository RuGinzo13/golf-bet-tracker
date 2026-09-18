# Phase 4 — Calculation Correctness Audit

Run only after Phase 3 findings have been reviewed. This is the core
ask behind the whole audit: verify every bet calculation actually
computes what its plain-English description in Setup claims, with no
silent drift. Audit-only — no fixes in this phase.

---

Go through nassauCalc(), matchCalc(), wolfCalc(), s666Calc(), s531Calc(),
p3cCalc(), dotsCalc(), junkCalc(), feesTotal(), and settleDebts() one at
a time. For each:

(a) state the rule as described to the user in Setup
(b) trace the code against it
(c) flag any mismatch

Pay specific attention to summary.md's Feature Log entries for Jul–Aug
2026 — the Dots/Junk leader-take-all pot model and the 6/6/6 best-ball
fix are the two most recently changed and least battle-tested.

Also verify:
- Every payout function sums to exactly zero across active players
  (write a quick scratch test with a few synthetic score sets if that's
  faster than manual tracing).
- migrateRecentRounds()'s 7-day window / RULE_FLAG logic actually does
  what its comment claims — trace a round through save → migrate →
  re-save by hand.

Do not change any calculation logic in this phase. Produce a findings
report (pass/fail per function, with the specific line/scenario for any
fail) and stop there for Ross's review.

---

**When done:** present the findings report and stop. Do not start
Phase 5 until Ross has read it — this is where real money-math bugs
would surface, and any fix needs a human looking at the before/after
example, not a rushed autofix.
