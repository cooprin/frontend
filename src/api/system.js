import { api } from 'boot/axios'

export const SystemApi = {
  // Отримати онлайн статистику
  getOnlineStats: () => {
    return api.get('/system/online-stats')
  },

  // Отримати системний статус
  getSystemStatus: () => {
    return api.get('/system/status')
  },
}
