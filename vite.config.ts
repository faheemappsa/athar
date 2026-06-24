import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'أثر | وقف خيري عن مسلّم عوده البويني رحمه الله',
        short_name: 'أثر',
        description: 'رفيق يومي للأذكار وورد القرآن ومشاركة الأثر.',
        theme_color: '#38A47C',
        background_color: '#EAF6F3',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/?source=pwa',
        scope: '/',
        dir: 'rtl',
        lang: 'ar-SA',
        icons: []
      },
      workbox: {
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
})