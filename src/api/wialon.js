import { api } from 'boot/axios'

export const WialonApi = {
  // Існуючі методи
  getObjects: (params) => {
    return api.get('/wialon', { params })
  },

  getObject: (id) => {
    return api.get(`/wialon/${id}`)
  },

  createObject: (data) => {
    return api.post('/wialon', data)
  },

  updateObject: (id, data) => {
    return api.put(`/wialon/${id}`, data)
  },

  deleteObject: (id) => {
    return api.delete(`/wialon/${id}`)
  },

  changeOwner: (id, data) => {
    return api.post(`/wialon/${id}/change-owner`, data)
  },

  getOwnershipHistory: (objectId) => {
    return api.get(`/wialon/${objectId}/ownership-history`)
  },

  // Нові методи
  getObjectWithPaymentInfo: (id) => {
    return api.get(`/wialon/${id}/payment-info`)
  },

  getPlannedTariffs: (objectId) => {
    return api.get(`/wialon/${objectId}/planned-tariffs`)
  },

  getPaymentStatus: (objectId, params) => {
    return api.get(`/wialon/${objectId}/payment-status`, { params })
  },
}
