import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 2002,
    allowedHosts: 'all', 
    proxy: {
      '^/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:2000',
        changeOrigin: true,
        secure: false,
      },
    },

  },
  plugins: [react(), tailwindcss(),],
  define: {
    global: 'globalThis',
  },
})