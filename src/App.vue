<script setup>
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Функція для оновлення назви вкладки
const updateTitle = (to) => {
  document.title = to.meta.title || 'Cooprins CRM'
}

// Встановлюємо назву при першому завантаженні
updateTitle(route)

// Спостерігаємо за змінами маршруту і оновлюємо назву
watch(route, (newRoute) => {
  updateTitle(newRoute)
})

// Перевіряємо токен при завантаженні додатка
onMounted(() => {
  console.log('App component mounted')

  // Перевіряємо валідність токена при завантаженні додатку
  // Але пропускаємо перевірку, якщо вже на сторінці логування
  if (route.path !== '/auth/login' && localStorage.getItem('token') && !authStore.isAuthenticated) {
    console.log('Токен недійсний при запуску додатку. Перенаправлення на логін.')
    authStore.logout()
    router.push('/auth/login')
  }
})
</script>
