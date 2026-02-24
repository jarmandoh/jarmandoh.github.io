import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@bingo': '/src/Bingo',
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Aumenta el límite de advertencia a 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separa dependencias grandes en chunks independientes
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('react-router')) return 'router-vendor';
            if (id.includes('tailwindcss')) return 'tailwind-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
})