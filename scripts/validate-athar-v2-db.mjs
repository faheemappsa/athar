import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DB_FILE = resolve("public/data/athar-v2/athar-db.json");
const ALLOWED_TYPES = new Set(["ayah", "dua", "hadith", "tafsir"]);
const MAX_TEXT_LENGTH = 150;

const db = JSON.parse(await readFile(DB_FILE, "utf8"));
const issues = [];
const seen = new Set();

if (!Array.isArray(db.items)) issues.push("items_must_be_array");

for (const item of db.items ?? []) {
  if (!item.id) issues.push("missing_id");
  if (seen.has(item.id)) issues.push(`duplicate_id:${item.id}`);
  seen.add(item.id);
  if (!ALLOWED_TYPES.has(item.type)) issues.push(`invalid_type:${item.id}`);
  if (!item.text || item.text.length > MAX_TEXT_LENGTH) issues.push(`invalid_text_length:${item.id}`);
  if (!item.source?.title || !item.source?.reference) issues.push(`missing_source:${item.id}`);
  if (!Array.isArray(item.tags) || item.tags.length === 0) issues.push(`missing_tags:${item.id}`);
  if (!Array.isArray(item.occasions) || item.occasions.length === 0) issues.push(`missing_occasions:${item.id}`);
}

if (issues.length) {
  console.error("Athar V2 DB validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Athar V2 DB validation passed: ${db.items.length} items.`);
