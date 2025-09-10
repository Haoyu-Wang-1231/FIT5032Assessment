import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import piniaPersist from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'

import 'bootstrap/dist/css/bootstrap.min.css'
import Aura from '@primevue/themes/aura'  
import { createPinia } from 'pinia'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersist)
app.use(PrimeVue, {
  theme: {
    preset: Aura,   
  }
})

app.use(pinia)
app.use(PrimeVue)
app.use(router)

app.mount('#app')
// createApp(App).mount('#app')
