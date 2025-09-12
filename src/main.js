import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import piniaPersist from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'

import {auth} from '@/firebase'
import 'bootstrap/dist/css/bootstrap.min.css'
import Aura from '@primevue/themes/aura'  
import { createPinia } from 'pinia'
import { useUserStore } from './store/user'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersist)

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,   
  }
})

auth.onAuthStateChanged(async (user) => {
  const userStore = useUserStore()
  console.log('user:')
  console.log(user)
  
  

  if (user){
    userStore.setUser(user.uid, user.email, null)
    console.log(user.uid)
    console.log(user.email)
    await userStore.fetchUserRole()
  } else{
    userStore.clearUser()
    
  }

})



app.mount('#app')
// createApp(App).mount('#app')
