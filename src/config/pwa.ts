export const pwaAssets = ['athar-icon.svg', 'og-image.svg', 'robots.txt'] as const;

export const pwaManifest = {
  name: 'أثر',
  short_name: 'أثر',
  description: 'رفيق يومي للأذكار وورد القرآن.',
  theme_color: '#48AD8D',
  background_color: '#48AD8D',
  display: 'standalone',
  orientation: 'portrait-primary',
  start_url: '/?source=pwa',
  scope: '/',
  dir: 'rtl',
  lang: 'ar-SA',
  icons: [
    {
      src: '/athar-icon.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
} as const;

export const pwaRuntimeCaching = [
  {
    urlPattern: ({ request }: any) => request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: {
      cacheName: 'athar-pages',
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: ({ request }: any) => ['script', 'style', 'worker'].includes(request.destination),
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'athar-assets',
    },
  },
  {
    urlPattern: ({ request }: any) => ['image', 'font'].includes(request.destination),
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
