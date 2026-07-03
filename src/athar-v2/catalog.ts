import { ATHAR_V2_AYAH_LIBRARY } from "./ayahLibrary";
import { ATHAR_V2_DUA_LIBRARY } from "./duaLibrary";
import { ATHAR_V2_LIBRARY } from "./library";
import { ATHAR_V2_MEANING_LIBRARY } from "./meaningLibrary";
import type { AtharV2Item } from "./types";

export const ATHAR_V2_CATALOG: AtharV2Item[] = [
  ...ATHAR_V2_LIBRARY,
  ...ATHAR_V2_AYAH_LIBRARY,
  ...ATHAR_V2_DUA_LIBRARY,
  ...ATHAR_V2_MEANING_LIBRARY,
];
