const SITE_URL = "https://athar-sandy.vercel.app";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "أثر",
  url: SITE_URL,
  inLanguage: "ar-SA",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  description: "تطبيق ويب خفيف للأذكار اليومية وورد القرآن ومشاركة الأثر بتجربة سريعة وهادئة.",
  image: DEFAULT_IMAGE,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
};

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "أثر",
  url: SITE_URL,
  inLanguage: "ar-SA",
  description: "أثر رفيق يومي للأذكار وورد القرآن ومشاركة الأثر.",
  publisher: {
    "@type": "Organization",
    name: "أثر",
    url: SITE_URL,
    logo: `${SITE_URL}/athar-icon.svg`,
  },
};

type SeoRoute = {
  title: string;
  description: string;
  path: string;
  pageType: "WebPage" | "CollectionPage";
};

export const seoRoutes = {
  home: {
    title: "أثر | رفيق يومي للأذكار وورد القرآن",
    description: "تطبيق ويب خفيف للأذكار اليومية وورد القرآن ومشاركة الأثر بتجربة سريعة وهادئة.",
    path: "/",
    pageType: "WebPage",
  },
  dhikr: {
    title: "أذكار اليوم مع عداد وحفظ تلقائي | أثر",
    description: "أذكار الصباح والمساء والنوم بتجربة عملية فيها عداد وتقدم محفوظ.",
    path: "/dhikr",
    pageType: "CollectionPage",
  },
  quran: {
    title: "ورد القرآن اليومي وحفظ موضع القراءة | أثر",
    description: "اقرأ وردك من القرآن مع حفظ آخر موضع وتجربة قراءة مركزة للجوال.",
    path: "/quran",
    pageType: "WebPage",
  },
  radio: {
    title: "إذاعة نداء الإسلام بث مباشر | أثر",
    description: "استمع إلى بث إذاعة نداء الإسلام من داخل أثر أو افتح المشغل الرسمي مباشرة.",
    path: "/radio",
    pageType: "WebPage",
  },
} satisfies Record<string, SeoRoute>;

export const getSeoRoute = (pathname: string) => {
  if (pathname.startsWith("/dhikr")) return seoRoutes.dhikr;
  if (pathname.startsWith("/quran")) return seoRoutes.quran;
  if (pathname.startsWith("/radio")) return seoRoutes.radio;
  return seoRoutes.home;
};

const setMeta = (selector: string, attrs: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }
  element.setAttribute("rel", "canonical");
  element.setAttribute("href", href);
};

const setJsonLd = (id: string, payload: Record<string, unknown>) => {
  let element = document.getElementById(id) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(payload);
};

const buildPageSchema = (route: SeoRoute) => {
  const url = `${SITE_URL}${route.path}`;
  return {
    "@context": "https://schema.org",
    "@type": route.pageType,
    name: route.title,
    url,
    inLanguage: "ar-SA",
    description: route.description,
    isPartOf: {
      "@type": "WebSite",
      name: "أثر",
      url: SITE_URL,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: DEFAULT_IMAGE,
    },
  };
};

export const applySeoRoute = (pathname: string) => {
  const route = getSeoRoute(pathname);
  const url = `${SITE_URL}${route.path}`;

  document.title = route.title;
  setMeta('meta[name="description"]', { name: "description", content: route.description });
  setMeta('meta[property="og:title"]', { property: "og:title", content: route.title });
  setMeta('meta[property="og:description"]', { property: "og:description", content: route.description });
  setMeta('meta[property="og:url"]', { property: "og:url", content: url });
  setMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_IMAGE });
  setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: route.title });
  setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: route.description });
  setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_IMAGE });
  setCanonical(url);
  setJsonLd("athar-app-schema", appSchema);
  setJsonLd("athar-site-schema", siteSchema);
  setJsonLd("athar-page-schema", buildPageSchema(route));

  return route;
};
