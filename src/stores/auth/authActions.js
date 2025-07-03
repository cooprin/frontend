import { Notify } from 'quasar'
import { AuthApi } from 'src/api/auth' // Змінюємо імпорт

export const useAuthActions = () => ({
  // Метод входу
  async login(credentials) {
    try {
      this.loading = true
      const { data } = await AuthApi.login(credentials)

      this.token = data.token

      // Handle different user types
      if (data.userType === 'staff') {
        this.user = data.user
        this.userType = 'staff'
      } else if (data.userType === 'client') {
        this.user = data.client
        this.userType = 'client'
      }

      localStorage.setItem('token', data.token)

      Notify.create({
        type: 'positive',
        message: data.userType === 'staff' ? 'Welcome!' : 'Welcome to your personal account!',
      })
      return { success: true, userType: data.userType }
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error.response?.data?.message || 'Login error',
      })
      return { success: false }
    } finally {
      this.loading = false
    }
  },

  // Метод отримання даних користувача
  async fetchUser() {
    try {
      const { data } = await AuthApi.fetchUser()

      // Handle different user types
      if (data.userType === 'staff') {
        this.user = data
        this.userType = 'staff'
      } else if (data.userType === 'client') {
        this.user = data
        this.userType = 'client'
      }
    } catch {
      this.logout()
    }
  },

  // Метод для виходу
  async logout() {
    try {
      await AuthApi.logout()
    } catch (error) {
      console.error('Error on exit:', error)
    } finally {
      this.token = null
      this.user = null
      this.userType = null
      localStorage.removeItem('token')
      Notify.create({
        type: 'info',
        message: 'You are logged out',
      })
    }
  },

  // Метод ініціалізації
  async initializeStore() {
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
            console.log('The token expired during initialization. Automatic logout.')
            this.logout()
            return
          }
        }

        // Якщо токен валідний, оновлюємо дані користувача
        await this.fetchUser()
      } catch (e) {
        console.error('Error checking the token during initialization:', e)
        this.logout()
      }
    }
  },
})
