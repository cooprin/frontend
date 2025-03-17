import { api } from 'boot/axios'

export const PaymentsApi = {
  // Отримання списку платежів з фільтрами і пагінацією
  getPayments: (params) => {
    return api.get('/billing/payments', { params })
  },

  // Отримання платежів клієнта
  getClientPayments: (clientId, params) => {
    return api.get(`/billing/payments/client/${clientId}`, { params })
  },

  // Отримання деталей платежу
  getPayment: (id) => {
    return api.get(`/billing/payments/${id}`)
  },

  // Створення нового платежу
  createPayment: (data) => {
    return api.post('/billing/payments', data)
  },

  // Редагування платежу
  updatePayment: (id, data) => {
    return api.put(`/billing/payments/${id}`, data)
  },

  // Видалення платежу
  deletePayment: (id) => {
    return api.delete(`/billing/payments/${id}`)
  },

  // Отримання статистики платежів
  getPaymentsStatistics: (params) => {
    return api.get('/billing/payments/statistics', { params })
  },

  // Отримання історії платежів за об'єктом
  getObjectPaymentHistory: (objectId, params) => {
    return api.get(`/billing/payments/object/${objectId}`, { params })
  },

  // Експорт платежів в Excel
  exportPayments: (params) => {
    return api.get('/billing/payments/export', {
      params,
      responseType: 'blob',
    })
  },
}
