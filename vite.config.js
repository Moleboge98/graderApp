import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000 // You can specify a port for the dev server
  },
  build: {
    outDir: 'dist' // Output directory for production build
  }
})
