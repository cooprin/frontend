// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Створюємо екземпляр axios
const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default boot(({ app, router }) => {
  // Додаємо інтерцептор запитів для додавання токена
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    console.log('Інтерцептор запитів: Перевірка токена =', !!token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // НЕ перериваємо запит тут, дозволяємо запиту пройти далі навіть без токена
    // Сервер сам вирішить, чи потрібна авторизація
    return config
  })

  // Додайте перехоплювачі для дебагу
  api.interceptors.request.use((request) => {
    console.log('Запит:', request)
    return request
  })

  api.interceptors.response.use(
    (response) => {
      console.log('Успішна відповідь:', response)
      return response
    },
    (error) => {
      console.error('Помилка відповіді:', error)

      // Обробка помилки 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        console.log('Токен недійсний або закінчився. Перенаправлення на логін.')

        // Очищуємо дані автентифікації в localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Перенаправляємо на сторінку логування тільки якщо це не сторінка логіну
        if (router.currentRoute.value.path !== '/auth/login') {
          router.push('/auth/login')
        }
      }

      return Promise.reject(error)
    },
  )

  // Робимо api доступним через this.$api
  app.config.globalProperties.$api = api
})

export { api }
