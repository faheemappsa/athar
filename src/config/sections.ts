export type AppSectionKey = 'home' | 'dhikr' | 'quran' | 'radio';

export type AppSectionContext = 'daily' | 'worship' | 'recitation' | 'listening';

export type AppSectionMode = {
  key: AppSectionKey;
  path: string;
  context: AppSectionContext;
  nav?: {
    label: string;
    icon: string;
    event: string;
    indicator: string;
  };
};

export const appSections: AppSectionMode[] = [
  {
    key: 'home',
    path: '/',
    context: 'daily',
    nav: {
      label: 'الرئيسية',
      icon: '⌂',
      event: 'nav_home',
      indicator: 'left-1/2',
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
      indicator: 'left-[16.66%]',
    },
  },
  {
    key: 'quran',
    path: '/quran',
    context: 'recitation',
    nav: {
      label: 'المصحف',
      icon: '📖',
      event: 'nav_quran',
      indicator: 'left-[83.33%]',
    },
  },
  {
    key: 'radio',
    path: '/radio',
    context: 'listening',
  },
];

export const navSections = appSections.filter((section) => section.nav);

export const getSectionByPath = (path: string) => appSections.find((section) => section.path === path) || appSections[0];
