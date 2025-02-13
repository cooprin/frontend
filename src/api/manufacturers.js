import { api } from 'boot/axios'

export const ManufacturersApi = {
  // Отримання списку виробників з фільтрами і пагінацією
  getManufacturers: (params) => {
    return api.get('/manufacturers', { params })
  },

  // Створення виробника
  createManufacturer: (data) => {
    return api.post('/manufacturers', data)
  },

  // Оновлення виробника
  updateManufacturer: (id, data) => {
    return api.put(`/manufacturers/${id}`, data)
  },

  // Видалення виробника
  deleteManufacturer: (id) => {
    return api.delete(`/manufacturers/${id}`)
  },
}
