type ReportRow = { name: string; value: number };

type ReportSummary = {
  installs: number;
  standaloneOpens: number;
  installConversion: number;
  funnel: ReportRow[];
  topEvents?: ReportRow[];
};

const installEventNames = [
  "تثبيت التطبيق",
  "تثبيت مؤكد",
  "pwa app installed",
  "pwa standalone install confirmed",
];

export const normalizeAdminReportAccuracy = <T extends ReportSummary>(summary: T | null): T | null => {
  if (!summary) return null;

  const detectedInstalls = Math.max(
    summary.installs || 0,
    summary.standaloneOpens || 0,
    ...(summary.topEvents || [])
      .filter((row) => installEventNames.includes(row.name))
      .map((row) => row.value)
  );

  const normalizedFunnel = (summary.funnel || []).map((row) => {
    if (row.name === "تثبيت") return { name: "تثبيت مؤكد", value: detectedInstalls };
    return row;
  });

  const hasInstallRow = normalizedFunnel.some((row) => row.name === "تثبيت مؤكد");
  const funnel = hasInstallRow ? normalizedFunnel : [...normalizedFunnel, { name: "تثبيت مؤكد", value: detectedInstalls }];

  return {
    ...summary,
    installs: detectedInstalls,
    installConversion: summary.standaloneOpens > 0 ? 100 : summary.installConversion || 0,
    funnel,
  } as T;
};