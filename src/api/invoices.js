import { api } from 'boot/axios'

export const InvoicesApi = {
  // Отримання списку рахунків з фільтрами і пагінацією
  getInvoices: (params) => {
    return api.get('/invoices', { params })
  },

  // Отримання рахунків клієнта
  getClientInvoices: (clientId, params) => {
    return api.get(`/services/invoices/client/${clientId}`, { params })
  },

  // Отримання конкретного рахунку
  getInvoice: (id) => {
    return api.get(`/services/invoices/${id}`)
  },

  // Створення нового рахунку
  createInvoice: (data) => {
    return api.post('/services/invoices', data)
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

  // Допоміжний метод для отримання шляху до файлу
  getDocumentUrl: (filePath) => {
    if (!filePath) return null
    return `${process.env.API_URL}/uploads/${filePath}`
  },
}
