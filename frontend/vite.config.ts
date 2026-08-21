import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@clerk/clerk-react'],
  },
})