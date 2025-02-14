import { api } from 'boot/axios'

export const ResourcesApi = {
  getResources: (params) => {
    return api.get('/resources', { params })
  },

  createResource: (data) => {
    return api.post('/resources', data)
  },

  updateResource: (id, data) => {
    return api.put(`/resources/${id}`, data)
  },

  deleteResource: (id) => {
    return api.delete(`/resources/${id}`)
  },

  getResourceActions: (id) => {
    return api.get(`/resources/${id}/actions`)
  },

  updateResourceActions: (id, data) => {
    return api.put(`/resources/${id}/actions`, data)
  },
}
