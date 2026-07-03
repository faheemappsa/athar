import { normalizeAtharV2RecentIds } from "./memory";
import { selectAtharV2 } from "./picker";
import type { AtharV2SelectionOptions } from "./types";

export function getAtharV2ForMoment(options: AtharV2SelectionOptions = {}) {
  const selection = selectAtharV2(options);
  const nextRecentIds = normalizeAtharV2RecentIds(options.recentIds ?? [], selection.item.id);

  return {
    ...selection,
    nextRecentIds,
    display: {
      id: selection.item.id,
      type: selection.item.type,
      text: selection.item.text,
      sourceTitle: selection.item.source.title,
      sourceReference: selection.item.source.reference,
    },
  };
}
