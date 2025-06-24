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

  // Get client invoices
  getInvoices: (params) => {
    return api.get('/portal/invoices', { params })
  },

  // Get single invoice details
  getInvoice: (invoiceId) => {
    return api.get(`/portal/invoices/${invoiceId}`)
  },

  // Download invoice PDF
  downloadInvoice: (invoiceId) => {
    return api.get(`/portal/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    })
  },

  // Get invoice items
  getInvoiceItems: (invoiceId) => {
    return api.get(`/portal/invoices/${invoiceId}/items`)
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
    return `${process.env.API_URL}/uploads/client_documents${filePath}`
  },
}
