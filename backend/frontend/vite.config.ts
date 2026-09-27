import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@mediapipe/pose': path.resolve(__dirname, './src/mediapipe-mock.ts')
    }
  },
  server: {
    proxy: {
      '/proxy-video': {
        target: 'http://172.20.10.2:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-video/, '')
      }
    }
  }
})
