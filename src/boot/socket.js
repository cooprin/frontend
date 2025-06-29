import { boot } from 'quasar/wrappers'
import SocketService from 'src/services/socketService'
import { useAuthStore } from 'src/stores/auth'

export default boot(({ app, router }) => {
  // Робимо SocketService доступним глобально
  app.config.globalProperties.$socket = SocketService

  // Підключаємо Socket.io після успішної аутентифікації
  router.afterEach((to) => {
    const authStore = useAuthStore()

    // Підключаємося тільки якщо користувач аутентифікований
    // і ми не на сторінці логування
    if (authStore.isAuthenticated && !to.path.includes('/auth/login')) {
      // Невелика затримка щоб переконатися що store ініціалізований
      setTimeout(() => {
        if (!SocketService.isConnected()) {
          SocketService.connect()
        }
      }, 500)
    } else {
      // Відключаємося якщо користувач не аутентифікований
      if (SocketService.isConnected()) {
        SocketService.disconnect()
      }
    }
  })

  // Слухаємо зміни стану авторизації через Pinia
  const authStore = useAuthStore()
  authStore.$subscribe((mutation, state) => {
    if (state.token && !SocketService.isConnected()) {
      // Підключаємося при авторизації
      setTimeout(() => {
        SocketService.connect()
      }, 100)
    } else if (!state.token && SocketService.isConnected()) {
      // Відключаємося при виході
      SocketService.disconnect()
    }
  })

  // Якщо користувач уже авторизований при завантаженні, підключаємося
  if (authStore.isAuthenticated) {
    setTimeout(() => {
      if (!SocketService.isConnected()) {
        SocketService.connect()
      }
    }, 1000)
  }

  // Додаємо SocketService до window для дебагу (тільки в development)
  if (process.env.NODE_ENV === 'development') {
    window.SocketService = SocketService
  }
})
