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

      // Зберігаємо токен
      this.token = data.token
      localStorage.setItem('token', data.token)

      // Зберігаємо права
      this.permissions = data.user.permissions
      localStorage.setItem('permissions', JSON.stringify(data.user.permissions))

      // Зберігаємо користувача
      this.user = data.user
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
      const { data } = await api.get('/auth/me')
      this.user = data
      this.permissions = data.permissions
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('permissions', JSON.stringify(data.permissions))
    } catch {
      this.logout()
    }
  },

  // Метод для виходу
  logout() {
    this.token = null
    this.user = null
    this.permissions = []
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    Notify.create({
      type: 'info',
      message: 'Ви вийшли з системи',
    })
  },

  // Перевірка наявності права
  can(permissionCode) {
    return this.permissions.includes(permissionCode)
  },

  // Перевірка наявності хоча б одного з прав
  hasAnyPermission(permissionCodes) {
    return permissionCodes.some((code) => this.permissions.includes(code))
  },

  // Перевірка наявності всіх прав
  hasAllPermissions(permissionCodes) {
    return permissionCodes.every((code) => this.permissions.includes(code))
  },

  // Метод оновлення профілю
  async updateProfile(profileData) {
    try {
      this.loading = true
      const formData = new FormData()
      if (profileData.firstName) formData.append('firstName', profileData.firstName)
      if (profileData.lastName) formData.append('lastName', profileData.lastName)
      if (profileData.password) formData.append('password', profileData.password)
      if (profileData.avatar) formData.append('avatar', profileData.avatar)

      const { data } = await api.put('/user/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      this.user = data.user
      localStorage.setItem('user', JSON.stringify(data.user)) // Оновлення user в localStorage

      Notify.create({
        type: 'positive',
        message: 'Профіль успішно оновлено!',
      })
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error.response?.data?.message || 'Не вдалося оновити профіль',
      })
      throw error
    } finally {
      this.loading = false
    }
  },

  // Доданий метод ініціалізації
  initializeStore() {
    if (this.token) {
      this.fetchUser()
    }
  },
})
