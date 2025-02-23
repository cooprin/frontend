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

  // Отримання поточного місцезнаходження товару
  getCurrentLocation: (productId) => {
    return api.get(`/stock/current-location/${productId}`)
  },

  // Переміщення товару між складами
  transferStock: (data) => {
    return api.post('/stock/transfer', data)
  },

  // Встановлення товару на об'єкт
  installProduct: (data) => {
    return api.post('/stock/install', data)
  },

  // Демонтаж товару з об'єкту
  uninstallProduct: (data) => {
    return api.post('/stock/uninstall', data)
  },

  // Відправка товару в ремонт
  sendToRepair: (data) => {
    return api.post('/stock/repair/send', data)
  },

  // Повернення товару з ремонту
  returnFromRepair: (data) => {
    return api.post('/stock/repair/return', data)
  },

  // Списання товару
  writeOffProduct: (data) => {
    return api.post('/stock/write-off', data)
  },
}
