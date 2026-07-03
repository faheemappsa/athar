import { toAtharV2CardContent } from "./compat";
import { getAtharV2ForMoment } from "./service";

export function getAtharV2CardContent(recentIds: string[] = []) {
  const selection = getAtharV2ForMoment({ recentIds });
  return {
    content: toAtharV2CardContent(selection),
    nextRecentIds: selection.nextRecentIds,
    meta: {
      occasion: selection.moment.occasion,
      poolSize: selection.poolSize,
      reason: selection.reason,
    },
  };
}
