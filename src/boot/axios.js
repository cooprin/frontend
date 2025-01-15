import axios from 'axios'

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
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
    return Promise.reject(error)
  },
)

export { api }
