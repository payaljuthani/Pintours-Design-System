import { defineConfig } from 'vite';

export default defineConfig({
  root: 'docs',
  server: { port: 3333 },
  build:  { outDir: '../docs/dist', emptyOutDir: true },
});
