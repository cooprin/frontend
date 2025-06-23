import { api } from 'boot/axios'

export const ChatApi = {
  // Get chat rooms for client
  getRooms: () => {
    return api.get('/chat/rooms')
  },

  // Create new chat room
  createRoom: (data) => {
    return api.post('/chat/rooms', data)
  },

  // Get messages for a room
  getMessages: (roomId, params) => {
    return api.get(`/chat/rooms/${roomId}/messages`, { params })
  },

  // Send message to room
  sendMessage: (roomId, data) => {
    return api.post(`/chat/rooms/${roomId}/messages`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Mark room messages as read
  markAsRead: (roomId) => {
    return api.patch(`/chat/rooms/${roomId}/read`)
  },

  // Get file URL for download
  getFileUrl: (filePath) => {
    if (!filePath) return null
    return `${process.env.API_URL}/uploads/chat/${filePath}`
  },

  // Download file
  downloadFile: (fileId) => {
    return api.get(`/chat/files/${fileId}/download`, {
      responseType: 'blob',
    })
  },

  // Convert chat to ticket
  convertToTicket: (roomId, data) => {
    return api.post(`/chat/rooms/${roomId}/convert-to-ticket`, data)
  },

  // Get online status of staff
  getStaffStatus: () => {
    return api.get('/chat/staff/status')
  },

  // Send typing indicator
  sendTyping: (roomId) => {
    return api.post(`/chat/rooms/${roomId}/typing`)
  },
}
