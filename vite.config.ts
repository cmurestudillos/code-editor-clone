import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: [
            'codemirror',
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/lang-html',
            '@codemirror/lang-css',
            '@codemirror/lang-javascript',
            '@codemirror/theme-one-dark',
          ],
        },
      },
    },
  },
  preview: {
    port: 3000,
  },
});
