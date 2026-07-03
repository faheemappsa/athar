import { normalizeAtharV2RecentIds } from "./memory";

export type AtharV2RecentStore = {
  read: () => string[];
  write: (ids: string[]) => void;
};

export function createAtharV2RecentStore(read: () => string[], write: (ids: string[]) => void): AtharV2RecentStore {
  return {
    read: () => normalizeAtharV2RecentIds(read()),
    write: (ids: string[]) => write(normalizeAtharV2RecentIds(ids)),
  };
}
