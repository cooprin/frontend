import { Notify } from 'quasar'
import { AuthApi } from 'src/api/auth' // Змінюємо імпорт

export const useAuthActions = () => ({
  // Метод реєстрації
  async register(credentials) {
    try {
      this.loading = true
      await AuthApi.register(credentials) // Використовуємо AuthApi
      Notify.create({
        type: 'positive',
        message: 'Реєстрація успішна! Тепер ви можете увійти.',
      })
      return true
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error.response?.data?.message || 'Помилка реєстрації',
      })
      return false
    } finally {
      this.loading = false
    }
  },

  // Метод входу
  async login(credentials) {
    try {
      this.loading = true
      const { data } = await AuthApi.login(credentials) // Використовуємо AuthApi
      this.token = data.token
      this.user = data.user

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      Notify.create({
        type: 'positive',
        message: 'Ласкаво просимо!',
      })
      return true
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error.response?.data?.message || 'Помилка входу',
      })
      return false
    } finally {
      this.loading = false
    }
  },

  // Метод отримання даних користувача
  async fetchUser() {
    try {
      const { data } = await AuthApi.fetchUser() // Використовуємо AuthApi
      this.user = data
      localStorage.setItem('user', JSON.stringify(data))
    } catch {
      this.logout()
    }
  },

  // Метод для виходу
  async logout() {
    try {
      await AuthApi.logout() // Використовуємо AuthApi
    } catch (error) {
      console.error('Помилка при виході:', error)
    } finally {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      Notify.create({
        type: 'info',
        message: 'Ви вийшли з системи',
      })
    }
  },

  // Метод ініціалізації
  initializeStore() {
    if (this.token) {
      this.fetchUser()
    }
  },
})
