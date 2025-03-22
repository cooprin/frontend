// src/boot/axios.js - мінімальна модифікація тільки для обробки 401 помилок

import axios from 'axios'
import { boot } from 'quasar/wrappers'

// Створюємо екземпляр axios
const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Додаємо інтерцептор запитів для додавання токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default boot(({ app, router }) => {
  // Додаємо інтерцептор відповідей для обробки 401 помилок
  api.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // Обробка помилки 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        console.log('401 помилка: Перенаправлення на логін')

        // Показуємо сповіщення користувачу
        const { Notify } = require('quasar')
        Notify.create({
          type: 'warning',
          message: 'Ваша сесія закінчилася. Будь ласка, увійдіть знову.',
          position: 'top',
          timeout: 5000,
        })

        // Перенаправляємо на сторінку логування
        router.push('/auth/login')
      }

      return Promise.reject(error)
    },
  )

  // Робимо api доступним через this.$api
  app.config.globalProperties.$api = api
})

export { api }
