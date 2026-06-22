import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import './assets/theme.css'
import router from './router'
import '@/styles/layout.css'
import '@/styles/buttons.css'
import '@/styles/components.css'
import '@/styles/tables.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
