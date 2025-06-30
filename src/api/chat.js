import { api } from 'boot/axios'

export const ChatApi = {
  // NEW: Get active chat for client
  getActiveChat() {
    return api.get('/chat/active')
  },

  // Отримання кімнат чату
  getRooms() {
    return api.get('/chat/rooms')
  },

  // Створення нової кімнати
  createRoom(data) {
    return api.post('/chat/rooms', data)
  },

  // NEW: Delete chat room (staff only)
  deleteRoom(roomId) {
    return api.delete(`/chat/rooms/${roomId}`)
  },

  // Отримання повідомлень
  getMessages(roomId, params = {}) {
    return api.get(`/chat/rooms/${roomId}/messages`, { params })
  },

  // Відправка повідомлення
  sendMessage(roomId, messageData) {
    return api.post(`/chat/rooms/${roomId}/messages`, messageData)
  },

  // Позначити як прочитане
  markAsRead(roomId) {
    return api.patch(`/chat/rooms/${roomId}/read`)
  },

  // Статус співробітників (для клієнтів)
  getStaffStatus() {
    return api.get('/chat/staff-status')
  },

  // Закриття чату (для співробітників)
  closeRoom(roomId) {
    return api.patch(`/chat/rooms/${roomId}/close`)
  },

  // Призначення чату (для співробітників)
  assignRoom(roomId, staffId) {
    return api.patch(`/chat/rooms/${roomId}/assign`, { staffId })
  },

  // ===========================================
  // STAFF CHAT MANAGEMENT API METHODS
  // ===========================================

  // Отримання всіх чатів для співробітників
  getRoomsForStaff(params = {}) {
    return api.get('/chat/staff/rooms', { params })
  },

  // Отримання метрик чатів
  getChatMetrics() {
    return api.get('/chat/staff/metrics')
  },

  // Масове призначення чатів
  bulkAssignRooms(data) {
    return api.post('/chat/staff/bulk-assign', data)
  },

  // Масове закриття чатів
  bulkCloseRooms(data) {
    return api.post('/chat/staff/bulk-close', data)
  },

  // Пошук по чатам та повідомленнях
  searchChats(params = {}) {
    return api.get('/chat/staff/search', { params })
  },

  // Отримання доступних співробітників
  getAvailableStaff() {
    return api.get('/chat/staff/available')
  },

  // Статистика по співробітниках
  getStaffWorkload() {
    return this.getChatMetrics().then((response) => ({
      ...response,
      data: {
        ...response.data,
        staff_workload: response.data.staff_workload || [],
      },
    }))
  },
}
