import './assets/main.css'

import { createApp, type Plugin } from 'vue'
import App from './App.vue'

const app = createApp(App)
const modules = import.meta.glob<{ default: Plugin }>('./plugins/*.ts', { eager: true })

for (const path of Object.keys(modules).sort()) {
  app.use(modules[path]!.default)
}

app.mount('#app')
