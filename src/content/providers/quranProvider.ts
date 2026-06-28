import type { AtharContentProvider } from "../types";

export const QURAN_SHORT_REFERENCES: Record<string, string[]> = {
  sakinah: ["13:28", "20:25", "94:5"],
  raja: ["39:53", "2:186", "94:6"],
  barakah: ["14:7", "65:3", "28:24"],
  sabr: ["2:153", "16:127", "94:5"],
  shukr: ["14:7", "20:114"],
  rizq: ["28:24", "65:3"],
  rahmah: ["39:53", "2:186"],
  thabat: ["3:173", "29:69", "2:153"],
};

export const quranProvider: AtharContentProvider = {
  id: "quran",
  async getContent() {
    return null;
  },
};
