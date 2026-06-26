import type { DhikrCategory } from "../data/adhkar";

export const DHIKR_COMPLETION_VERSE = "﴿فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ﴾";
export const DHIKR_COMPLETION_VERSE_SOURCE = "البقرة: 152";

export const getDhikrCompletionMessage = (category: DhikrCategory, completionCount: number) => {
  if (completionCount >= 7) {
    return "ما شاء الله.. أسبوع كامل وقلبك يرجع للذكر. أثرك اليوم صار عادة نور.";
  }

  if (completionCount >= 3) {
    return "ثلاثة أيام وأكثر من الوصل.. ثبتك الله وجعل هذا الذكر بداية خير لا ينقطع.";
  }

  if (category === "morning") {
    return "بدأت يومك بذكر الله.. خذ هذا السكون معك لباقي يومك.";
  }

  if (category === "evening") {
    return "ختمت مساءك بما يطمئن القلب.. جعل الله ليلتك أمانًا ورضا.";
  }

  return "أويت إلى السكينة بذكر الله.. نام قلبك مطمئنًا، وغدًا أثر جديد.";
};
