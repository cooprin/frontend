import { defineStore } from 'pinia'
import { useAuthActions } from './authActions'
import { useAuthState } from './authState'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...useAuthState(),
  }),
  getters: {
    isAuthenticated: (state) => {
      // Базова перевірка наявності токена і користувача
      const hasToken = !!state.token
      const hasUser = !!state.user
      const hasUserType = !!state.userType

      if (!hasToken || !hasUser || !hasUserType) {
        console.log('isAuthenticated перевірка: відсутній токен, користувач або тип користувача', {
          hasToken,
          hasUser,
          hasUserType,
        })
        return false
      }

      // Додаткова перевірка JWT токена (якщо він у форматі JWT)
      try {
        const tokenParts = state.token.split('.')
        if (tokenParts.length === 3) {
          // Це схоже на JWT токен, перевіримо його термін дії
          const payload = JSON.parse(atob(tokenParts[1]))
          const now = Math.floor(Date.now() / 1000)

          // Якщо токен містить поле exp і воно менше, ніж поточний час
          if (payload.exp && payload.exp < now) {
            console.log(
              'Токен закінчився, час закінчення:',
              new Date(payload.exp * 1000).toLocaleString(),
            )
            return false
          }
        }

        console.log('isAuthenticated перевірка: токен валідний')
        return true
      } catch (e) {
        console.error('Помилка при перевірці JWT токена:', e)
        return false
      }
    },

    // Check if user is staff
    isStaff: (state) => {
      return state.userType === 'staff'
    },

    // Check if user is client
    isClient: (state) => {
      return state.userType === 'client'
    },

    // Перевірка наявності хоча б одного права з масиву (тільки для персоналу)
    hasAnyPermission: (state) => (permissions) => {
      if (state.userType !== 'staff' || !state.user?.permissions) return false
      return permissions.some((permission) => state.user.permissions.includes(permission))
    },

    // Перевірка наявності всіх прав з масиву (тільки для персоналу)
    hasAllPermissions: (state) => (permissions) => {
      if (state.userType !== 'staff' || !state.user?.permissions) return false
      return permissions.every((permission) => state.user.permissions.includes(permission))
    },

    // Get appropriate redirect path based on user type
    getDefaultRoute: (state) => {
      if (state.userType === 'staff') {
        return '/admin/dashboard'
      } else if (state.userType === 'client') {
        return '/portal/dashboard'
      }
      return '/auth/login'
    },
  },
  actions: useAuthActions(),
})
