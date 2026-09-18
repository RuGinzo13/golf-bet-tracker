# Phase 6 — End-to-End Flow Test

Run only after Phase 5 fixes are committed. Test-only — no fixes in this
phase.

---

Manually exercise the full app flow and confirm nothing is broken end to
end:

1. New round setup with 4 players
2. Enable all 8 bet types with non-trivial stakes
3. Enter 18 holes of scores including edge cases (a birdie, an eagle, a
   hole-in-one, a push hole, a 3-putt on a par 3)
4. Check Results tab math against hand-calculated expectations for at
   least 2 of the bet types
5. Save the round
6. Reload History and confirm the saved round matches
7. Confirm reopening a saved round and re-entering Setup doesn't corrupt
   state
8. Verify cloud login/sync round-trips a profile correctly if you can
   test against the real Worker (or note if you can't)

If browser automation is available, actually click through it; otherwise
trace the code path as if you were a user and flag anywhere the chain
could break silently.

Report a pass/fail checklist. Do not fix anything found here yet — that's
its own follow-up, scoped after Ross sees the checklist.

---

**When done:** present the checklist and stop. Do not start Phase 7
until Ross confirms the checklist looks right (or tells you to fix
something first).
