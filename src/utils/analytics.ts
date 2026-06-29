import { recordLocalAnalyticsEvent } from "./localAnalytics";

type AnalyticsParams = Record<string, string | number | boolean | undefined>;
type GtagCommand = "js" | "config" | "event";

const GA_ID = "G-H9NQ6TLRS5";
let initialized = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, target: string | Date, params?: AnalyticsParams) => void;
  }
}

export const initAnalytics = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
};

export const trackEvent = (eventName: string, params?: AnalyticsParams) => {
  try {
    recordLocalAnalyticsEvent(eventName, params);
    initAnalytics();
    window.gtag?.("event", eventName, params);
  } catch {}
};
