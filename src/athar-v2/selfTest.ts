import { getAtharV2ForMoment } from "./service";
import { validateAtharV2Library } from "./validate";

export function runAtharV2SelfTest() {
  const validation = validateAtharV2Library();
  const friday = getAtharV2ForMoment({ now: new Date("2026-07-03T17:15:00+03:00") });
  const sundayNight = getAtharV2ForMoment({ now: new Date("2026-07-05T20:30:00+03:00") });
  const ramadanNight = getAtharV2ForMoment({ now: new Date("2026-03-18T02:30:00+03:00"), hijriMonth: 9 });
  const arafah = getAtharV2ForMoment({ now: new Date("2026-05-26T12:00:00+03:00"), hijriMonth: 12, hijriDay: 9 });

  return {
    ok: validation.ok && friday.item.id.length > 0 && sundayNight.item.id.length > 0 && ramadanNight.item.id.length > 0 && arafah.item.id.length > 0,
    validation,
    samples: {
      friday: friday.display,
      sundayNight: sundayNight.display,
      ramadanNight: ramadanNight.display,
      arafah: arafah.display,
    },
  };
}
