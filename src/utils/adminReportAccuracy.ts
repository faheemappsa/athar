type ReportRow = { name: string; value: number };

type ReportSummary = {
  installs: number;
  standaloneOpens: number;
  installConversion: number;
  funnel: ReportRow[];
};

export const normalizeAdminReportAccuracy = <T extends ReportSummary>(summary: T | null): T | null => {
  if (!summary) return null;

  const funnel = (summary.funnel || []).map((row) => {
    if (row.name === "تثبيت") return { name: "تثبيت مؤكد", value: summary.installs || 0 };
    return row;
  });

  return {
    ...summary,
    installs: summary.installs || 0,
    installConversion: summary.installConversion || 0,
    funnel,
  } as T;
};
