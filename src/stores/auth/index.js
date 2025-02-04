import { defineStore } from 'pinia'
import { useAuthActions } from './authActions'
import { useAuthState } from './authState'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...useAuthState(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    hasRole: (state) => (role) => state.user?.roles?.includes(role),
  },
  actions: useAuthActions(),
})
