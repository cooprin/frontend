import { api } from 'boot/axios'

export const ModelsApi = {
  // Отримання списку моделей з фільтрами і пагінацією
  getModels: (params) => {
    return api.get('/models', { params })
  },

  // Створення моделі
  createModel: (data) => {
    return api.post('/models', data)
  },

  // Оновлення моделі
  updateModel: (id, data) => {
    return api.put(`/models/${id}`, data)
  },

  // Видалення моделі
  deleteModel: (id) => {
    return api.delete(`/models/${id}`)
  },

  // Завантаження зображення моделі
  uploadImage: (modelId, formData) => {
    return api.post(`/models/${modelId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
