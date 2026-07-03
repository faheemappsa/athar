import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT = resolve("data/athar-v2/imported/hadith-short.json");

const items = [
  { id: "hadith-short-niyyah", text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى", source: "صحيح البخاري وصحيح مسلم" },
  { id: "hadith-short-din-nasiha", text: "الدِّينُ النَّصِيحَةُ", source: "صحيح مسلم" },
  { id: "hadith-short-rahma", text: "من لا يَرحم لا يُرحم", source: "صحيح البخاري وصحيح مسلم" },
  { id: "hadith-short-yusr", text: "يَسِّرُوا ولا تُعَسِّرُوا، وبَشِّرُوا ولا تُنَفِّرُوا", source: "صحيح البخاري وصحيح مسلم" },
  { id: "hadith-short-ghina", text: "ليس الغنى عن كثرة العَرَض، ولكن الغنى غنى النفس", source: "صحيح البخاري وصحيح مسلم" },
  { id: "hadith-short-tayyib", text: "إن الله طيب لا يقبل إلا طيبًا", source: "صحيح مسلم" },
].map((item) => ({
  id: item.id,
  type: "hadith",
  text: item.text,
  source: { title: item.source, reference: "حديث صحيح قصير" },
  tags: ["barakah", "short"],
  occasions: ["daily_morning", "daily_evening", "generic"],
  priority: 74,
  weight: 5,
}));

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(items, null, 2)}\n`, "utf8");
console.log(`Prepared verified short hadith: ${items.length}`);
