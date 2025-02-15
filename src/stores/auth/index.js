import { defineStore } from 'pinia'
import { useAuthActions } from './authActions'
import { useAuthState } from './authState'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...useAuthState(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,

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
