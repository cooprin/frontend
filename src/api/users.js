import { api } from 'boot/axios'

export const UsersApi = {
  getUsers: (params) => {
    return api.get('/user', { params })
  },

  createUser: (data) => {
    return api.post('/user', data)
  },

  updateUser: (id, data) => {
    return api.put(`/user/${id}`, data)
  },

  deleteUser: (id, force = false) => {
    return api.delete(`/user/${id}${force ? '?force=true' : ''}`)
  },

  updateStatus: (id, data) => {
    return api.put(`/user/${id}/status`, data)
  },

  changePassword: (id, data) => {
    return api.put(`/user/${id}/password`, data)
  },

  getRoles: () => {
    return api.get('/user/roles')
  },
}
