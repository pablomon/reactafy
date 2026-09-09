import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwind()],

  build: {
    manifest: true,
    rollupOptions: {
      input: {
        app: fileURLToPath(
          new URL('./index.html', import.meta.url),
        ),
        checkoutShell: fileURLToPath(
          new URL('./src/checkout-shell.tsx', import.meta.url),
        ),
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'https://staging.aguafy.com/',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
