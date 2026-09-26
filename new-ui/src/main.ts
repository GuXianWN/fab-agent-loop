import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import plugins from './plugins'

createApp(App).use(plugins).mount('#app')
