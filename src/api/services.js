import { api } from 'boot/axios'

export const ServicesApi = {
  // Отримання списку послуг з фільтрами і пагінацією
  getServices: (params) => {
    return api.get('/services', { params })
  },

  // Отримання конкретної послуги
  getService: (id) => {
    return api.get(`/services/${id}`)
  },

  // Створення нової послуги
  createService: (data) => {
    return api.post('/services', data)
  },

  // Оновлення існуючої послуги
  updateService: (id, data) => {
    return api.put(`/services/${id}`, data)
  },

  // Видалення послуги
  deleteService: (id) => {
    return api.delete(`/services/${id}`)
  },

  // Припинення надання послуги клієнту
  terminateClientService: (id, data) => {
    return api.post(`/services/terminate/${id}`, data)
  },

  // Отримання послуг клієнта
  getClientServices: (clientId) => {
    return api.get(`/services/client/${clientId}`)
  },

  // Створення рахунку
  createInvoice: (data) => {
    return api.post('/services/invoices', data)
  },

  // Отримання рахунків клієнта
  getClientInvoices: (clientId, params) => {
    return api.get(`/services/invoices/client/${clientId}`, { params })
  },

  // Отримання деталей рахунку
  getInvoiceDetails: (id) => {
    return api.get(`/services/invoices/${id}`)
  },

  // Зміна статусу рахунку
  updateInvoiceStatus: (id, data) => {
    return api.put(`/services/invoices/${id}/status`, data)
  },

  // Завантаження документа для рахунку
  uploadInvoiceDocument: (invoiceId, formData) => {
    return api.post(`/services/invoices/${invoiceId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  // Відправка email сповіщення про рахунок
  sendInvoiceEmail: (invoiceId, templateCode = null) => {
    const data = templateCode ? { templateCode } : {}
    return api.post(`/services/invoices/${invoiceId}/send-email`, data)
  },
}
