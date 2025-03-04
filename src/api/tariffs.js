import { api } from 'boot/axios'

export const TariffsApi = {
  // Отримання списку тарифів з фільтрами і пагінацією
  getTariffs: (params) => {
    return api.get('/tariffs', { params })
  },

  // Отримання конкретного тарифу
  getTariff: (id) => {
    return api.get(`/tariffs/${id}`)
  },

  // Створення нового тарифу
  createTariff: (data) => {
    return api.post('/tariffs', data)
  },

  // Оновлення існуючого тарифу
  updateTariff: (id, data) => {
    return api.put(`/tariffs/${id}`, data)
  },

  // Видалення тарифу
  deleteTariff: (id) => {
    return api.delete(`/tariffs/${id}`)
  },

  // Призначення тарифу об'єкту
  assignTariffToObject: (data) => {
    return api.post('/tariffs/assign', data)
  },

  // Отримання історії тарифів для об'єкта
  getObjectTariffHistory: (objectId) => {
    return api.get(`/tariffs/history/${objectId}`)
  },
}
