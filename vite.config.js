import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['localhost:4000'],
    proxy: {
      '^/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },

  },
  plugins: [react(), tailwindcss(),],
})
