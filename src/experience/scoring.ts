import type { AtharBrainDecision, AtharContentKind, AtharEmotionalState, AtharEntryMoment } from "./types";
import { readAtharMemory } from "./memory";

const STATE_ORDER: AtharEmotionalState[] = ["sakinah", "raja", "barakah", "sabr", "shukr", "rizq", "rahmah", "thabat"];

const KIND_BY_STATE: Record<AtharEmotionalState, AtharContentKind[]> = {
  sakinah: ["ayah", "tafsir", "dua", "asma"],
  raja: ["ayah", "dua", "hadith", "tafsir"],
  barakah: ["dua", "ayah", "hadith", "asma"],
  sabr: ["ayah", "hadith", "dua", "tafsir"],
  shukr: ["dua", "ayah", "hadith", "asma"],
  rizq: ["dua", "ayah", "asma", "hadith"],
  rahmah: ["asma", "dua", "ayah", "hadith"],
  thabat: ["hadith", "dua", "ayah", "tafsir"],
};

const createScores = () =>
  STATE_ORDER.reduce<Record<AtharEmotionalState, number>>((scores, state) => {
    scores[state] = 0;
    return scores;
  }, {} as Record<AtharEmotionalState, number>);

const add = (scores: Record<AtharEmotionalState, number>, state: AtharEmotionalState, value: number) => {
  scores[state] += value;
};

const applyEntrySignals = (scores: Record<AtharEmotionalState, number>, entry: AtharEntryMoment) => {
  switch (entry.timeBand) {
    case "pre-fajr":
      add(scores, "rahmah", 4);
      add(scores, "sakinah", 3);
      add(scores, "raja", 2);
      break;
    case "morning":
      add(scores, "barakah", 4);
      add(scores, "shukr", 2);
      add(scores, "thabat", 1.5);
      break;
    case "midday":
      add(scores, "rizq", 2.5);
      add(scores, "thabat", 2);
      break;
    case "afternoon":
      add(scores, "sabr", 3);
      add(scores, "sakinah", 1.5);
      break;
    case "evening":
      add(scores, "shukr", 3);
      add(scores, "rahmah", 2);
      break;
    case "night":
      add(scores, "sakinah", 4);
      add(scores, "raja", 2.5);
      break;
    case "late-night":
      add(scores, "raja", 4);
      add(scores, "rahmah", 3);
      add(scores, "sakinah", 2);
      break;
  }

  if (entry.isFirstVisit) {
    add(scores, "barakah", 3);
    add(scores, "rahmah", 2);
  }

  if ((entry.daysSinceLastVisit || 0) >= 3) {
    add(scores, "raja", 3);
    add(scores, "rahmah", 2);
  }

  if (entry.isFriday) {
    add(scores, "rahmah", 2.5);
    add(scores, "shukr", 1.5);
  }

  if (entry.visitsToday >= 3) {
    add(scores, "thabat", 2);
    add(scores, "sakinah", 1);
  }
};

const applyMemorySignals = (scores: Record<AtharEmotionalState, number>) => {
  const memory = readAtharMemory();

  STATE_ORDER.forEach((state) => {
    const memoryScore = memory.stateScores[state] || 0;
    scores[state] += Math.min(8, memoryScore * 0.18);
  });

  const athar = memory.surfaceStats["athar-card"];
  const dhikr = memory.surfaceStats["dhikr-card"];
  const prayer = memory.surfaceStats["prayer-card"];

  if (athar.focuses >= 3 || athar.totalFocusMs >= 20000) add(scores, "sakinah", 2.2);
  if (dhikr.clicks >= 10) add(scores, "thabat", 2.4);
  if (prayer.views >= 5) add(scores, "barakah", 1.8);
};

const pickWinner = (scores: Record<AtharEmotionalState, number>) =>
  STATE_ORDER.reduce((winner, state) => (scores[state] > scores[winner] ? state : winner), STATE_ORDER[0]);

export const buildAtharBrainDecision = (entry: AtharEntryMoment): AtharBrainDecision => {
  const scores = createScores();
  applyEntrySignals(scores, entry);
  applyMemorySignals(scores);

  const state = pickWinner(scores);
  const memory = readAtharMemory();

  return {
    entry,
    state,
    score: Number(scores[state].toFixed(2)),
    preferredKinds: KIND_BY_STATE[state],
    avoidContentIds: memory.contentHistory.slice(0, 16),
    generatedAt: Date.now(),
  };
};
