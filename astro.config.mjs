// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // Monaco Editor is loaded from CDN at runtime — never bundle it.
    // This was causing a JavaScript heap OOM during Cloudflare Pages builds.
    build: {
      rollupOptions: {
        external: ['monaco-editor'],
      },
    },
    optimizeDeps: {
      exclude: ['monaco-editor'],
    },
  },
});
