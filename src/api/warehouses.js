import { api } from 'boot/axios'

export const WarehousesApi = {
  // Отримання списку складів з фільтрами і пагінацією
  getWarehouses: (params) => {
    return api.get('/warehouses', { params })
  },

  // Створення складу
  createWarehouse: (data) => {
    return api.post('/warehouses', data)
  },

  // Оновлення складу
  updateWarehouse: (id, data) => {
    return api.put(`/warehouses/${id}`, data)
  },

  // Видалення складу
  deleteWarehouse: (id) => {
    return api.delete(`/warehouses/${id}`)
  },

  // Отримання залишків на складі
  getStock: (warehouseId, params) => {
    return api.get(`/warehouses/${warehouseId}/stock`, { params })
  },

  // Отримання історії операцій
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
