import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.DEMO_BASE ?? '/',
  plugins: [tailwindcss()],
});
