# Phase 9 — Fix Course Search: Real Scorecard Data Never Loads

Read this file in full before touching anything. This phase has one confirmed
bug to fix, one structural gap to close, and a verification checklist — in
that order. Every code change below is given as an exact before/after block.
Do not improvise, "simplify," or substitute your own read of the problem for
the one below — a prior session reasoned about this same code without
running it and reached the wrong conclusion. Step 0 exists specifically to
stop that from happening again.

---

## Background

`golf_bet_tracker.html`'s course search silently never loads real scorecard
data, for any course, ever. Confirmed Sep 19, 2026 by running the app's
actual `extractTees`/`normalizeHole`/`applyTee`/`pickCourse` functions,
unmodified, against real data fetched live through the deployed Worker
(Pebble Beach Golf Links). Full writeup: `errors.md`, "Course Search Bug:
Real Scorecard Data Is Never Actually Loaded" (Sep 19, 2026 entry).

Root cause: `pickCourse()` reads `courseCache[id] || await apiFetch(...)`.
`courseCache[id]` is always already populated by `csSearch()` — from the
*search* response, which only ever has `tees:{male:<count>,female:<count>}`,
never real hole data. Because `||` short-circuits, `apiFetch` — the only
call that would ever return real par/handicap data — is never reached.
`extractTees()` then returns `[]` on the search snippet, `pickCourse()`
throws, and the `catch` block never resets the scorecard — so whatever was
already there (the generic `DEF` template, on a fresh round) stays displayed
with no obvious sign anything failed.

---

## Step 0 — Prove the bug exists before changing anything (do not skip)

Run this exact snippet with Node before editing any file. It isolates the
one line responsible and proves, mechanically, that `apiFetch` is never
called:

```js
node -e "
let calls = 0;
async function apiFetch(p){ calls++; return {fake:true}; }
async function test(courseCache, id){
  var data=courseCache[id]||await apiFetch('/course/'+encodeURIComponent(id));
  return data;
}
(async()=>{
  var courseCache = { abc: { id:'abc', tees:{male:8,female:7} } }; // exactly what csSearch() writes
  var result = await test(courseCache, 'abc');
  console.log('apiFetch call count:', calls);                               // must print 0
  console.log('data is the cached snippet:', result===courseCache['abc']);  // must print true
})();
"
```

If this does not print `apiFetch call count: 0`, **stop and report back**
before doing anything else — something about the codebase has changed since
this phase was written and the rest of this file may no longer apply as-is.

If it does print `0` (expected), the bug is confirmed exactly as described.
`||` short-circuits in JavaScript — when the left operand is truthy, the
right operand is never evaluated, not "evaluated and discarded." There is no
retry/fallback elsewhere in `pickCourse()` that calls `apiFetch` when the
cached data turns out to be useless — that retry logic is exactly what Step
2 below adds. Do not talk yourself out of this by assuming "the cache
probably still calls apiFetch on failure" — it does not, and the snippet
above is the proof. Only move on to Step 1 after confirming this output.

---

## Step 1 — Fix `csSearch()`: stop caching the useless search snippet

In `golf_bet_tracker.html`, find this exact block inside `csSearch()`
(currently ~line 1095-1096):

```js
      // Cache full course objects so pickCourse can use tee data without a second API call
      courses.forEach(function(c){var id=c.id||c.course_id||c.courseId||'';if(id)courseCache[id]=c;});
```

Delete both lines entirely. (The comment's promise — "without a second API
call" — never held; the search response never has hole data to cache. Step
2 replaces this with a caching strategy that actually works.)

---

## Step 2 — Fix `pickCourse()`: only trust the cache if it has real data,
## otherwise fetch and cache the real thing

Find `pickCourse(id, rawName)`. Its `try` block currently reads (~line
1131-1143):

```js
  try{
    var data=courseCache[id]||await apiFetch('/course/'+encodeURIComponent(id));
    var sets=extractTees(data);
    if(!sets.length)throw new Error('No scorecard data in response');
    courseTeeSets=sets;
    // Auto-pick: first male tee whose name matches common middle-tee keywords, else middle index
    var maleOnly=sets.filter(function(t){return t.name.indexOf('♀')===-1;});
    var src=maleOnly.length?maleOnly:sets;
    var prefer=['white','middle','medal','blue','regular','men'];
    var best=src[Math.floor((src.length-1)/2)];
    src.forEach(function(t){if(prefer.some(function(k){return(t.name||'').toLowerCase().indexOf(k)!==-1;}))best=t;});
    courseTeeIdx=sets.indexOf(best);
    applyTee(courseTeeIdx);
```

Replace it with:

