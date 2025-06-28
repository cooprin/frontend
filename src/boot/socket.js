import { boot } from 'quasar/wrappers'
import socketService from 'src/services/socketService'

export default boot(({ app }) => {
  // Додаємо socket сервіс до глобальних властивостей
  app.config.globalProperties.$socket = socketService

  // Ініціалізуємо підключення
  socketService.connect()
})

export { socketService }
