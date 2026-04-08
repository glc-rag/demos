import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    // Nem proxyzünk semmit - minden kérés a helyi fájlokat szolgálja ki
    // Az API hívások a .env-ben megadott VITE_API_BASE_URL-re mennek
  },
});