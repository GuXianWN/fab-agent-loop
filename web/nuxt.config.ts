import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  alias: {
    '#shared': fileURLToPath(new URL('../shared/types/index.ts', import.meta.url)),
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api',
    },
  },
})
