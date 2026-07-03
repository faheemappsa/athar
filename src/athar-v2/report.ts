import { ATHAR_V2_CATALOG } from "./catalog";
import type { AtharV2ContentType, AtharV2Occasion } from "./types";
import { validateAtharV2Library } from "./validate";

const countBy = <T extends string>(values: T[]) =>
  values.reduce<Record<T, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);

export function getAtharV2Report() {
  const types = ATHAR_V2_CATALOG.map((item) => item.type);
  const occasions = ATHAR_V2_CATALOG.flatMap((item) => item.occasions);
  const validation = validateAtharV2Library();

  return {
    total: ATHAR_V2_CATALOG.length,
    byType: countBy(types as AtharV2ContentType[]),
    byOccasion: countBy(occasions as AtharV2Occasion[]),
    validation,
  };
}
