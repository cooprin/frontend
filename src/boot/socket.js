import { boot } from 'quasar/wrappers'
import socketService from 'src/services/socketService'
import { useAuthStore } from 'src/stores/auth'

export default boot(({ app, router }) => {
  // Робимо socketService доступним глобально
  app.config.globalProperties.$socket = socketService

  // Підключаємо Socket.io після успішної аутентифікації
  router.afterEach((to) => {
    const authStore = useAuthStore()

    // Підключаємося тільки якщо користувач аутентифікований
    // і ми не на сторінці логування
    if (authStore.isAuthenticated && !to.path.includes('/auth/login')) {
      // Невелика затримка щоб переконатися що store ініціалізований
      setTimeout(() => {
        if (!socketService.isConnected()) {
          socketService.connect()
        }
      }, 500)
    } else {
      // Відключаємося якщо користувач не аутентифікований
      if (socketService.isConnected()) {
        socketService.disconnect()
      }
    }
  })

  // Додаємо Socket.io до window для дебагу (тільки в development)
  if (process.env.NODE_ENV === 'development') {
    window.socketService = socketService
  }
})
