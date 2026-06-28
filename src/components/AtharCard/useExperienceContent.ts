import { useEffect, useState } from "react";
import type { ExperienceContent } from "../../experience/content";
import { loadExperienceContent } from "./loadExperienceContent";

export const useExperienceContent = () => {
  const [content, setContent] = useState<ExperienceContent | null>(null);

  useEffect(() => {
    loadExperienceContent().then(setContent).catch(() => setContent(null));
  }, []);

  return content;
};
