import { Notify } from 'quasar'
import { api } from 'boot/axios'

export const useAuthActions = () => ({
  // Метод реєстрації
  async register(credentials) {
    try {
      this.loading = true
      await api.post('/auth/register', credentials)
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
      const { data } = await api.post('/auth/login', credentials)
      console.log('Received data from server:', data.user) // Перевіримо які дані приходять

      this.token = data.token
      this.user = data.user

      console.log('User data in store:', this.user) // Перевіримо дані в сторі
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      console.log('Saved user data:', JSON.parse(localStorage.getItem('user'))) // Перевіримо що зберігається

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
      const { data } = await api.get('/auth/me')
      this.user = data
      localStorage.setItem('user', JSON.stringify(data))
    } catch {
      this.logout()
    }
  },

  // Метод для виходу
  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    Notify.create({
      type: 'info',
      message: 'Ви вийшли з системи',
    })
  },

  // Метод ініціалізації
  initializeStore() {
    if (this.token) {
      this.fetchUser()
    }
  },
})
