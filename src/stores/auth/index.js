import { defineStore } from 'pinia'
import { useAuthActions } from './authActions'
import { useAuthState } from './authState'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...useAuthState(),
  }),
  getters: {
    isAuthenticated: (state) => {
      const hasToken = !!state.token
      const hasUser = !!state.user
      console.log('isAuthenticated перевірка:', { hasToken, hasUser })
      return hasToken && hasUser
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
