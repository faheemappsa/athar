// Google Analytics 4 - Athar
// وقف خيري عن مسلم عوده البويني رحمه الله

import { GA_MEASUREMENT_ID } from "./constants";

// Initialize GA
export const initGA = () => {
  if (typeof window === "undefined") return;

  // Load gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
  });
};

// Track page view
export const trackPageView = (page: string) => {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: page,
  });
};

// Track custom event
export const trackEvent = (name: string, params?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", name, params);
};

// Specific events
export const trackCardExport = (atharId: string, size: string) => {
  trackEvent("card_export", { athar_id: atharId, size });
};

export const trackShareWhatsApp = (atharId: string) => {
  trackEvent("share_whatsapp", { athar_id: atharId });
};

export const trackPWAInstall = () => {
  trackEvent("pwa_install");
};

export const trackSupportClick = () => {
  trackEvent("whatsapp_support_click");
};

export const trackAtharView = (atharId: string, category: string) => {
  trackEvent("daily_athar_view", { athar_id: atharId, category });
};

export const trackStreakMilestone = (days: number) => {
  trackEvent("streak_milestone", { days });
};

// Extend Window interface
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
