import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:4180',
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'server/**'],
    setupFiles: './src/tests/setup.ts',
  },
})
