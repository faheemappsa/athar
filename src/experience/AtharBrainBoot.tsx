import { useEffect } from "react";
import { runAtharBrain } from "./brain";

export default function AtharBrainBoot() {
  useEffect(() => {
    try {
      runAtharBrain();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Athar brain boot failed", error);
      }
    }
  }, []);

  return null;
}
