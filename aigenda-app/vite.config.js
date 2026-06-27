import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_ORIGIN = 'https://aigendaweb.runasp.net'

// https://vite.dev/config/
// Dev: browser → same-origin http://localhost:5173/aigenda-api/* → proxy strips prefix and forwards to BACKEND_ORIGIN (avoids CORS preflight on OPTIONS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/aigenda-api': {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/aigenda-api/, ''),
      },
    },
  },
})
