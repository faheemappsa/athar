export type AppSectionKey = 'home' | 'dhikr' | 'quran' | 'radio';

export type AppSectionMode = {
  key: AppSectionKey;
  path: string;
  context: 'daily' | 'worship' | 'recitation' | 'listening';
};

export const appSections: AppSectionMode[] = [
  {
    key: 'home',
    path: '/',
    context: 'daily',
  },
  {
    key: 'dhikr',
    path: '/dhikr',
    context: 'worship',
  },
  {
    key: 'quran',
    path: '/quran',
    context: 'recitation',
  },
  {
    key: 'radio',
    path: '/radio',
    context: 'listening',
  },
];
