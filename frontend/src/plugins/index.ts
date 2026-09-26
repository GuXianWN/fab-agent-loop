import type { Plugin } from 'vue'
import ui from './nuxt-ui'
import pinia from './pinia'
import router from './router'

export default {
  install(app) {
    app.use(ui).use(pinia).use(router)
  },
} satisfies Plugin
