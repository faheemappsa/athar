export type AppSectionKey = 'home' | 'dhikr' | 'quran' | 'radio';

export type AppSectionContext = 'daily' | 'worship' | 'recitation' | 'listening';

export type AppSectionNav = {
  label: string;
  icon: string;
  event: string;
};

export type AppSectionMode = {
  key: AppSectionKey;
  path: string;
  context: AppSectionContext;
  nav?: AppSectionNav;
};

export type AppNavSection = AppSectionMode & { nav: AppSectionNav };

export const appSections: AppSectionMode[] = [
  {
    key: 'quran',
    path: '/quran',
    context: 'recitation',
    nav: {
      label: 'المصحف',
      icon: '📖',
      event: 'nav_quran',
    },
  },
  {
    key: 'home',
    path: '/',
    context: 'daily',
    nav: {
      label: 'الرئيسية',
      icon: '🏠',
      event: 'nav_home',
    },
  },
  {
    key: 'dhikr',
    path: '/dhikr',
    context: 'worship',
    nav: {
      label: 'الأذكار',
      icon: '📿',
      event: 'nav_dhikr',
    },
  },
  {
    key: 'radio',
    path: '/radio',
    context: 'listening',
  },
];

const hasNavigation = (section: AppSectionMode): section is AppNavSection => Boolean(section.nav);

export const navSections = appSections.filter(hasNavigation);

export const getSectionByPath = (path: string) => appSections.find((section) => section.path === path) || appSections[1] || appSections[0];
