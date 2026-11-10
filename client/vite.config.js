import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  // Proxy API requests to the backend so the browser sees them as same-origin.
  // This fixes SameSite=Lax cookie issues when frontend (port 5173) and backend (port 8080)
  // are on different origins.
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.37:8080',
        changeOrigin: true,
      },
    },
  },
   test: {
    global:true,
    environment: 'jsdom',
    setupFiles:'./tests/setup.js',
  },
})