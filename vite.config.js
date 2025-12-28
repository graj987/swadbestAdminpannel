import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],

  build: {
    chunkSizeWarningLimit: 1500, // Increase chunk limit to remove warning
    outDir: "dist",
    sourcemap: false,
  },
})
