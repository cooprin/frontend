import { api } from 'boot/axios'

export const PermissionsApi = {
  getPermissions: (params) => {
    return api.get('/permissions', { params })
  },

  createPermission: (data) => {
    return api.post('/permissions', data)
  },

  updatePermission: (id, data) => {
    return api.put(`/permissions/${id}`, data)
  },

  deletePermission: (id) => {
    return api.delete(`/permissions/${id}`)
  },

  getGroups: () => {
    return api.get('/permissions/groups')
  },

  createGroup: (data) => {
    return api.post('/permissions/groups', data)
  },

  updateGroup: (id, data) => {
    return api.put(`/permissions/groups/${id}`, data)
  },

  deleteGroup: (id) => {
    return api.delete(`/permissions/groups/${id}`)
  },
}
