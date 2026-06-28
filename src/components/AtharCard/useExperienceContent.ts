import { useEffect, useState } from "react";
import type { AtharContent } from "../../services/atharEngine";
import { loadExperienceContent } from "./loadExperienceContent";

export const useExperienceContent = () => {
  const [content, setContent] = useState<AtharContent | null>(null);

  useEffect(() => {
    loadExperienceContent().then(setContent).catch(() => setContent(null));
  }, []);

  return content;
};
