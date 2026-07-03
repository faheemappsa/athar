import { getAtharV2CoverageReport } from "./coverageReport";

export function runAtharV2CoverageSelfTest() {
  const coverage = getAtharV2CoverageReport();
  return {
    ok: coverage.total > 0 && coverage.missingTypes.length === 0 && coverage.missingOccasions.length === 0,
    coverage,
  };
}
