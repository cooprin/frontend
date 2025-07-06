import { api } from 'boot/axios'

export const PortalApi = {
  // Get client profile
  getProfile: () => {
    return api.get('/portal/profile')
  },

  // Get client objects
  getObjects: () => {
    return api.get('/portal/objects')
  },

  // Get client objects real-time data
  getObjectsRealTimeData: () => {
    return api.get('/portal/objects/real-time-data')
  },

  // Get client invoices
  getInvoices: (params) => {
    return api.get('/portal/invoices', { params })
  },

  // Get single invoice details with items
  getInvoice: (invoiceId) => {
    return api.get(`/portal/invoices/${invoiceId}`)
  },

  // Get invoice items
  getInvoiceItems: (invoiceId) => {
    return api.get(`/portal/invoices/${invoiceId}/items`)
  },

  // НОВІ МЕТОДИ ДЛЯ ДОКУМЕНТІВ
  // Get invoice documents
  getInvoiceDocuments: (invoiceId) => {
    return api.get(`/portal/invoices/${invoiceId}/documents`)
  },

  // Download invoice document
  downloadInvoiceDocument: (documentId) => {
    return api.get(`/portal/invoice-documents/${documentId}/download`, {
      responseType: 'blob',
    })
  },

  // Get client documents
  getDocuments: () => {
    return api.get('/portal/documents')
  },

  // Get client payment status (Wialon)
  getPaymentStatus: () => {
    return api.get('/portal/payment-status')
  },

  // Get document URL for download/preview
  getDocumentUrl: (filePath) => {
    if (!filePath) return null
    return `${process.env.API_URL}/uploads${filePath}`
  },
}
