export type AtharSurface = "athar-card" | "dhikr-card" | "prayer-card" | "quran-page";

export type AtharBehaviorEventType =
  | "surface_view"
  | "surface_focus"
  | "surface_blur"
  | "surface_click"
  | "athar_share"
  | "dhikr_tap"
  | "prayer_view";

export type AtharEmotionalState =
  | "sakinah"
  | "raja"
  | "barakah"
  | "sabr"
  | "shukr"
  | "rizq"
  | "rahmah"
  | "thabat";

export type AtharContentKind = "ayah" | "tafsir" | "hadith" | "dua" | "asma" | "wisdom";

export type AtharBehaviorEvent = {
  id: string;
  type: AtharBehaviorEventType;
  surface: AtharSurface;
  timestamp: number;
  sessionId: string;
  durationMs?: number;
  contentId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type AtharEntryMoment = {
  timestamp: number;
  visitCount: number;
  isFirstVisit: boolean;
  visitsToday: number;
  daysSinceLastVisit: number | null;
  hour: number;
  dayOfWeek: number;
  isFriday: boolean;
  timeBand: "pre-fajr" | "morning" | "midday" | "afternoon" | "evening" | "night" | "late-night";
};

export type AtharMemorySnapshot = {
  visitCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
  lastSessionId: string;
  recentEvents: AtharBehaviorEvent[];
  surfaceStats: Record<AtharSurface, {
    views: number;
    focuses: number;
    clicks: number;
    totalFocusMs: number;
  }>;
  stateScores: Partial<Record<AtharEmotionalState, number>>;
  contentHistory: string[];
};

export type AtharBrainDecision = {
  entry: AtharEntryMoment;
  state: AtharEmotionalState;
  score: number;
  preferredKinds: AtharContentKind[];
  avoidContentIds: string[];
  generatedAt: number;
};
