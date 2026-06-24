type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: AnalyticsParams) => void;
  }
}

export const trackEvent = (eventName: string, params?: AnalyticsParams) => {
  try {
    window.gtag?.("event", eventName, params);
  } catch {}
};
