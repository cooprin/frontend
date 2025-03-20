import { api } from 'boot/axios'

export const TariffsApi = {
  // Існуючі методи
  getTariffs: (params) => {
    return api.get('/tariffs', { params })
  },

  getTariff: (id) => {
    return api.get(`/tariffs/${id}`)
  },

  createTariff: (data) => {
    return api.post('/tariffs', data)
  },

  updateTariff: (id, data) => {
    return api.put(`/tariffs/${id}`, data)
  },

  deleteTariff: (id) => {
    return api.delete(`/tariffs/${id}`)
  },

  assignTariffToObject: (data) => {
    return api.post('/tariffs/assign', data)
  },

  getObjectTariffHistory: (objectId) => {
    return api.get(`/tariffs/history/${objectId}`)
  },

  // Нові методи
  getOptimalChangeDate: (objectId) => {
    return api.get(`/tariffs/optimal-change-date/${objectId}`)
  },

  getPlannedChanges: (params) => {
    return api.get('/tariffs/planned-changes', { params })
  },

  cancelPlannedChange: (objectId) => {
    return api.post(`/tariffs/cancel-planned-change/${objectId}`)
  },
}
