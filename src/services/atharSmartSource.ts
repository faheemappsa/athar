import { getAtharV2CardContent } from "../athar-v2";
import { getSmartAthar as getLegacySmartAthar, type AtharContent } from "./atharEngine";

const isV2Enabled = () => import.meta.env.VITE_ATHAR_V2 === "1";

export type { AtharContent };

export const getSmartAthar = async (): Promise<AtharContent> => {
  if (!isV2Enabled()) return getLegacySmartAthar();

  try {
    return getAtharV2CardContent([]).content as AtharContent;
  } catch {
    return getLegacySmartAthar();
  }
};
