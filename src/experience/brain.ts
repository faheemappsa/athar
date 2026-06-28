import type { AtharBrainDecision } from "./types";
import { scanAtharEntryMoment } from "./entryMoment";
import { buildAtharBrainDecision } from "./scoring";

const DECISION_KEY = "athar-brain-last-decision-v1";

const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const readLastAtharBrainDecision = (): AtharBrainDecision | null => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(DECISION_KEY);
    return raw ? (JSON.parse(raw) as AtharBrainDecision) : null;
  } catch {
    return null;
  }
};

export const writeLastAtharBrainDecision = (decision: AtharBrainDecision) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(DECISION_KEY, JSON.stringify(decision));
  } catch {}
};

export const runAtharBrain = () => {
  const entry = scanAtharEntryMoment();
  const decision = buildAtharBrainDecision(entry);
  writeLastAtharBrainDecision(decision);
  return decision;
};
