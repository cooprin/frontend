import { createApp } from 'vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(Quasar, quasarUserOptions)
app.use(pinia)

// Ініціалізуємо authStore після створення pinia
const authStore = useAuthStore()
await authStore.initializeStore()

app.use(router)
app.mount('#app')
