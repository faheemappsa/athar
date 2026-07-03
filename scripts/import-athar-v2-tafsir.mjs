import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT = resolve("data/athar-v2/imported/tafsir-short.json");

const items = [
  { id: "tafsir-short-baqarah-186", text: "في الآية قرب الله من عباده ووعده بإجابة دعاء من دعاه.", ref: "معنى البقرة: 186" },
  { id: "tafsir-short-talaq-3", text: "من صدق اعتماده على الله كفاه الله ما أهمه ويسر له أمره.", ref: "معنى الطلاق: 3" },
  { id: "tafsir-short-ibrahim-7", text: "الشكر سبب لزيادة النعم وثباتها، وكفرانها سبب لزوالها.", ref: "معنى إبراهيم: 7" },
  { id: "tafsir-short-anbiya-87", text: "جمع الدعاء بين التوحيد والتنزيه والاعتراف بالذنب.", ref: "معنى الأنبياء: 87" },
  { id: "tafsir-short-qasas-24", text: "إظهار الفقر إلى الله من أعظم أبواب الدعاء والرزق.", ref: "معنى القصص: 24" },
  { id: "tafsir-short-sharh-5", text: "وعد الله أن اليسر مقارن للعسر، فلا يغلب عسر يسرين.", ref: "معنى الشرح: 5-6" },
].map((item) => ({
  id: item.id,
  type: "tafsir",
  text: item.text,
  source: { title: "التفسير الميسر والسعدي", reference: item.ref },
  tags: ["quran_meaning", "short"],
  occasions: ["daily_morning", "daily_evening", "generic"],
  priority: 76,
  weight: 5,
}));

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(items, null, 2)}\n`, "utf8");
console.log(`Prepared short tafsir: ${items.length}`);
