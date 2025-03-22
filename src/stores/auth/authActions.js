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
    // Перевіряємо валідність токена при ініціалізації
    const token = this.token
    if (token) {
      try {
        // Якщо токен є у форматі JWT, перевіряємо термін його дії
        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          const now = Math.floor(Date.now() / 1000)

          // Якщо токен вже закінчився, розлогінюємося
          if (payload.exp && payload.exp < now) {
            console.log('Токен закінчився при ініціалізації. Автоматичний вихід.')
            this.logout()
            return
          }
        }

        // Якщо токен валідний, оновлюємо дані користувача
        this.fetchUser()
      } catch (e) {
        console.error('Помилка при перевірці токена при ініціалізації:', e)
        this.logout()
      }
    }
  },
})
