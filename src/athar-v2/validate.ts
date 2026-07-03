import { ATHAR_V2_CATALOG } from "./catalog";
import { ATHAR_V2_ALLOWED_CONTENT_TYPES, ATHAR_V2_SUPPORTED_OCCASIONS } from "./policy";

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

    if (!ATHAR_V2_ALLOWED_CONTENT_TYPES.includes(item.type)) issues.push({ id: item.id, message: "unsupported_type" });
    if (item.occasions.some((occasion) => !ATHAR_V2_SUPPORTED_OCCASIONS.includes(occasion))) {
      issues.push({ id: item.id, message: "unsupported_occasion" });
    }
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
