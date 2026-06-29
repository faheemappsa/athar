import { useEffect, useState } from "react";
import { fetchSupabaseAnalyticsSummary } from "../utils/supabaseAnalytics";

export const useRemoteAnalyticsSummary = (enabled: boolean, refreshKey: number) => {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSupabaseAnalyticsSummary>>>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);

    fetchSupabaseAnalyticsSummary()
      .then((nextSummary) => {
        if (active) setSummary(nextSummary);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled, refreshKey]);

  return { summary, loading };
};
