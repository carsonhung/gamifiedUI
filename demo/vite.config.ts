import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.DEMO_BASE ?? '/',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        eggette: resolve(import.meta.dirname, 'eggette.html'),
      },
    },
  },
});