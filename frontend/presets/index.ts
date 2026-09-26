import { fileURLToPath, URL } from 'node:url'
import ui from '@nuxt/ui/vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import Layouts from 'vite-plugin-vue-meta-layouts'

const src = fileURLToPath(new URL('../src/', import.meta.url))

export default defineConfig({
  plugins: [
    VueRouter({
      dts: 'presets/types/typed-router.d.ts',
      routesFolder: 'src/pages',
    }),
    vue(),
    Layouts({ skipTopLevelRouteLayout: true }),
    ui({
      ui: {
        colors: {
          primary: 'blue',
          neutral: 'zinc',
        },
      },
      autoImport: {
        dts: 'presets/types/auto-imports.d.ts',
        imports: ['vue', 'vue-router', '@vueuse/core'],
        dirs: ['src/api', 'src/composables', 'src/stores'],
      },
      components: {
        dts: 'presets/types/components.d.ts',
        dirs: ['src/components'],
        directoryAsNamespace: false,
        collapseSamePrefixes: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': src,
      '~': src,
    },
  },
})
