// Golf Course API Proxy + Profile Sync - Cloudflare Worker
//
// SETUP (one-time, ~2 min in Cloudflare dashboard):
//   1. Workers & Pages → KV → Create namespace → name it "GOLF_SYNC" → Create
//   2. Open this Worker → Settings → Variables → KV Namespace Bindings
//      → Add binding: Variable name = GOLF_SYNC, KV Namespace = GOLF_SYNC → Save
//
// Routes:
//   GET  /search?q=COURSE      → golf course API proxy
//   GET  /course/ID            → golf course API proxy
//   POST /sync/save            → save user profile {user, pin, data}
//   GET  /sync/load?user=&pin= → load user profile
//   GET  /health               → {"status":"ok"}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const BASE_URL = 'https://api.golfcourseapi.com/v1';

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Profile sync: save ─────────────────────────────────────────────────
    if (path === '/sync/save') {
      if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' });
      if (!env.GOLF_SYNC) return respond(503, { error: 'KV storage not configured — see SETUP in worker code' });
      let body;
      try { body = await request.json(); } catch { return respond(400, { error: 'Invalid JSON' }); }
      const { user, pin, data } = body || {};
      if (!user || !pin || !data) return respond(400, { error: 'Missing user, pin, or data' });
      const key = 'user:' + user.toLowerCase().trim();
      const pinHash = await sha256(String(pin));
      const existing = await env.GOLF_SYNC.get(key, 'json');
      if (existing && existing.pinHash !== pinHash) {
        return respond(401, { error: 'Incorrect PIN for this username' });
      }
      await env.GOLF_SYNC.put(key, JSON.stringify({ pinHash, data, ts: Date.now() }));
      return respond(200, { saved: true });
    }

    // ── Profile sync: load ─────────────────────────────────────────────────
    if (path === '/sync/load') {
      if (request.method !== 'GET') return respond(405, { error: 'Method not allowed' });
      if (!env.GOLF_SYNC) return respond(503, { error: 'KV storage not configured — see SETUP in worker code' });
      const user = url.searchParams.get('user');
      const pin  = url.searchParams.get('pin');
      if (!user || !pin) return respond(400, { error: 'Missing user or pin' });
      const key = 'user:' + user.toLowerCase().trim();
      const record = await env.GOLF_SYNC.get(key, 'json');
      if (!record) return respond(404, { error: 'No profile found for this username' });
      const pinHash = await sha256(String(pin));
      if (record.pinHash !== pinHash) return respond(401, { error: 'Incorrect PIN' });
      return respond(200, { data: record.data, ts: record.ts });
    }

    // ── Golf Course API proxy (GET only) ───────────────────────────────────
    if (request.method !== 'GET') return respond(405, { error: 'Method not allowed' });

    if (path === '/search') {
      const q = url.searchParams.get('q') || '';
      if (!q || q.length < 2) return respond(200, { courses: [] });
      return await proxyRequest(BASE_URL + '/search?search_query=' + encodeURIComponent(q), env);
    }

    const courseMatch = path.match(/^\/course\/(.+)$/);
    if (courseMatch) {
      return await proxyRequest(BASE_URL + '/courses/' + encodeURIComponent(courseMatch[1]), env);
    }

    if (path === '/' || path === '/health') return respond(200, { status: 'ok', sync: !!env.GOLF_SYNC });

    return respond(404, { error: 'Not found' });
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────────

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function respond(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({}, CORS, { 'Content-Type': 'application/json' }),
  });
}

async function proxyRequest(apiUrl, env) {
  const apiKey = env.GCAPI_KEY;
  if (!apiKey) return respond(503, { error: 'API key not configured — add GCAPI_KEY secret' });
  const authHeaders = [
    { 'Authorization': 'Bearer ' + apiKey, 'Accept': 'application/json' },
    { 'Authorization': 'Key '    + apiKey, 'Accept': 'application/json' },
    { 'x-api-key': apiKey,                 'Accept': 'application/json' },
  ];
  try {
    let lastBody = '', lastStatus = 401;
    for (const headers of authHeaders) {
      const r = await fetch(apiUrl, { headers });
      lastStatus = r.status;
      lastBody = await r.text();
      if (r.status !== 401 && r.status !== 403) {
        return new Response(lastBody, {
          status: r.status,
          headers: Object.assign({}, CORS, { 'Content-Type': 'application/json' }),
        });
      }
    }
    return new Response(lastBody, {
      status: lastStatus,
      headers: Object.assign({}, CORS, { 'Content-Type': 'application/json' }),
    });
  } catch (e) {
    return respond(502, { error: 'Proxy failed: ' + e.message });
  }
}
