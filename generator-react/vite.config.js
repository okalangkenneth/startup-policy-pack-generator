import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),   // 👈 inline JS + CSS into index.html
  ],
  base: './',           // 👈 keep relative paths
  build: {
    assetsInlineLimit: 100000000, // be generous
    cssCodeSplit: false,
  },
})
