import { defineStore } from 'pinia'
import { useAuthActions } from './authActions'
import { useAuthState } from './authState'

export const useAuthStore = defineStore('auth', {
  state: useAuthState, // Прибираємо виклик функції ()
  actions: useAuthActions, // Прибираємо виклик функції ()
})
