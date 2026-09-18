# Phase 3 — API & Sync Staleness Audit

Run only after Phase 2 is committed. This phase is audit-only — no fixes
without explicit sign-off, per the instructions below.

---

Audit golf_proxy_worker.js and how golf_bet_tracker.html talks to it.
Specifically:

1. Confirm the course-search proxy route still matches golfcourseapi.com's
   current API shape — check their docs/changelog if reachable, otherwise
   note what you can't verify from code alone.

2. Review the /sync/save and /sync/load endpoints for security gaps —
   CORS is wide open (*), there's no rate limiting on PIN attempts, and
   PIN hashing is a bare SHA-256 with no salt. Don't fix these yet, just
   document the exact risk in errors.md.

3. Review sw.js's cache-first strategy: right now a user can be served a
   stale cached index.html on load while the network update happens in
   the background, meaning a bet rule change might not actually reach a
   user until their second visit. Propose (don't implement without
   Ross's OK) a lightweight fix — e.g. a version check that prompts the
   user to reload when a new SW has taken over.

4. Confirm GOLF_SYNC KV binding status is still documented accurately in
   CLAUDE.md's Known Architectural Debt.

Write findings to errors.md under a new "API & Sync Audit — [today's
date]" section. No code changes in this phase except what Ross explicitly
approves after seeing your findings.

---

**When done:** present findings and stop. Do not start Phase 4 until
Ross has reviewed the audit and told you which findings (if any) to act
on now vs. defer.
