import type { AtharV2Moment, AtharV2MomentInput, AtharV2Occasion, AtharV2Tag } from "./types";

const FRIDAY = 5;
const SUNDAY = 0;
const MONDAY = 1;

const toHour = (date: Date) => date.getHours();

const isFridayLastHourWindow = (date: Date) => date.getDay() === FRIDAY && toHour(date) >= 16 && toHour(date) <= 18;
const isSundayNight = (date: Date) => date.getDay() === SUNDAY && toHour(date) >= 18;
const isMondayMorning = (date: Date) => date.getDay() === MONDAY && toHour(date) < 12;
const isMorning = (date: Date) => toHour(date) >= 4 && toHour(date) < 11;
const isEvening = (date: Date) => toHour(date) >= 16 && toHour(date) < 22;
const isLastNightWindow = (date: Date) => toHour(date) >= 0 && toHour(date) < 4;

const unique = <T>(values: T[]) => Array.from(new Set(values));

const getReligiousOccasion = (input: AtharV2MomentInput, date: Date): AtharV2Occasion | null => {
  if (input.occasionOverride) return input.occasionOverride;
  if (input.hijriMonth === 12 && input.hijriDay === 9) return "arafah";
  if (input.hijriMonth === 9 && isLastNightWindow(date)) return "ramadan_last_night";
  if (input.hijriMonth === 9) return "ramadan";
  return null;
};

export function createAtharV2Moment(input: AtharV2MomentInput = {}): AtharV2Moment {
  const now = input.now ?? new Date();
  const religiousOccasion = getReligiousOccasion(input, now);

  const occasion: AtharV2Occasion =
    religiousOccasion ??
    (isFridayLastHourWindow(now)
      ? "friday_last_hour"
      : now.getDay() === FRIDAY
        ? "friday"
        : isSundayNight(now)
          ? "monday_preparation"
          : isMondayMorning(now)
            ? "monday_fasting"
            : isMorning(now)
              ? "daily_morning"
              : isEvening(now)
                ? "daily_evening"
                : "generic");

  const secondaryOccasions: AtharV2Occasion[] = unique([
    occasion,
    now.getDay() === FRIDAY ? "friday" : "generic",
    isMorning(now) ? "daily_morning" : "generic",
    isEvening(now) ? "daily_evening" : "generic",
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
    hour: toHour(now),
    occasion,
    secondaryOccasions,
    valueTags,
  };
}
