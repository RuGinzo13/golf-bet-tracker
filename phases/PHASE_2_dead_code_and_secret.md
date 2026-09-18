# Phase 2 — Dead Code & Exposed Secret

Run only after Phase 1 is committed.

---

Read errors.md's "Known Issues" list. Remove the dead API_KEY fallback in
golf_bet_tracker.html (~line 95) and the direct-fetch branch in
apiFetch() that uses it — PROXY_URL is always set in production, so that
path never executes. Keep the function working through the Worker proxy
only; if PROXY_URL is ever unset, fail with a clear "Course search not
configured" message instead of silently trying a client-side key.

Note in your output: the key has already been exposed in git history via
every past commit of index.html, so this doesn't undo the exposure — the
real fix is rotating the key at golfcourseapi.com and updating the
Worker's GCAPI_KEY secret.

Then grep the whole file for any other genuinely dead code: functions
never called, variables assigned but never read, leftover flags like the
old DOTS_RULE_FLAG naming. List what you find before deleting anything
non-trivial, and confirm with Ross before removing anything you're not
100% sure is unused.

Copy golf_bet_tracker.html → index.html per deploy.sh convention.
Commit as "Remove dead API key fallback and other dead code". Update
errors.md's Known Issues list to mark #2 resolved (with a note that key
rotation is still needed) and log what else you removed.

---

**When done:** confirm with Ross before moving to Phase 3.
