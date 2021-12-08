import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/react': {
        target: 'http://localhost:10001',
        changeOrigin: true,
        rewrite: (path) => {
          return path.replace(/^\/react/, '')
        },
      }
    }
  }
})
