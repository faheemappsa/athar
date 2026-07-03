import { createAtharV2RecentStore } from "./recentStore";
import { runAtharV2Card } from "./runtime";
import { getAtharV2ForMoment } from "./service";
import { validateAtharV2Library } from "./validate";

export function runAtharV2SelfTest() {
  const validation = validateAtharV2Library();
  const friday = getAtharV2ForMoment({ now: new Date("2026-07-03T17:15:00+03:00") });
  const sundayNight = getAtharV2ForMoment({ now: new Date("2026-07-05T20:30:00+03:00") });
  const ramadanNight = getAtharV2ForMoment({ now: new Date("2026-03-18T02:30:00+03:00"), hijriMonth: 9 });
  const arafah = getAtharV2ForMoment({ now: new Date("2026-05-26T12:00:00+03:00"), hijriMonth: 12, hijriDay: 9 });

  let runtimeIds: string[] = [];
  const store = createAtharV2RecentStore(
    () => runtimeIds,
    (ids) => {
      runtimeIds = ids;
    },
  );
  const runtime = runAtharV2Card(store);

  return {
    ok:
      validation.ok &&
      friday.item.id.length > 0 &&
      sundayNight.item.id.length > 0 &&
      ramadanNight.item.id.length > 0 &&
      arafah.item.id.length > 0 &&
      runtime.content.id.length > 0 &&
      runtimeIds.includes(runtime.content.id),
    validation,
    samples: {
      friday: friday.display,
      sundayNight: sundayNight.display,
      ramadanNight: ramadanNight.display,
      arafah: arafah.display,
      runtime: runtime.content,
    },
  };
}
