import type {
  AtharBehaviorEvent,
  AtharBehaviorEventType,
  AtharEmotionalState,
  AtharMemorySnapshot,
  AtharSurface,
} from "./types";

const MEMORY_KEY = "athar-brain-memory-v1";
const SESSION_KEY = "athar-brain-session-id";
const MAX_EVENTS = 100;
const MAX_CONTENT_HISTORY = 40;

const SURFACES: AtharSurface[] = ["athar-card", "dhikr-card", "prayer-card"];
const STATES: AtharEmotionalState[] = ["sakinah", "raja", "barakah", "sabr", "shukr", "rizq", "rahmah", "thabat"];

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const createSurfaceStats = (): AtharMemorySnapshot["surfaceStats"] => ({
  "athar-card": { views: 0, focuses: 0, clicks: 0, totalFocusMs: 0 },
  "dhikr-card": { views: 0, focuses: 0, clicks: 0, totalFocusMs: 0 },
  "prayer-card": { views: 0, focuses: 0, clicks: 0, totalFocusMs: 0 },
});

const createStateScores = (): Partial<Record<AtharEmotionalState, number>> =>
  STATES.reduce<Partial<Record<AtharEmotionalState, number>>>((scores, state) => {
    scores[state] = 0;
    return scores;
  }, {});

export const createDefaultMemory = (now = Date.now()): AtharMemorySnapshot => ({
  visitCount: 0,
  firstSeenAt: now,
  lastSeenAt: now,
  lastSessionId: "",
  recentEvents: [],
  surfaceStats: createSurfaceStats(),
  stateScores: createStateScores(),
  contentHistory: [],
});

const normalizeMemory = (raw: Partial<AtharMemorySnapshot> | null | undefined): AtharMemorySnapshot => {
  const fallback = createDefaultMemory();
  const surfaceStats = createSurfaceStats();
  const rawSurfaceStats = raw?.surfaceStats || {};

  SURFACES.forEach((surface) => {
    surfaceStats[surface] = {
      ...surfaceStats[surface],
      ...(rawSurfaceStats as AtharMemorySnapshot["surfaceStats"])[surface],
    };
  });

  return {
    ...fallback,
    ...raw,
    surfaceStats,
    stateScores: { ...createStateScores(), ...(raw?.stateScores || {}) },
    recentEvents: Array.isArray(raw?.recentEvents) ? raw.recentEvents.slice(0, MAX_EVENTS) : [],
    contentHistory: Array.isArray(raw?.contentHistory) ? raw.contentHistory.slice(0, MAX_CONTENT_HISTORY) : [],
  };
};

export const readAtharMemory = (): AtharMemorySnapshot => {
  const storage = getStorage();
  if (!storage) return createDefaultMemory();

  try {
    const raw = storage.getItem(MEMORY_KEY);
    return normalizeMemory(raw ? JSON.parse(raw) : null);
  } catch {
    return createDefaultMemory();
  }
};

export const writeAtharMemory = (memory: AtharMemorySnapshot) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(MEMORY_KEY, JSON.stringify(normalizeMemory(memory)));
  } catch {}
};

export const getAtharSessionId = () => {
  const storage = getStorage();
  if (!storage) return createId();

  try {
    const existing = storage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = createId();
    storage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return createId();
  }
};

const updateSurfaceStats = (memory: AtharMemorySnapshot, event: AtharBehaviorEvent) => {
  const stats = memory.surfaceStats[event.surface];
  if (!stats) return;

  if (event.type === "surface_view" || event.type === "prayer_view") stats.views += 1;
  if (event.type === "surface_focus") stats.focuses += 1;
  if (event.type === "surface_click" || event.type === "dhikr_tap" || event.type === "athar_share") stats.clicks += 1;
  if (event.durationMs && event.durationMs > 0) stats.totalFocusMs += event.durationMs;
};

const updateStateScores = (memory: AtharMemorySnapshot, event: AtharBehaviorEvent) => {
  const boost = (state: AtharEmotionalState, value: number) => {
    memory.stateScores[state] = (memory.stateScores[state] || 0) + value;
  };

  if (event.surface === "athar-card") {
    if (event.type === "surface_focus" && (event.durationMs || 0) >= 6000) boost("sakinah", 1.4);
    if (event.type === "athar_share") boost("rahmah", 2.4);
  }

  if (event.surface === "dhikr-card") {
    if (event.type === "dhikr_tap") boost("thabat", 0.9);
    if (event.type === "surface_focus" && (event.durationMs || 0) >= 8000) boost("shukr", 1.1);
  }

  if (event.surface === "prayer-card") {
    if (event.type === "prayer_view") boost("barakah", 0.7);
    if (event.type === "surface_focus" && (event.durationMs || 0) >= 5000) boost("sakinah", 0.8);
  }
};

export const recordAtharBehavior = (input: {
  type: AtharBehaviorEventType;
  surface: AtharSurface;
  durationMs?: number;
  contentId?: string;
  metadata?: AtharBehaviorEvent["metadata"];
}) => {
  const timestamp = Date.now();
  const memory = readAtharMemory();
  const event: AtharBehaviorEvent = {
    id: createId(),
    sessionId: getAtharSessionId(),
    timestamp,
    ...input,
  };

  memory.lastSeenAt = timestamp;
  memory.lastSessionId = event.sessionId;
  memory.recentEvents = [event, ...memory.recentEvents].slice(0, MAX_EVENTS);

  if (event.contentId) {
    memory.contentHistory = [event.contentId, ...memory.contentHistory.filter((id) => id !== event.contentId)].slice(0, MAX_CONTENT_HISTORY);
  }

  updateSurfaceStats(memory, event);
  updateStateScores(memory, event);
  writeAtharMemory(memory);

  return event;
};

export const registerAtharVisit = () => {
  const now = Date.now();
  const memory = readAtharMemory();
  memory.visitCount += 1;
  memory.lastSeenAt = now;
  if (!memory.firstSeenAt) memory.firstSeenAt = now;
  memory.lastSessionId = getAtharSessionId();
  writeAtharMemory(memory);
  return memory;
};
