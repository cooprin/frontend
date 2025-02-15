import { api } from 'boot/axios'

export const ManufacturersApi = {
  // Отримання списку виробників з фільтрами і пагінацією
  getManufacturers: async (params) => {
    try {
      const cleanParams = Object.entries(params)
        .filter(([, value]) => value != null && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

      const response = await api.get('/manufacturers', {
        params: cleanParams,
        validateStatus: (status) => status >= 200 && status < 300,
      })

      return response
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error)
      throw error
    }
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
