import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins:
    [
      react(),
    ],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
    host: '0.0.0.0',  
    port: 5173,
  },
  publicDir: 'public',
})
