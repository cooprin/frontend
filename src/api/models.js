import { api } from 'boot/axios'

export const ModelsApi = {
  // Отримання списку моделей з фільтрами і пагінацією
  getModels: (params) => {
    return api.get('/models', { params })
  },

  getModel: (id) => {
    return api.get(`/models/${id}`)
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
  getModelFiles: (modelId) => {
    return api.get(`/models/${modelId}/files`)
  },

  uploadModelFile: (modelId, formData) => {
    return api.post(`/models/${modelId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteModelFile: (modelId, fileId) => {
    return api.delete(`/models/${modelId}/files/${fileId}`)
  },

  // Допоміжний метод для отримання шляху до файлу
  getFileUrl: (filePath) => {
    if (!filePath) return null
    return `${process.env.API_URL}/uploads/${filePath}`
  },
}
