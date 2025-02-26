import { api } from 'boot/axios'

export const SuppliersApi = {
  // Отримання списку постачальників з фільтрами і пагінацією
  getSuppliers: (params) => {
    return api.get('/suppliers', { params })
  },

  // Створення постачальника
  createSupplier: (data) => {
    return api.post('/suppliers', data)
  },

  // Оновлення постачальника
  updateSupplier: (id, data) => {
    return api.put(`/suppliers/${id}`, data)
  },

  // Видалення постачальника
  deleteSupplier: (id) => {
    return api.delete(`/suppliers/${id}`)
  },
  getSupplier: (id) => {
    return api.get(`/suppliers/${id}`)
  },
}
