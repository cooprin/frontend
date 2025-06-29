import { api } from 'boot/axios'

export const InvoicesApi = {
  // Існуючі методи
  getInvoices: (params) => {
    return api.get('/services/invoices', { params })
  },

  getClientInvoices: (clientId, params) => {
    return api.get(`/services/invoices/client/${clientId}`, { params })
  },

  getInvoice: (id) => {
    return api.get(`/services/invoices/${id}`)
  },

  createInvoice: (data) => {
    return api.post('/services/invoices', data)
  },

  updateInvoiceStatus: (id, data) => {
    return api.put(`/services/invoices/${id}/status`, data)
  },

  uploadInvoiceDocument: (invoiceId, formData) => {
    return api.post(`/services/invoices/${invoiceId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  getDocumentUrl: (filePath) => {
    if (!filePath) return null
    return `${process.env.API_URL}/uploads/${filePath}`
  },

  generateInvoicePdf: (id, language = 'uk') => {
    console.log('API: Sending PDF request with language:', language)
    return api.get(`/services/invoices/${id}/pdf`, {
      params: { lang: language },
      responseType: 'blob',
    })
  },

  generateInvoices: (data) => {
    return api.post('/services/invoices/generate', data)
  },

  // Нові методи
  generateInvoicesForClient: (clientId, data) => {
    return api.post(`/services/invoices/generate-for-client/${clientId}`, data)
  },

  checkPendingInvoices: (clientId, params) => {
    return api.get(`/services/invoices/check-pending/${clientId}`, { params })
  },

  generateSmartInvoice: (data) => {
    return api.post('/services/invoices/generate-smart', data)
  },

  checkInvoiceExistence: (objectId, year, month) => {
    return api.get('/services/invoices/check-existence', {
      params: {
        objectId,
        year,
        month,
      },
    })
  },
  getPdfInvoice(invoiceId) {
    return api.get(`/services/invoices/${invoiceId}/pdf`, { responseType: 'blob' })
  },
  updateInvoice: (id, data) => {
    return api.put(`/services/invoices/${id}`, data)
  },
}
