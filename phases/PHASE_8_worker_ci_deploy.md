# Phase 8 — Cloudflare Worker CI/CD Deploy Pipeline

**Status: LIVE as of Sep 19, 2026.** Confirmed via the Cloudflare API directly
(not just a green Actions checkmark) and independently via `GET /health` returning
`{"status":"ok","sync":true}`. Took 3 attempts to actually land — see errors.md's
Phase 8 closing entry for the full incident (wrong account ID, then a Cloudflare API
token that looked saved but wasn't). This file is a record of what was built, not a
"run this phase" instruction — the files already exist in the repo.

---

## Why this phase exists

Phase 6 found the live Cloudflare Worker didn't match `golf_proxy_worker.js` —
cloud sync had silently never worked in production since it shipped May 11,
2026. Root cause: Worker deployment was a 100% manual step (Cloudflare
dashboard → paste code → Save & Deploy, per `SETUP.md`) with nothing enforcing
it ever happened. A one-time manual redeploy would have fixed the symptom but
not the cause — the exact same silent-drift failure could recur the next time
`golf_proxy_worker.js` changes and someone forgets the dashboard step.

## What was built

- `wrangler.toml` — Worker name, entry file, and the `GOLF_SYNC` KV binding
  (id `8698ae17677f4f08baa9ef1a1ed9a589`) in one declarative file, so a deploy
  always attaches the binding correctly instead of that being a second manual
  dashboard step that can drift from the code deploy.
- `.github/workflows/deploy-worker.yml` — runs `wrangler deploy` via
  Cloudflare's official `wrangler-action` on every push to `main` that touches
  `golf_proxy_worker.js` or `wrangler.toml`, plus a manual `workflow_dispatch`
  trigger for on-demand redeploys (e.g. after rotating `GCAPI_KEY`).

This rides the same `git push` habit `deploy.sh` already relies on for the
frontend — there's no new process to remember. Any commit that touches the
Worker file deploys it automatically, forever.

## What Claude could NOT do (confirmed, not assumed)

The Cloudflare Developer Platform MCP connector was checked directly: its
Worker tools (`workers_list`, `workers_get_worker`, `workers_get_worker_code`)
are read-only, and its KV/D1/R2 tools manage those as resources but do not
touch Worker script code or bindings. There is no deploy tool in this
connector's surface. This is a capability gap in the connector, not a
permissions issue.

## The two steps only Ross can do

1. **Create a Cloudflare API token.** Cloudflare dashboard → My Profile → API
   Tokens → Create Token → use the "Edit Cloudflare Workers" template, scope
   it to this account. Copy the token value (shown once).
2. **Add two GitHub repo secrets.** `github.com/RuGinzo13/golf-bet-tracker` →
   Settings → Secrets and variables → Actions → New repository secret:
   - `CLOUDFLARE_API_TOKEN` = the token from step 1
   - `CLOUDFLARE_ACCOUNT_ID` = `b8dd155df0654dea955956e9ad70203f`

Neither step can be done from Claude Code or this session — token creation
needs an interactive Cloudflare login, and there's no tool available anywhere
in this project's toolset that writes GitHub Actions secrets.

## After both secrets exist

The next push to `main` (or a manual run from the repo's Actions tab) deploys
the Worker for real — first real deploy since April 26, 2026. Verify
afterward:
- `GET https://golf-proxy.rmg-1313.workers.dev/health` should return a `sync`
  field (it currently does not).
- Confirm the `GCAPI_KEY` secret is still attached to the Worker (Cloudflare
  → Workers & Pages → golf-proxy → Settings → Variables and Secrets). Worker
  secrets are independent of code deploys and should survive, but nothing
  about this Worker's prior state should be assumed intact without checking —
  the account had zero KV namespaces despite the Worker having run since
  April, which was also unexpected.
- Test an actual cloud login/sync round-trip from the app, not just `/health`.


---

## Closed out Sep 19, 2026

Cloud sync is live in production for the first time since it was built May 11,
2026. Still open: confirm `GCAPI_KEY` survived the redeploy (test course search in
the app's Setup tab), and ideally a real login/sync round-trip in the app itself,
not just `/health`.
