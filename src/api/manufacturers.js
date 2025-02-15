import { api } from 'boot/axios'

export const ManufacturersApi = {
  // Отримання списку виробників з фільтрами і пагінацією
  getManufacturers: (params) => {
    return api.get('/manufacturers', {
      params,
      // Додаємо обробку помилок
      validateStatus: function (status) {
        return status >= 200 && status < 300
      },
    })
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
