import { api } from 'boot/axios'

export const ClientsApi = {
  // Отримання списку клієнтів з фільтрами і пагінацією
  getClients: (params) => {
    return api.get('/clients', { params })
  },

  // Отримання конкретного клієнта за ID
  getClient: (id) => {
    return api.get(`/clients/${id}`)
  },

  // Створення нового клієнта
  createClient: (data) => {
    return api.post('/clients', data)
  },

  // Оновлення існуючого клієнта
  updateClient: (id, data) => {
    return api.put(`/clients/${id}`, data)
  },

  // Видалення клієнта
  deleteClient: (id) => {
    return api.delete(`/clients/${id}`)
  },

  // Отримання документів клієнта
  getClientDocuments: (clientId) => {
    return api.get(`/clients/${clientId}/documents`)
  },

  // Завантаження документа для клієнта
  uploadDocument: (clientId, formData) => {
    return api.post(`/clients/${clientId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Видалення документа клієнта
  deleteDocument: (clientId, documentId) => {
    return api.delete(`/clients/${clientId}/documents/${documentId}`)
  },

  // Завантаження документа (отримання URL)
  getDocumentUrl: (filePath) => {
    if (!filePath) return null
    return `${process.env.API_URL}/uploads/${filePath}`
  },
}
