# Golf Bet Tracker — Cloudflare Worker Setup
## One-time setup (~10 minutes). Free forever.

---

## What this does

The Cloudflare Worker is a tiny server that sits between your Golf Bet Tracker
HTML app and golfcourseapi.com. Your API key lives in Cloudflare's secure
environment — never in the HTML file. Anyone can open the HTML file and the
search just works, without ever seeing the key.

Architecture:
  HTML app → Cloudflare Worker (your key, secret) → golfcourseapi.com

---

## Step 1 — Create a free Cloudflare account

Go to https://cloudflare.com and sign up (free, no credit card needed).

---

## Step 2 — Create the Worker

1. Log in to the Cloudflare dashboard at https://dash.cloudflare.com
2. In the left sidebar, click **Workers & Pages**
3. Click **Create** → **Create Worker**
4. Give it any name, e.g. `golf-proxy`
5. Click **Deploy** (ignore the default Hello World code for now)

---

## Step 3 — Paste the Worker code

1. After deploying, click **Edit Code**
2. Select all the default code and delete it
3. Open the file `golf_proxy_worker.js` (included alongside this file)
4. Copy all of that code and paste it into the editor
5. Click **Deploy** (top right)

---

## Step 4 — Add your API key as a secret

Your API key must NEVER go in the code itself. Cloudflare stores it securely.

1. Go back to your Worker's settings page
2. Click **Settings** → **Variables and Secrets**
3. Under **Secret Variables**, click **Add**
4. Name: `GCAPI_KEY`
5. Value: `T5G624EKF3RWOEP3M3UICPKAVI`  ← your golfcourseapi.com key
6. Click **Encrypt** then **Save**

---

## Step 5 — Copy your Worker URL

1. Go back to the Worker overview page
2. Your Worker URL will be shown — it looks like:
   `https://golf-proxy.YOURNAME.workers.dev`
3. Copy that URL

---

## Step 6 — Paste the URL into golf_bet_tracker.html

1. Open `golf_bet_tracker.html` in any text editor (Notepad, TextEdit, VS Code)
2. Find this line near the top of the `<script>` section:

   ```
   var PROXY_URL='PASTE_YOUR_WORKER_URL_HERE';
   ```

3. Replace `PASTE_YOUR_WORKER_URL_HERE` with your Worker URL:

   ```
   var PROXY_URL='https://golf-proxy.YOURNAME.workers.dev';
   ```

4. Save the file

---

## Step 7 — Test it

1. Open `golf_bet_tracker.html` in Chrome or Safari
2. Log in, go to Setup
3. Type a course name in the Course search box
4. Results should appear — click one and the scorecard (pars & HCP) auto-fills

---

## Troubleshooting

**Search box shows "Proxy not set up yet"**
→ You haven't replaced PASTE_YOUR_WORKER_URL_HERE yet (Step 6)

**Search returns "Search error — check proxy URL"**
→ Double-check the Worker URL. It must start with https:// and have no trailing slash.

**Results appear but scorecard doesn't load**
→ The API returned data but no scorecard for that course. Use the Scores tab
   to fill in pars manually — not all courses have full data.

**Worker shows 401 error**
→ The API key secret wasn't set correctly. Repeat Step 4.

---

## Staying secure

- Your API key is in Cloudflare's encrypted secret storage — not in any file
- The Worker URL is safe to share (it's just an endpoint, not a credential)
- The HTML file is safe to share
- Cloudflare's free tier allows 100,000 Worker requests per day — more than enough

---

## Quick reference

| File | Purpose |
|------|---------|
| `golf_proxy_worker.js` | Paste this into your Cloudflare Worker editor |
| `golf_bet_tracker.html` | Your app — edit one line to add Worker URL |
| `SETUP.md` | This file |
