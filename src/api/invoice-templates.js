import { api } from 'boot/axios'

export const InvoiceTemplatesApi = {
  // Отримання списку шаблонів
  getTemplates: (params) => {
    return api.get('/invoice-templates', { params })
  },

  // Отримання шаблону за ID
  getTemplateById: (id) => {
    return api.get(`/invoice-templates/${id}`)
  },

  // Створення шаблону
  createTemplate: (data) => {
    return api.post('/invoice-templates', data)
  },

  // Оновлення шаблону
  updateTemplate: (id, data) => {
    return api.put(`/invoice-templates/${id}`, data)
  },

  // Видалення шаблону
  deleteTemplate: (id) => {
    return api.delete(`/invoice-templates/${id}`)
  },

  // Отримання шаблону за замовчуванням
  getDefaultTemplate: () => {
    return api.get('/invoice-templates/default/template')
  },

  // Попередній перегляд PDF на основі шаблону
  previewInvoicePdf: (invoiceId, templateId) => {
    return api.get(`/services/invoices/${invoiceId}/pdf/${templateId}`, {
      responseType: 'blob',
    })
  },
}
