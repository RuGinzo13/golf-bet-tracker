# Phase 5 — Fix Confirmed Findings + Closure Violation

Run only after Ross has reviewed the Phase 4 findings report and told
you which ones are real bugs to fix.

---

Based on the findings report from the calculation audit (Phase 4), fix
confirmed calculation bugs one at a time, each as its own commit with a
clear message.

Also fix the known `_feeSelHtml` closure-inside-`rResults()` violation
(errors.md, Critical Coding Rule #2) by extracting it to module level
alongside mkBetCard/mkBalGrid/mkSettleTxns, passing dependencies
explicitly. While you're in rResults(), grep the rest of the file for any
other function defined inside a render function and extract those too —
list what you find before touching them.

After each fix, copy golf_bet_tracker.html → index.html. Log every fix to
errors.md following the existing What-didn't-work/What-worked/Note
format.

Do not touch anything not flagged in the Phase 4 report or the closure
issue — no scope creep into new features.

---

**When done:** confirm with Ross before moving to Phase 6.
