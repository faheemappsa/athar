import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT = resolve("data/athar-v2/imported/quran-short.json");
const API = "https://api.alquran.cloud/v1/quran/quran-uthmani";
const MAX = 150;

const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();

const response = await fetch(API);
if (!response.ok) throw new Error(`quran_import_failed_${response.status}`);

const payload = await response.json();
const items = [];

for (const surah of payload?.data?.surahs ?? []) {
  for (const ayah of surah.ayahs ?? []) {
    const text = normalize(ayah.text);
    if (!text || text.length > MAX) continue;
    items.push({
      id: `quran-${surah.number}-${ayah.numberInSurah}`,
      type: "ayah",
      text,
      source: { title: "القرآن الكريم", reference: `${surah.name}: ${ayah.numberInSurah}` },
      tags: ["short"],
      occasions: ["generic"],
      priority: 60,
      weight: 3
    });
  }
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(items, null, 2)}\n`, "utf8");
console.log(`Imported Quran short ayahs: ${items.length}`);
