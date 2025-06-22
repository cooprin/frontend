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

  // Get client documents
  getDocuments: () => {
    return api.get('/portal/documents')
  },
}
