import { api } from 'boot/axios'

export const CompanyApi = {
  // Отримання даних компанії
  getCompanyDetails: () => {
    return api.get('/company')
  },

  // Збереження даних компанії
  saveCompanyDetails: (data) => {
    return api.post('/company', data)
  },

  // Завантаження логотипу
  uploadLogo: (formData) => {
    return api.post('/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Банківські рахунки
  getBankAccounts: () => {
    return api.get('/company/bank-accounts')
  },

  createBankAccount: (data) => {
    return api.post('/company/bank-accounts', data)
  },

  updateBankAccount: (id, data) => {
    return api.put(`/company/bank-accounts/${id}`, data)
  },

  deleteBankAccount: (id) => {
    return api.delete(`/company/bank-accounts/${id}`)
  },

  // Юридичні документи
  getLegalDocuments: () => {
    return api.get('/company/legal-documents')
  },

  uploadLegalDocument: (formData) => {
    return api.post('/company/legal-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteLegalDocument: (id) => {
    return api.delete(`/company/legal-documents/${id}`)
  },

  // Інтеграція з Wialon - ОНОВЛЕНО
  getWialonIntegration: () => {
    return api.get('/wialon-integration')
  },

  saveWialonIntegration: (data) => {
    return api.post('/wialon-integration', data)
  },

  testWialonConnection: () => {
    return api.post('/wialon-integration/test-connection')
  },

  // ЗАМІНЕНО: тепер використовуємо правильний ендпоінт для синхронізації
  syncWialonObjects: () => {
    return api.post('/wialon-sync/start')
  },

  // Системні налаштування
  getSystemSettings: (category) => {
    return api.get('/company/settings', { params: { category } })
  },

  getSetting: (category, key) => {
    return api.get(`/company/settings/${category}/${key}`)
  },

  saveSetting: (data) => {
    return api.post('/company/settings', data)
  },

  deleteSetting: (id) => {
    return api.delete(`/company/settings/${id}`)
  },

  // Утилітні методи
  getDocumentUrl: (filePath) => {
    if (!filePath) return null
    return `${process.env.API_URL}/uploads/${filePath}`
  },
}
