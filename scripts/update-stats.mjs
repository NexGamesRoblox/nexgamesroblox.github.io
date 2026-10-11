// Refreshes src/games.json: visits, genre, creation date + thumbnails from the public Roblox API, peak CCU from the
// LiveOps tool's pulled analytics (only ever raised, since LiveOps keeps the last 28 days).
// Usage: npm run update-stats
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "src/games.json");
const liveops = path.join(process.env.HOME, "Desktop/RobloxGames/LiveOps/data/games");

const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const ids = data.games.map((g) => g.universeId).join(",");

const info = await (await fetch(`https://games.roblox.com/v1/games?universeIds=${ids}`)).json();
const thumbs = await (await fetch(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&countPerUniverse=1&size=768x432&format=Webp`)).json();

for (const g of data.games) {
  const live = info.data.find((x) => String(x.id) === g.universeId);
  if (live) {
    g.visits = live.visits;
    g.playing = live.playing; // fallback for the live "Playing now" count
    g.peakCcu = Math.max(g.peakCcu, live.playing);
    if (live.genre_l1) g.genre = live.genre_l1;
    if (live.created) g.created = live.created.slice(0, 10); // for the "Alive since" age
  }

  const thumb = thumbs.data.find((x) => String(x.universeId) === g.universeId)?.thumbnails[0];
  if (thumb?.state === "Completed") {
    const png = Buffer.from(await (await fetch(thumb.imageUrl)).arrayBuffer());
    fs.writeFileSync(path.join(root, "public", g.thumb), png);
  }

  try {
    const d = JSON.parse(fs.readFileSync(path.join(liveops, g.universeId, "latest.json"), "utf8"));
    const pts = d.series.ccu_hourly.values.flatMap((v) => v.dataPoints);
    const peak = Math.round(Math.max(0, ...pts.map((p) => p.value)));
    g.peakCcu = Math.max(g.peakCcu, peak);
  } catch {
    console.warn(`no LiveOps data for ${g.name} — kept peak CCU ${g.peakCcu}`);
  }
  console.log(`${g.name}: ${g.visits.toLocaleString()} visits, peak CCU ${g.peakCcu.toLocaleString()}`);
}

data.updatedAt = new Date().toISOString().slice(0, 10);
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + "\n");
