import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Proxy all /api requests to the backend so cookies work (same-origin)
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://13.220.233.0:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
})
