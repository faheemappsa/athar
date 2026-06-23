import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'أثر',
        short_name: 'أثر',
        description: 'وردك اليومي في مكان واحد',
        theme_color: '#EAF6F3',
        background_color: '#EAF6F3',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ar',
        icons: []
      },
      workbox: {
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
})
