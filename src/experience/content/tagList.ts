export const ATHAR_EXPERIENCE_TAGS = [
  "sakinah",
  "raja",
  "barakah",
  "sabr",
  "shukr",
  "rizq",
  "rahmah",
  "thabat",
  "morning",
  "night",
  "friday",
  "returning",
  "habit",
] as const;

export type AtharExperienceTag = (typeof ATHAR_EXPERIENCE_TAGS)[number];
