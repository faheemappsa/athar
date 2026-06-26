import type { DhikrCategory } from "../data/adhkar";

export const DHIKR_COMPLETION_VERSE = "﴿فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ﴾";
export const DHIKR_COMPLETION_VERSE_SOURCE = "البقرة: 152";

type CompletionTier = "start" | "returning" | "steady" | "devoted";

type CompletionMessageRule = {
  tier: CompletionTier;
  category?: DhikrCategory;
  message: string;
};

const resolveCompletionTier = (completionCount: number): CompletionTier => {
  if (completionCount >= 7) return "devoted";
  if (completionCount >= 3) return "steady";
  if (completionCount >= 1) return "returning";
  return "start";
};

export const getDhikrCompletionIdentity = (completionCount: number) => {
  const tier = resolveCompletionTier(completionCount);

  if (tier === "devoted") return "أسبوع من المواظبة";
  if (tier === "steady") return `${completionCount} أيام من الوصل`;
  return "عدت اليوم إلى الذكر";
};

const COMPLETION_MESSAGES: CompletionMessageRule[] = [
  {
    tier: "devoted",
    message: "ما شاء الله.. أسبوع كامل وقلبك يرجع للذكر. أثرك اليوم صار عادة نور.",
  },
  {
    tier: "steady",
    message: "ثلاثة أيام وأكثر من الوصل.. ثبتك الله وجعل هذا الذكر بداية خير لا ينقطع.",
  },
  {
    tier: "returning",
    category: "morning",
    message: "بدأت يومك بذكر الله.. خذ هذا السكون معك لباقي يومك.",
  },
  {
    tier: "returning",
    category: "evening",
    message: "ختمت مساءك بما يطمئن القلب.. جعل الله ليلتك أمانًا ورضا.",
  },
  {
    tier: "returning",
    category: "sleep",
    message: "أويت إلى السكينة بذكر الله.. نام قلبك مطمئنًا، وغدًا أثر جديد.",
  },
  {
    tier: "start",
    category: "morning",
    message: "هذه بداية صباحٍ أهدأ.. جعل الله ذكرك نورًا في يومك.",
  },
  {
    tier: "start",
    category: "evening",
    message: "مساؤك صار أقرب للطمأنينة.. جعل الله لك من الذكر سعة وراحة.",
  },
  {
    tier: "start",
    category: "sleep",
    message: "قبل النوم تركت أثرًا طيبًا في قلبك.. نم على ذكر وسكينة.",
  },
];

export const getDhikrCompletionMessage = (category: DhikrCategory, completionCount: number) => {
  const tier = resolveCompletionTier(completionCount);
  const exactRule = COMPLETION_MESSAGES.find((rule) => rule.tier === tier && rule.category === category);
  const tierRule = COMPLETION_MESSAGES.find((rule) => rule.tier === tier && !rule.category);
  const fallbackRule = COMPLETION_MESSAGES.find((rule) => rule.tier === "returning" && rule.category === category);

  return exactRule?.message || tierRule?.message || fallbackRule?.message || "غدًا نلتقي على ذكرٍ جديد.";
};
