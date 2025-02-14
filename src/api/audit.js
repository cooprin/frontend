import { api } from 'boot/axios'

export const AuditApi = {
  getLogs: (params) => {
    return api.get('/audit-logs', { params })
  },

  getTypes: () => {
    return api.get('/audit-logs/types')
  },

  exportLogs: (params) => {
    return api.get('/audit-logs/export', {
      params,
      responseType: 'blob',
    })
  },
}
