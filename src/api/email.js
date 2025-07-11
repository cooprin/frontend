import { api } from 'boot/axios'

export const EmailApi = {
  // Отримати налаштування email
  getEmailSettings: () => {
    return api.get('/email/settings')
  },

  // Зберегти налаштування email
  saveEmailSettings: (data) => {
    return api.post('/email/settings', data)
  },

  // Тестувати з'єднання
  testConnection: () => {
    return api.post('/email/test-connection')
  },

  // Відправити тестовий email
  sendTestEmail: (recipient) => {
    return api.post('/email/send-test', { recipient })
  },
}
