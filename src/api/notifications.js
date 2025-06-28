import { api } from 'boot/axios'

export const NotificationsApi = {
  // Отримання списку сповіщень
  getNotifications(params = {}) {
    return api.get('/notifications', { params })
  },

  // Отримання кількості непрочитаних
  getUnreadCount() {
    return api.get('/notifications/unread-count')
  },

  // Позначити як прочитане
  markAsRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`)
  },

  // Позначити всі як прочитані
  markAllAsRead() {
    return api.patch('/notifications/read-all')
  },

  // Налаштування сповіщень
  getSettings() {
    return api.get('/notifications/settings')
  },

  // Оновлення налаштувань
  updateSettings(settings) {
    return api.put('/notifications/settings', settings)
  },
}
