// Live player counts + visits for the Nex Games site, straight from Roblox's public games API.
// Roblox's API blocks browsers (no CORS), so this Worker fetches it server-side, keeps the answer for
// 60 s in Cloudflare's cache and serves that copy to every visitor: Roblox sees ~1 request a minute.
// It only ever asks for the site's own games (read from the live site's games list, see below).

const SITE = "https://nexgames.dev";
const ROBLOX = "https://games.roblox.com/v1/games?universeIds=";
const TTL = 60;          // seconds a live answer is reused
const IDS_TTL = 3600;    // seconds the game id list is reused
const MAX_IDS = 100;     // Roblox allows 100 universe ids per call

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "content-type": "application/json; charset=utf-8",
};

// The site publishes its game id list at /live-ids.json (written at build time from games.json),
// so adding a game to the site never needs a Worker change.
async function gameIds() {
  const r = await fetch(`${SITE}/live-ids.json`, { cf: { cacheTtl: IDS_TTL, cacheEverything: true } });
  if (!r.ok) throw new Error(`ids ${r.status}`);
  const ids = await r.json();
  if (!Array.isArray(ids)) throw new Error("ids not a list");
  return ids.map(String).filter((s) => /^\d{1,20}$/.test(s)).slice(0, MAX_IDS);
}

async function live() {
  const ids = await gameIds();
  const r = await fetch(ROBLOX + ids.join(","), { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`roblox ${r.status}`);
  const rows = (await r.json())?.data;
  if (!Array.isArray(rows)) throw new Error("bad roblox data");
  const games = rows.map((g) => ({ id: String(g.id), playing: g.playing, visits: g.visits }));
  return { games, at: new Date().toISOString() };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (request.method !== "GET" || url.pathname !== "/live") return new Response("Not found", { status: 404, headers: cors });

    // one shared cached copy for everyone, whatever query string they send
    const cache = caches.default;
    const key = new Request(`${url.origin}/live`);
    const hit = await cache.match(key);
    if (hit) return hit;

    try {
      const body = JSON.stringify(await live());
      const res = new Response(body, { headers: { ...cors, "cache-control": `public, max-age=${TTL}` } });
      ctx.waitUntil(cache.put(key, res.clone()));
      return res;
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 502, headers: { ...cors, "cache-control": "no-store" } });
    }
  },
};
