import type { AtharV2ContentType, AtharV2SelectionResult } from "./types";

export type AtharV2CardContent = {
  id: string;
  text: string;
  source: string;
  kind: "ayah" | "dua" | "hadith" | "wisdom";
  time: "morning" | "night" | "pressure" | "any";
};

const toCardKind = (type: AtharV2ContentType): AtharV2CardContent["kind"] => {
  if (type === "ayah") return "ayah";
  if (type === "dua") return "dua";
  if (type === "hadith") return "hadith";
  return "wisdom";
};

const toCardTime = (occasion: AtharV2SelectionResult["moment"]["occasion"]): AtharV2CardContent["time"] => {
  if (occasion === "daily_morning" || occasion === "monday_fasting") return "morning";
  if (occasion === "daily_evening" || occasion === "ramadan_last_night") return "night";
  return "any";
};

export function toAtharV2CardContent(selection: AtharV2SelectionResult): AtharV2CardContent {
  return {
    id: selection.item.id,
    text: selection.item.text,
    source: selection.item.source.reference,
    kind: toCardKind(selection.item.type),
    time: toCardTime(selection.moment.occasion),
  };
}
