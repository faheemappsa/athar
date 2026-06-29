import type { AtharDailyFeedback, AtharDailySnapshot } from "./dailyIntelligence";

const messages: Record<AtharDailyFeedback["reason"], string[]> = {
  dhikr_missing: [
    "أذكارك بدأت أثرها.. كمّلها بهدوء.",
    "باقي لك ورد صغير.. وخطوتك اليوم تكتمل.",
    "رجعت في وقت جميل.. خذ دقيقة تكمل أذكارك.",
  ],
  quran_missing: [
    "لا تجعل وردك ينتظر طويلًا.. آية واحدة تكفي للبداية.",
    "رجعت هنا.. وخير ما ترجع له وردك من المصحف.",
    "باقي لمسة من القرآن.. ويهدأ يومك أكثر.",
  ],
  complete_day: [
    "يومك مكتمل.. وأثرك باقي.",
    "جميل.. اليوم تركت لنفسك أثرًا طيبًا.",
    "اكتمل وردك اليوم.. خله نورًا يرجع بك غدًا.",
  ],
  fresh_return: [
    "أثر جديد ينتظرك.",
    "رجعت في وقت طيب.. خذ أثر اليوم بهدوء.",
    "كل رجعة هنا لها معنى.",
  ],
  keep_going: [
    "واضح إن لك أثر اليوم.. خذ لحظة وكمّل.",
    "خطواتك اليوم قريبة من الاكتمال.",
    "أنت قريب.. خذها بهدوء وأكمل أثر يومك.",
  ],
};

export const pickHabitMessage = (reason: AtharDailyFeedback["reason"], snapshot: AtharDailySnapshot) => {
  const list = messages[reason];
  const seed = snapshot.atharCardTouches + snapshot.homeReturns + snapshot.appReturns + new Date().getHours();
  return list[Math.abs(seed) % list.length] || list[0];
};
