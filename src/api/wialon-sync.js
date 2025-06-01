import { api } from 'boot/axios'

export const WialonSyncApi = {
  // Сесії синхронізації
  async getSessions(params = {}) {
    return api.get('/wialon-sync/sessions', { params })
  },

  async getSession(sessionId) {
    return api.get(`/wialon-sync/sessions/${sessionId}`)
  },

  async startSync() {
    return api.post('/wialon-sync/start')
  },

  // Розбіжності
  async getDiscrepancies(params = {}) {
    return api.get('/wialon-sync/discrepancies', { params })
  },

  async resolveDiscrepancies(discrepancyIds, action, notes = null) {
    return api.post('/wialon-sync/discrepancies/resolve', {
      discrepancyIds,
      action,
      notes,
    })
  },

  // Правила синхронізації
  async getRules(params = {}) {
    return api.get('/wialon-sync/rules', { params })
  },

  async createRule(data) {
    return api.post('/wialon-sync/rules', data)
  },

  async updateRule(ruleId, data) {
    return api.put(`/wialon-sync/rules/${ruleId}`, data)
  },

  async deleteRule(ruleId) {
    return api.delete(`/wialon-sync/rules/${ruleId}`)
  },

  async executeRule(ruleId) {
    return api.post(`/wialon-sync/rules/${ruleId}/execute`)
  },

  // Логи синхронізації
  async getLogs(params = {}) {
    return api.get('/wialon-sync/logs', { params })
  },

  async clearLogs(params = {}) {
    return api.delete('/wialon-sync/logs', { data: params })
  },

  // Логи конкретної сесії
  async getSessionLogs(sessionId) {
    return api.get(`/wialon-sync/sessions/${sessionId}/logs`)
  },
}
