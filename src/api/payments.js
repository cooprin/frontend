import { api } from 'boot/axios'

export const PaymentsApi = {
  // Існуючі методи
  getPayments: (params) => {
    return api.get('/billing/payments', { params })
  },

  getClientPayments: (clientId, params) => {
    return api.get(`/billing/payments/client/${clientId}`, { params })
  },

  getPayment: (id) => {
    return api.get(`/billing/payments/${id}`)
  },

  createPayment: (data) => {
    return api.post('/billing/payments', data)
  },

  updatePayment: (id, data) => {
    return api.put(`/billing/payments/${id}`, data)
  },

  deletePayment: (id) => {
    return api.delete(`/billing/payments/${id}`)
  },

  getPaymentsStatistics: (params) => {
    return api.get('/billing/payments/statistics', { params })
  },

  getObjectPaymentHistory: (objectId, params) => {
    return api.get(`/billing/payments/object/${objectId}`, { params })
  },

  exportPayments: (params) => {
    return api.get('/billing/payments/export', {
      params,
      responseType: 'blob',
    })
  },

  // Нові методи
  getObjectPaidPeriods: (objectId) => {
    return api.get(`/billing/payments/periods/${objectId}`)
  },

  isPeriodPaid: (objectId, year, month) => {
    return api.get(`/billing/payments/is-period-paid/${objectId}`, {
      params: { year, month },
    })
  },

  getNextUnpaidPeriod: (objectId) => {
    return api.get(`/billing/payments/next-unpaid-period/${objectId}`)
  },

  getClientObjectsWithPayments: (clientId, year, month) => {
    return api.get(`/billing/payments/client-objects/${clientId}`, {
      params: { year, month },
    })
  },

  getAvailablePaymentPeriods: (objectId, count = 12) => {
    return api.get(`/billing/payments/available-periods/${objectId}`, {
      params: { count },
    })
  },

  createPeriodPayment: (data) => {
    return api.post('/billing/payments/period-payment', data)
  },
}
