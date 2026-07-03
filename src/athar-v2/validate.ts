import { ATHAR_V2_CATALOG } from "./catalog";
import type { AtharV2ContentType } from "./types";

const ALLOWED_TYPES: AtharV2ContentType[] = ["ayah", "dua", "hadith", "tafsir"];

export type AtharV2ValidationIssue = {
  id: string;
  message: string;
};

export function validateAtharV2Library() {
  const issues: AtharV2ValidationIssue[] = [];
  const seen = new Set<string>();

  for (const item of ATHAR_V2_CATALOG) {
    if (seen.has(item.id)) issues.push({ id: item.id, message: "duplicate_id" });
    seen.add(item.id);

    if (!ALLOWED_TYPES.includes(item.type)) issues.push({ id: item.id, message: "unsupported_type" });
    if (item.text.trim().length < 8) issues.push({ id: item.id, message: "text_too_short" });
    if (item.text.length > 180) issues.push({ id: item.id, message: "text_too_long_for_card" });
    if (!item.source.title || !item.source.reference) issues.push({ id: item.id, message: "missing_source" });
    if (item.occasions.length === 0) issues.push({ id: item.id, message: "missing_occasion" });
    if (item.tags.length === 0) issues.push({ id: item.id, message: "missing_tags" });
  }

  return {
    ok: issues.length === 0,
    total: ATHAR_V2_CATALOG.length,
    issues,
  };
}
