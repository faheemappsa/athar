type PwaRouteRequest = {
  request: {
    mode: string;
    destination: string;
  };
};

export const pwaAssets = ['athar-icon.svg', 'athar-maskable-icon.svg', 'og-image.svg'] as const;

export const pwaManifest = {
  name: 'أثر',
  short_name: 'أثر',
  description: 'رفيق يومي للأذكار وورد القرآن.',
  theme_color: '#2E7D61',
  background_color: '#F9F3E8',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  orientation: 'portrait-primary',
  start_url: '/?source=pwa',
  scope: '/',
  dir: 'rtl',
  lang: 'ar-SA',
  categories: ['lifestyle', 'books', 'productivity'],
  icons: [
    {
      src: '/athar-icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: '/athar-maskable-icon.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
  ],
  shortcuts: [
    {
      name: 'أذكار اليوم',
      short_name: 'الأذكار',
      description: 'افتح أذكار اليوم مباشرة.',
      url: '/dhikr?source=pwa-shortcut',
      icons: [{ src: '/athar-maskable-icon.svg', sizes: '512x512', type: 'image/svg+xml' }],
    },
    {
      name: 'ورد القرآن',
      short_name: 'المصحف',
      description: 'ارجع إلى وردك من المصحف.',
      url: '/quran?source=pwa-shortcut',
      icons: [{ src: '/athar-maskable-icon.svg', sizes: '512x512', type: 'image/svg+xml' }],
    },
  ],
} as const;

export const pwaRuntimeCaching = [
  {
    urlPattern: ({ request }: PwaRouteRequest) => request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: {
      cacheName: 'athar-pages',
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: ({ request }: PwaRouteRequest) => ['script', 'style', 'worker'].includes(request.destination),
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'athar-assets',
    },
  },
  {
    urlPattern: ({ request }: PwaRouteRequest) => ['image', 'font'].includes(request.destination),
    handler: 'CacheFirst',
    options: {
      cacheName: 'athar-media',
      expiration: {
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      },
    },
  },
] as const;