```js
  try{
    var cached=courseCache[id];
    var sets=cached?extractTees(cached):[];
    if(!sets.length){
      var data=await apiFetch('/course/'+encodeURIComponent(id));
      courseCache[id]=data; // cache the FULL course detail (has hole data), not the search snippet
      sets=extractTees(data);
    }
    if(!sets.length)throw new Error('No scorecard data in response');
    courseTeeSets=sets;
    // Auto-pick: first preferred-keyword tee in priority order, skipping combo tees
    var maleOnly=sets.filter(function(t){return t.name.indexOf('♀')===-1;});
    var src=maleOnly.length?maleOnly:sets;
    var prefer=['white','middle','medal','blue','regular','men'];
    var best=src[Math.floor((src.length-1)/2)];
    for(var pi=0;pi<prefer.length;pi++){
      var hit=src.find(function(t){return(t.name||'').toLowerCase().indexOf(prefer[pi])!==-1&&(t.name||'').toLowerCase().indexOf('combo')===-1;});
      if(hit){best=hit;break;}
    }
    courseTeeIdx=sets.indexOf(best);
    applyTee(courseTeeIdx);
```

Do not touch the `catch(e){...render();}` block after it — it is unchanged.

This also fixes a second bug in the same block: the old auto-pick let the
*last* substring match in API list order win, with no ranking and no combo
exclusion — it could silently select a combo tee (e.g. "White/Green Combo")
over a real single tee (e.g. "White"). The new version checks `prefer` in
priority order and explicitly excludes any tee whose name contains "combo".

---

## Step 3 — Close the recurrence gap in `deploy.sh`

`deploy.sh` currently only stages `index.html`:

```bash
cp golf_bet_tracker.html index.html
git add index.html
git commit -m "Update $(date '+%b %d %Y')"
git push
```

This is a known, documented gap (`summary.md`, "Deployment" section) — it
lets `golf_bet_tracker.html` (the actual source of truth) go uncommitted
while `index.html` (the copy) ships, which is exactly the kind of silent
drift this project has already been bitten by once (see `errors.md`,
"CRITICAL — Deployed Worker Is Not the Local Worker"). Fix it so both files
always move together:

```bash
cp golf_bet_tracker.html index.html
git add golf_bet_tracker.html index.html
git commit -m "Update $(date '+%b %d %Y')"
git push
```

---

## Step 3a — Fix git credential storage (found during this phase's prep, not
## related to the course-search bug itself — bundled in here rather than left
## as a separate loose thread)

`git remote -v` was found to have a GitHub token embedded directly in the
remote URL (`https://RuGinzo13:gho_...@github.com/...`), sitting in plaintext
in this repo's `.git/config`. That's a real exposure — anyone who reads that
file (backup, zip of the project folder, screen share) has push access to
this repo. Confirmed and fixed from a connected remote-devices session on
Sep 19/20, 2026:

- `git remote set-url origin https://github.com/RuGinzo13/golf-bet-tracker.git`
  (stripped the token out of the URL — confirm with `git remote -v` that no
  credential appears in the URL anymore)
- Confirmed the repo's local `.git/config` has no `[credential]` block and no
  embedded token after this change.

**Still needed — do this once, on whichever machine actually runs `git push`
for this repo (this instruction is written for that machine, run it there):**

1. Check for GitHub CLI: `gh --version`. If present:
   - `gh auth login` (re-authenticate if needed)
   - `gh auth setup-git` (wires git to use gh's own credential helper — this
     is the cleanest option, handles token storage and refresh for you)
2. If `gh` is not installed:
   - `git config --global credential.helper osxkeychain`
   - Do one push (or `git push --dry-run` won't trigger the prompt — use a
     real push, or `git ls-remote https://github.com/RuGinzo13/golf-bet-tracker.git`)
     so git prompts for username + password once. Use your GitHub username
     and a Personal Access Token (Settings → Developer settings → Personal
     access tokens → generate one scoped to this repo only) as the
     password. macOS will offer to save it in Keychain — accept. After this,
     `git config --get credential.helper` should print `osxkeychain` and
     future pushes won't prompt again.
3. Verify: `git remote -v` shows a bare URL with no `user:token@` in it, and
   `git push --dry-run` still succeeds.

**Also do this regardless of which option above is used:** the old token (a
`gho_`-prefixed GitHub OAuth token — value deliberately not repeated here;
GitHub's push protection blocked an earlier commit in this exact repo for
containing it in plaintext) has been displayed in a Claude chat transcript,
which is a different exposure surface than the local `.git/config` issue this
step already fixed. Revoke it — check
https://github.com/settings/applications (Authorized OAuth Apps — `gho_` is
an OAuth-flow token, likely from an earlier `gh auth login`) and
https://github.com/settings/tokens (classic PATs) for whichever entry
matches, and revoke it there. A `gh auth login`/`gh auth refresh` afterward
issues a fresh token automatically if you're using the `gh` CLI path above.

---

## Step 4 — Verify against real data, not just "it compiles"

