import type { AtharContentProvider } from "../types";

export const staticProvider: AtharContentProvider = {
  id: "local",
  async getContent() {
    return null;
  },
};
