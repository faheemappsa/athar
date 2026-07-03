import { getLocalHijriDate } from "./localCalendar";
import { getAtharV2TimeSignals } from "./timeWindows";
import type { AtharV2Moment, AtharV2MomentInput, AtharV2Occasion, AtharV2Tag } from "./types";

const unique = <T>(values: T[]) => Array.from(new Set(values));

const getReligiousOccasion = (input: AtharV2MomentInput, date: Date): AtharV2Occasion | null => {
  if (input.occasionOverride) return input.occasionOverride;

  const localHijri = getLocalHijriDate(date);
  const hijriMonth = input.hijriMonth ?? localHijri.month ?? undefined;
  const hijriDay = input.hijriDay ?? localHijri.day ?? undefined;
  const timeSignals = getAtharV2TimeSignals(date);

  if (hijriMonth === 12 && hijriDay === 9) return "arafah";
  if (hijriMonth === 9 && timeSignals.window === "dawn") return "ramadan_last_night";
  if (hijriMonth === 9) return "ramadan";
  return null;
};

export function createAtharV2Moment(input: AtharV2MomentInput = {}): AtharV2Moment {
  const now = input.now ?? new Date();
  const timeSignals = getAtharV2TimeSignals(now);
  const religiousOccasion = getReligiousOccasion(input, now);

  const occasion: AtharV2Occasion =
    religiousOccasion ??
    (timeSignals.isFridayLastHourWindow
      ? "friday_last_hour"
      : timeSignals.isFriday
        ? "friday"
        : timeSignals.isSundayNight
          ? "monday_preparation"
          : timeSignals.isMondayMorning
            ? "monday_fasting"
            : timeSignals.window === "morning"
              ? "daily_morning"
              : timeSignals.window === "evening" || timeSignals.window === "night"
                ? "daily_evening"
                : "generic");

  const secondaryOccasions: AtharV2Occasion[] = unique([
    occasion,
    timeSignals.isFriday ? "friday" : "generic",
    timeSignals.window === "morning" ? "daily_morning" : "generic",
    timeSignals.window === "evening" || timeSignals.window === "night" ? "daily_evening" : "generic",
    "generic",
  ]);

  const valueTags: AtharV2Tag[] = unique([
    occasion.includes("friday") ? "friday" : "short",
    occasion.includes("ramadan") ? "ramadan" : "short",
    occasion === "arafah" ? "arafah" : "short",
    occasion.includes("monday") ? "fasting" : "short",
    occasion === "daily_morning" ? "morning" : "short",
    occasion === "daily_evening" ? "evening" : "short",
    occasion === "friday_last_hour" || occasion === "arafah" || occasion.includes("ramadan") ? "dua" : "barakah",
    occasion === "daily_morning" ? "tawakkul" : "hope",
  ]);

  return {
    now,
    day: now.getDay(),
    hour: now.getHours(),
    occasion,
    secondaryOccasions,
    valueTags,
  };
}
