import { selectAtharV2 } from "./picker";
import type { AtharV2SelectionResult } from "./types";

export const ATHAR_V2_SCENARIO_DATES = {
  fridayBeforeSunset: new Date("2026-07-03T17:15:00+03:00"),
  sundayNight: new Date("2026-07-05T20:30:00+03:00"),
  normalMorning: new Date("2026-07-07T08:00:00+03:00"),
  ramadanLastNight: new Date("2026-03-18T02:30:00+03:00"),
  arafahDay: new Date("2026-05-26T12:00:00+03:00"),
} as const;

export function getAtharV2ScenarioSamples(): Record<string, AtharV2SelectionResult> {
  return {
    fridayBeforeSunset: selectAtharV2({ now: ATHAR_V2_SCENARIO_DATES.fridayBeforeSunset }),
    sundayNight: selectAtharV2({ now: ATHAR_V2_SCENARIO_DATES.sundayNight }),
    normalMorning: selectAtharV2({ now: ATHAR_V2_SCENARIO_DATES.normalMorning }),
    ramadanLastNight: selectAtharV2({ now: ATHAR_V2_SCENARIO_DATES.ramadanLastNight, hijriMonth: 9 }),
    arafahDay: selectAtharV2({ now: ATHAR_V2_SCENARIO_DATES.arafahDay, hijriMonth: 12, hijriDay: 9 }),
  };
}
