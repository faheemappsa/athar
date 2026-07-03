const ATHAR_V2_FLAG_KEY = "athar-v2-enabled";

export function isAtharV2Enabled() {
  try {
    return globalThis.localStorage?.getItem(ATHAR_V2_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAtharV2Enabled(enabled: boolean) {
  try {
    if (enabled) globalThis.localStorage?.setItem(ATHAR_V2_FLAG_KEY, "1");
    else globalThis.localStorage?.removeItem(ATHAR_V2_FLAG_KEY);
  } catch {}
}
