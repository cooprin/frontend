import { api } from 'boot/axios'

export const WialonSyncApi = {
  // =================== СЕСІЇ ===================

  // Отримання списку сесій синхронізації
  getSessions: (params = {}) => {
    return api.get('/wialon-sync/sessions', { params })
  },

  // Отримання деталей конкретної сесії
  getSession: (sessionId) => {
    return api.get(`/wialon-sync/sessions/${sessionId}`)
  },

  // Запуск нової синхронізації
  startSync: () => {
    return api.post('/wialon-sync/start')
  },

  // =================== РОЗБІЖНОСТІ ===================

  // Отримання списку розбіжностей
  getDiscrepancies: (params = {}) => {
    return api.get('/wialon-sync/discrepancies', { params })
  },

  // Вирішення розбіжностей (масово)
  resolveDiscrepancies: (discrepancyIds, action, notes = null) => {
    return api.post('/wialon-sync/discrepancies/resolve', {
      discrepancyIds,
      action,
      notes,
    })
  },

  // Отримання статистики розбіжностей
  getDiscrepanciesStats: (sessionId = null) => {
    const params = sessionId ? { sessionId } : {}
    return api.get('/wialon-sync/discrepancies/stats', { params })
  },

  // =================== ПРАВИЛА ===================

  // Отримання списку правил синхронізації
  getRules: (params = {}) => {
    return api.get('/wialon-sync/rules', { params })
  },

  // Створення нового правила
  createRule: (ruleData) => {
    return api.post('/wialon-sync/rules', ruleData)
  },

  // Оновлення правила
  updateRule: (ruleId, ruleData) => {
    return api.put(`/wialon-sync/rules/${ruleId}`, ruleData)
  },

  // Видалення правила
  deleteRule: (ruleId) => {
    return api.delete(`/wialon-sync/rules/${ruleId}`)
  },

  // Виконання конкретного правила
  executeRule: (ruleId) => {
    return api.post(`/wialon-sync/rules/${ruleId}/execute`)
  },

  // =================== ЛОГИ ===================

  // Отримання логів синхронізації
  getLogs: (params = {}) => {
    return api.get('/wialon-sync/logs', { params })
  },

  // Отримання логів конкретної сесії
  getSessionLogs: (sessionId, params = {}) => {
    return api.get(`/wialon-sync/sessions/${sessionId}/logs`, { params })
  },

  // Очищення логів
  clearLogs: (beforeDate = null) => {
    const data = beforeDate ? { beforeDate } : {}
    return api.delete('/wialon-sync/logs', { data })
  },

  // =================== НАЛАШТУВАННЯ ===================

  // Отримання налаштувань синхронізації
  getSettings: () => {
    return api.get('/wialon-sync/settings')
  },

  // Збереження налаштувань синхронізації
  saveSettings: (settings) => {
    return api.post('/wialon-sync/settings', settings)
  },

  // =================== СТАТИСТИКА ===================

  // Отримання загальної статистики
  getStats: (period = '30d') => {
    return api.get('/wialon-sync/stats', { params: { period } })
  },

  // Отримання статистики виконання правил
  getRulesStats: (period = '7d') => {
    return api.get('/wialon-sync/rules/stats', { params: { period } })
  },

  // =================== УТИЛІТНІ МЕТОДИ ===================

  // Перевірка статусу поточної синхронізації
  getCurrentSyncStatus: () => {
    return api.get('/wialon-sync/status')
  },

  // Скасування поточної синхронізації
  cancelSync: (sessionId) => {
    return api.post(`/wialon-sync/sessions/${sessionId}/cancel`)
  },

  // Експорт логів у файл
  exportLogs: (params = {}) => {
    return api.get('/wialon-sync/logs/export', {
      params,
      responseType: 'blob',
    })
  },

  // Експорт розбіжностей у файл
  exportDiscrepancies: (params = {}) => {
    return api.get('/wialon-sync/discrepancies/export', {
      params,
      responseType: 'blob',
    })
  },

  // =================== ВАЛІДАЦІЯ ===================

  // Валідація SQL запиту правила
  validateRule: (sqlQuery) => {
    return api.post('/wialon-sync/rules/validate', { sqlQuery })
  },

  // Тестування правила без виконання
  testRule: (ruleData) => {
    return api.post('/wialon-sync/rules/test', ruleData)
  },
}
