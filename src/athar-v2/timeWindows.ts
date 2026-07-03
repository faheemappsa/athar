export type AtharV2TimeWindow = "dawn" | "morning" | "afternoon" | "evening" | "night";

export function getAtharV2TimeWindow(date = new Date()): AtharV2TimeWindow {
  const hour = date.getHours();
  if (hour >= 3 && hour < 6) return "dawn";
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 20) return "evening";
  return "night";
}

export function getAtharV2TimeSignals(date = new Date()) {
  const window = getAtharV2TimeWindow(date);
  const day = date.getDay();
  return {
    window,
    day,
    isFriday: day === 5,
    isSundayNight: day === 0 && window === "night",
    isMondayMorning: day === 1 && window === "morning",
    isFridayLastHourWindow: day === 5 && window === "evening",
  };
}
