import { api } from 'boot/axios'

export const RolesApi = {
  getRoles: (params) => {
    return api.get('/roles', { params })
  },

  createRole: (data) => {
    return api.post('/roles', data)
  },

  updateRole: (id, data) => {
    return api.put(`/roles/${id}`, data)
  },

  deleteRole: (id) => {
    return api.delete(`/roles/${id}`)
  },

  getRolePermissions: (id) => {
    return api.get(`/roles/${id}/permissions`)
  },

  getPermissions: () => {
    return api.get('/roles/permissions')
  },
}
