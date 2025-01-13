import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null, // додано зчитування user з localStorage
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
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

    async login(credentials) {
      try {
        this.loading = true
        const { data } = await api.post('/auth/login', credentials)
        this.token = data.token
        localStorage.setItem('token', data.token)
        await this.fetchUser()
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

    async fetchUser() {
      try {
        const { data } = await api.get('/auth/me')
        this.user = data
        localStorage.setItem('user', JSON.stringify(data)) // додано збереження user
      } catch {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user') // додано видалення user
      Notify.create({
        type: 'info',
        message: 'Ви вийшли з системи',
      })
    },

    // Додано нову функцію для ініціалізації даних
    initializeStore() {
      if (this.token) {
        this.fetchUser()
      }
    },
  },
})
