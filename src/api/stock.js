import { api } from 'boot/axios'

export const StockApi = {
  // Отримання залишків з фільтрами і пагінацією
  getStock: (params) => {
    return api.get('/stock', { params })
  },

  // Отримання історії руху
  getMovements: (params) => {
    return api.get('/stock/movements', { params })
  },

  // Переміщення товару між складами
  transferStock: (data) => {
    return api.post('/stock/transfer', data)
  },

  // Коригування кількості
  adjustStock: (data) => {
    return api.post('/stock/adjust', data)
  },
}
