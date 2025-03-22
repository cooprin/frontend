import { defineStore } from 'pinia'
import { useAuthActions } from './authActions'
import { useAuthState } from './authState'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...useAuthState(),
  }),
  getters: {
    isAuthenticated: (state) => {
      // Перевіряємо наявність токена і користувача
      if (!state.token || !state.user) return false

      // Можна додати перевірку терміну дії JWT, якщо
      // ваш токен містить поле exp
      try {
        // Проста перевірка без використання бібліотек
        const tokenParts = state.token.split('.')
        if (tokenParts.length !== 3) return false

        const payload = JSON.parse(atob(tokenParts[1]))
        const now = Math.floor(Date.now() / 1000)

        // Якщо токен закінчився, повертаємо false
        if (payload.exp && payload.exp < now) return false

        return true
      } catch (e) {
        console.error('Помилка при перевірці токена:', e)
        return false
      }
    },

    // Перевірка наявності хоча б одного права з масиву
    hasAnyPermission: (state) => (permissions) => {
      if (!state.user?.permissions) return false
      return permissions.some((permission) => state.user.permissions.includes(permission))
    },

    // Перевірка наявності всіх прав з масиву
    hasAllPermissions: (state) => (permissions) => {
      if (!state.user?.permissions) return false
      return permissions.every((permission) => state.user.permissions.includes(permission))
    },
  },
  actions: useAuthActions(),
})
