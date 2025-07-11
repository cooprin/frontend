import { api } from 'boot/axios'

export const EmailTemplatesApi = {
  // Отримання всіх шаблонів
  getTemplates: () => {
    return api.get('/email-templates')
  },

  // Отримання конкретного шаблону
  getTemplate: (id) => {
    return api.get(`/email-templates/${id}`)
  },

  // Створення шаблону
  createTemplate: (data) => {
    return api.post('/email-templates', data)
  },

  // Оновлення шаблону
  updateTemplate: (id, data) => {
    return api.put(`/email-templates/${id}`, data)
  },

  // Видалення шаблону
  deleteTemplate: (id) => {
    return api.delete(`/email-templates/${id}`)
  },
}
