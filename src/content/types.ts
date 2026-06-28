import type { AtharContentKind, AtharEmotionalState } from "../experience/types";

export type AtharProviderId = "quran" | "tafsir" | "hadith" | "dua" | "asma" | "meaning" | "local";

export type AtharProviderContent = {
  id: string;
  provider: AtharProviderId;
  kind: AtharContentKind;
  text: string;
  source: string;
  stateTags: AtharEmotionalState[];
  weight: number;
  isShareable: boolean;
  isOfflineReady: boolean;
  meta?: Record<string, string | number | boolean | null>;
};

export type AtharContentRequest = {
  state: AtharEmotionalState;
  preferredKinds: AtharContentKind[];
  avoidContentIds: string[];
  allowNetwork?: boolean;
};

export type AtharContentProvider = {
  id: AtharProviderId;
  getContent: (request: AtharContentRequest) => Promise<AtharProviderContent | null>;
};
