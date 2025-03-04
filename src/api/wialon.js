import { api } from 'boot/axios'

export const WialonApi = {
  // Отримання списку об'єктів з фільтрами і пагінацією
  getObjects: (params) => {
    return api.get('/wialon', { params })
  },

  // Отримання конкретного об'єкта
  getObject: (id) => {
    return api.get(`/wialon/${id}`)
  },

  // Створення нового об'єкта
  createObject: (data) => {
    return api.post('/wialon', data)
  },

  // Оновлення існуючого об'єкта
  updateObject: (id, data) => {
    return api.put(`/wialon/${id}`, data)
  },

  // Видалення об'єкта
  deleteObject: (id) => {
    return api.delete(`/wialon/${id}`)
  },

  // Зміна власника об'єкта
  changeOwner: (id, data) => {
    return api.post(`/wialon/${id}/change-owner`, data)
  },

  // Отримання історії зміни власників об'єкта
  getOwnershipHistory: (objectId) => {
    return api.get(`/wialon/${objectId}/ownership-history`)
  },
}
