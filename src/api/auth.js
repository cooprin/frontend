import { api } from 'boot/axios'

export const AuthApi = {
  login: (data) => {
    return api.post('/auth/login', data)
  },

  register: (data) => {
    return api.post('/auth/register', data)
  },

  logout: () => {
    return api.post('/auth/logout')
  },

  fetchUser: () => {
    return api.get('/auth/me')
  },

  updateProfile: (data) => {
    return api.put('/profile/update-profile', data)
  },

  changePassword: (data) => {
    return api.put('/profile/change-password', data)
  },

  uploadAvatar: (formData) => {
    return api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
