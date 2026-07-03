import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const TARGET = resolve("public/data/athar-v2/athar-db.json");
const INPUTS = [
  resolve("data/athar-v2/imported/quran-short.json"),
  resolve("data/athar-v2/imported/adhkar-short.json"),
  resolve("data/athar-v2/imported/hadith-short.json"),
  resolve("data/athar-v2/imported/tafsir-short.json"),
];
const MAX = 150;
const ALLOWED = new Set(["ayah", "dua", "hadith", "tafsir"]);

const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();

async function readJsonArray(path) {
  try {
    const value = JSON.parse(await readFile(path, "utf8"));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function isValid(item) {
  return item && ALLOWED.has(item.type) && normalize(item.text).length > 0 && normalize(item.text).length <= MAX && item.source?.title && item.source?.reference;
}

const seen = new Set();
const items = [];

for (const input of INPUTS) {
  for (const item of await readJsonArray(input)) {
    if (!isValid(item)) continue;
    const text = normalize(item.text);
    if (seen.has(text)) continue;
    seen.add(text);
    items.push({ ...item, text });
  }
}

const db = {
  version: 2,
  generatedAt: new Date().toISOString(),
  buildMode: "offline_first_static_asset",
  maxItemLength: MAX,
  displaySource: "local_static_db",
  liveExternalDisplay: false,
  importReport: {
    sourceFiles: INPUTS.map((path) => path.replace(process.cwd() + "/", "")),
    total: items.length,
  },
  items,
};

await mkdir(dirname(TARGET), { recursive: true });
await writeFile(TARGET, `${JSON.stringify(db, null, 2)}\n`, "utf8");
console.log(`Merged Athar V2 DB items: ${items.length}`);