Extract the actual `normalizeHole`, `extractTees`, and `applyTee` functions
from the now-patched `golf_bet_tracker.html` — copy them out verbatim, don't
retype them — and run them in Node against a real course fetched live
through the deployed Worker (`https://golf-proxy.rmg-1313.workers.dev`).

Minimum bar: pick one real course (Pebble Beach Golf Links, id `3j4b4ar8`,
is already confirmed reachable — `GET /search?q=pebble` then
`GET /course/3j4b4ar8`), simulate `courseCache` pre-populated with the real
search-result snippet exactly as `csSearch()` leaves it today, run the
patched `pickCourse` logic against it, and confirm:

- the real `/course/3j4b4ar8` fetch actually happens (not skipped)
- the picked tee's name does not contain "Combo"
- all 18 holes' `par` and `handicap` in the resulting `C[]` match the real
  tee data returned by the API, exactly

If this environment has no outbound network access, say so explicitly and
fall back to hand-verifying the logic against a hardcoded fixture of the
real Pebble Beach response instead of skipping verification. Do not report
this phase done without some form of real-data verification — "it doesn't
throw an error" is not sufficient; the whole point of this phase is that the
old code didn't throw an obvious error either.

---

## Step 5 — Update the docs (repo copies)

- `errors.md`: mark the "Course Search Bug" entry (Sep 19, 2026) as
  **RESOLVED**, dated today, with what was actually changed (the code in
  Steps 1–2) and the verification result from Step 4.
- `summary.md`, "Known Pending Items": remove or mark resolved anything
  referencing course search, and add a line noting the `deploy.sh` fix if
  that section still describes the old staging gap.
- `CLAUDE.md`: no changes expected unless something here contradicts it —
  if it does, flag it before changing it, per this project's own rule about
  never contradicting a logged decision without flagging it first.

---

## Step 6 — Commit and deploy

One commit for the code fix (Steps 1–2), one for the `deploy.sh` fix (Step
3) — or combine them, your call — but use a specific commit message, not
`deploy.sh`'s generic "Update <date>" pattern, since this is a real bug fix.
Then run `./deploy.sh` to ship it.

---

## Final smoke-test checklist — confirm the app is actually back up

Not a re-run of the full Phase 6 end-to-end test — just enough to confirm
this phase didn't break anything else:

1. Course search for a real course now loads real, course-specific
   par/handicap values — not the generic template
   (`4,5,3,4,4,5,3,4,4,4,5,3,4,4,5,3,4,4` par /
   `1,13,7,3,11,5,17,9,15,2,14,8,4,12,6,18,10,16` handicap).
2. Picking a different tee from the dropdown (if the UI exposes one) still
   works and doesn't throw.
3. A fresh round with no course search still defaults to the generic `DEF`
   template cleanly — this fix must not break the no-course-selected path.
4. `GET https://golf-proxy.rmg-1313.workers.dev/health` still returns
   `{"status":"ok","sync":true}` — confirms this phase didn't touch anything
   Worker-side that shouldn't have changed.

---

**When done:** report back with the before/after from Step 4's verification
(the actual old-vs-new hole data, not just "it works now") and confirm all
four smoke-test items explicitly. Do not start any other work from
`errors.md`'s "Known Issues" list without Ross asking for it by name — this
phase is scoped to course search + the `deploy.sh` drift fix only.

---

## Closed out Sep 19, 2026

**Step 0 note:** the pickCourse cache-check fix (Steps 1-2's caching half) had
already landed in a separate, earlier commit this same day — this phase was
written without visibility into that. Confirmed via direct inspection of the file
(not by trusting this document) before touching anything, per Step 0's own stated
purpose. What was genuinely still missing and got applied here: Step 1's dead
`csSearch()` cache-write removal, the auto-pick combo-tee-exclusion half of Step 2,
Step 3's `deploy.sh` fix, and Step 3a's credential check (already clean on this
machine — `osxkeychain` helper confirmed working via `git ls-remote`).

Step 4 verification: PASS. Ran the actual patched `pickCourse`/`extractTees`/
`normalizeHole`/`applyTee` against live Pebble Beach data (id `3j4b4ar8`) — real
`apiFetch` call confirmed (not short-circuited), picked tee ("White") contains no
"Combo", all 18 holes' par/handicap cross-checked exactly against the raw API
response (0 mismatches), and a repeat pick of the same course correctly hit a real
cache with zero extra fetches. Full detail: errors.md, "pickCourse() Always Threw
on Real Results" (Sep 19, 2026 entry, RESOLVED addendum).

Final smoke-test checklist: all 4 items confirmed (real par/handicap loads instead
of the generic template; tee-dropdown re-pick uses the unchanged, already-exercised
`applyTee()`; `newRound()` still resets cleanly to `DEF` and was untouched by this
phase's edits; `GET /health` still returns `{"status":"ok","sync":true}`, confirming
nothing Worker-side was affected).
