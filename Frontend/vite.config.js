import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Esto permite que Vite sirva las fuentes de KaTeX desde node_modules
      allow: ['..'] 
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild'
  }
})