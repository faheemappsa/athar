export const ATHAR_V2_INTEGRATION_STEPS = [
  "Keep V2 isolated until library validation passes.",
  "Keep the current Athar card component untouched during development.",
  "Use getAtharV2ForMoment as the only future read facade.",
  "Pass recent IDs into the service before display.",
  "Persist returned nextRecentIds outside the core engine.",
  "Connect behind a feature flag before replacing the old source.",
  "Verify image export and sharing output visually after connection.",
] as const;
