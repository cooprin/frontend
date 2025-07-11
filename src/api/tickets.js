import { api } from 'boot/axios'

export const TicketsApi = {
  // Get ticket categories
  getCategories: () => {
    return api.get('/tickets/categories')
  },

  // Get tickets with filters
  getTickets: (params) => {
    return api.get('/tickets', { params })
  },

  // Get single ticket
  getTicket: (id) => {
    return api.get(`/tickets/${id}`)
  },

  // Create new ticket
  createTicket: (data) => {
    return api.post('/tickets', data)
  },

  // Update ticket (staff only)
  updateTicket: (id, data) => {
    return api.put(`/tickets/${id}`, data)
  },

  // Get ticket comments
  getComments: (ticketId) => {
    return api.get(`/ticket-comments/ticket/${ticketId}`)
  },

  // Add comment to ticket
  addComment: (ticketId, data) => {
    return api.post(`/ticket-comments/ticket/${ticketId}`, data)
  },

  // Update comment
  updateComment: (commentId, data) => {
    return api.put(`/ticket-comments/${commentId}`, data)
  },

  // Delete comment
  deleteComment: (commentId) => {
    return api.delete(`/ticket-comments/${commentId}`)
  },
  // Метрики заявок для дашборду
  getTicketsMetrics: () => {
    return api.get('/tickets/metrics')
  },

  // Розподіл заявок за статусами
  getTicketsStatusDistribution: () => {
    return api.get('/tickets/status-distribution')
  },

  // Останні заявки
  getRecentTickets: (params) => {
    return api.get('/tickets/recent', { params })
  },

  // Статистика заявок за категоріями
  getTicketsByCategory: () => {
    return api.get('/tickets/by-category')
  },
  getStaff: () => {
    return api.get('/tickets/staff')
  },
  bulkAssignTickets: (data) => {
    return api.post('/tickets/bulk-assign', data)
  },

  bulkUpdateStatus: (data) => {
    return api.post('/tickets/bulk-status', data)
  },

  bulkUpdatePriority: (data) => {
    return api.post('/tickets/bulk-priority', data)
  },
}
