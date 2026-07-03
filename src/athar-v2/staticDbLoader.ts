import { ATHAR_V2_CATALOG } from "./catalog";
import { normalizeAtharV2StaticDb } from "./staticDb";
import type { AtharV2Item } from "./types";

const STATIC_DB_URL = "/data/athar-v2/athar-db.json";

export async function loadAtharV2StaticItems(): Promise<AtharV2Item[]> {
  try {
    const response = await fetch(STATIC_DB_URL, { cache: "force-cache" });
    if (!response.ok) return ATHAR_V2_CATALOG;
    const db = normalizeAtharV2StaticDb(await response.json());
    return db?.items?.length ? db.items : ATHAR_V2_CATALOG;
  } catch {
    return ATHAR_V2_CATALOG;
  }
}
