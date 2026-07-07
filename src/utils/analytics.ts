import { recordLocalAnalyticsEvent } from "./localAnalytics";

type AnalyticsParams = Record<string, string | number | boolean | undefined>;
type GtagCommand = "js" | "config" | "event";

export const AnalyticsEvents = {
  PageView: "page_view",
  SessionStart: "session_start",
  PwaOpened: "pwa_opened",
  AppInstalled: "app_installed",
  BrainDecision: "athar_brain_decision",
  ContentView: "athar_content_view",
  ShareStart: "athar_share_start",
  ShareSuccess: "athar_share_success",
  ShareError: "athar_share_error",
  InstallPromptShown: "install_prompt_shown",
  BeforeInstallPrompt: "beforeinstallprompt",
  LocationUpdated: "location_updated",
  NavHome: "nav_home",
  NavDhikr: "nav_dhikr",
  NavQuran: "nav_quran",
  NavRadio: "nav_radio",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

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

export const trackEvent = (eventName: AnalyticsEventName | string, params?: AnalyticsParams) => {
  try {
    recordLocalAnalyticsEvent(eventName, params);
    initAnalytics();
    window.gtag?.("event", eventName, params);
  } catch {}
};
