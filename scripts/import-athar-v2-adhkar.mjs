import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT = resolve("data/athar-v2/imported/adhkar-short.json");
const URL = "https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/main/ar.json";
const MAX = 150;

const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();

const response = await fetch(URL);
if (!response.ok) throw new Error(`adhkar_import_failed_${response.status}`);

const payload = await response.json();
const rows = Array.isArray(payload) ? payload : Object.values(payload ?? {}).flat();
const items = [];

for (const [index, row] of rows.entries()) {
  const text = normalize(row?.zekr || row?.text || row?.content || row?.title);
  if (!text || text.length > MAX) continue;
  items.push({
    id: `adhkar-${index}`,
    type: "dua",
    text,
    source: { title: "Morning And Evening Adhkar DB", reference: row?.reference || row?.source || "أذكار الصباح والمساء" },
    tags: ["morning", "evening", "short"],
    occasions: ["daily_morning", "daily_evening", "generic"],
    priority: 75,
    weight: 5
  });
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(items, null, 2)}\n`, "utf8");
console.log(`Imported adhkar: ${items.length}`);
