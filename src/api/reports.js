import { api } from 'boot/axios'

export const ReportsApi = {
  // === ПУБЛИЧНЫЕ МЕТОДЫ (для всех авторизованных пользователей) ===

  // Получение звітов для конкретной страницы
  getPageReports: (pageIdentifier) => {
    return api.get(`/reports/page/${pageIdentifier}`)
  },

  // Выполнение звіта с параметрами
  executeReport: (reportId, params = {}) => {
    return api.post(`/reports/${reportId}/execute`, {
      parameters: params.parameters || {},
      pageIdentifier: params.pageIdentifier || null,
    })
  },

  // === АДМИНИСТРАТИВНЫЕ МЕТОДЫ (только для персонала) ===

  // Получение списка всех звітов с фильтрами и пагинацией
  getReports: (params) => {
    return api.get('/reports', { params })
  },

  // Получение конкретного звіта за ID
  getReport: (id) => {
    return api.get(`/reports/${id}`)
  },

  // Создание нового звіта
  createReport: (data) => {
    return api.post('/reports', data)
  },

  // Обновление существующего звіта
  updateReport: (id, data) => {
    return api.put(`/reports/${id}`, data)
  },

  // Удаление звіта
  deleteReport: (id) => {
    return api.delete(`/reports/${id}`)
  },

  // Получение истории выполнения звіта
  getExecutionHistory: (reportId, params = {}) => {
    return api.get(`/reports/${reportId}/history`, { params })
  },

  // Очистка устаревшего кеша
  clearExpiredCache: () => {
    return api.post('/reports/cache/clear')
  },

  // Завантаження звітів з файлів (замінити існуючий метод)
  loadReportsFromFiles: (formData) => {
    return api.post('/reports/load-from-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  // Валидация SQL запроса (будущая функциональность)
  validateSqlQuery: () => {
    // TODO: Implement SQL validation on backend
    return Promise.resolve({ valid: true })
  },

  // Получение доступных типов параметров
  getParameterTypes: () => {
    return Promise.resolve({
      data: [
        { value: 'text', label: 'Текст' },
        { value: 'number', label: 'Число' },
        { value: 'date', label: 'Дата' },
        { value: 'datetime', label: 'Дата и время' },
        { value: 'select', label: 'Выбор из списка' },
        { value: 'multiselect', label: 'Множественный выбор' },
        { value: 'boolean', label: 'Да/Нет' },
        { value: 'client_id', label: 'Клиент' },
        { value: 'user_id', label: 'Пользователь' },
      ],
    })
  },

  // Получение доступных форматов вывода
  getOutputFormats: () => {
    return Promise.resolve({
      data: [
        { value: 'table', label: 'Таблица' },
        { value: 'chart', label: 'График' },
        { value: 'export', label: 'Только экспорт' },
        { value: 'both', label: 'Таблица + График' },
      ],
    })
  },

  // Получение доступных идентификаторов страниц
  getPageIdentifiers: () => {
    return Promise.resolve({
      data: [
        { value: 'dashboard', label: 'Главная страница' },
        { value: 'clients', label: 'Клиенты' },
        { value: 'wialon-objects', label: 'Объекты Wialon' },
        { value: 'billing', label: 'Платежная система' },
        { value: 'products', label: 'Товары' },
        { value: 'warehouses', label: 'Склады' },
        { value: 'services', label: 'Услуги' },
        { value: 'users', label: 'Пользователи' },
        { value: 'audit', label: 'Аудит' },
        { value: 'tickets', label: 'Заявки' },
        { value: 'chat', label: 'Чат' },
        { value: 'notifications', label: 'Уведомления' },
      ],
    })
  },

  // Экспорт результатов звіта (будущая функциональность)
  exportReportResults: (reportId, params = {}, format = 'xlsx') => {
    return api.post(
      `/reports/${reportId}/export`,
      {
        parameters: params.parameters || {},
        format: format,
        pageIdentifier: params.pageIdentifier || null,
      },
      {
        responseType: 'blob',
      },
    )
  },

  // Предварительный просмотр SQL запроса (первые 10 строк)
  previewSqlQuery: (sqlQuery, parameters = {}) => {
    return api.post('/reports/preview-sql', {
      sql_query: sqlQuery,
      parameters: parameters,
      limit: 10,
    })
  },

  // Получение схемы базы данных для помощи в написании SQL
  getDatabaseSchema: () => {
    return api.get('/reports/database-schema')
  },

  // Сохранение параметров звіта как шаблон
  saveReportTemplate: (reportId, templateName, parameters) => {
    return api.post(`/reports/${reportId}/templates`, {
      template_name: templateName,
      parameters: parameters,
    })
  },

  // Получение сохраненных шаблонов для звіта
  getReportTemplates: (reportId) => {
    return api.get(`/reports/${reportId}/templates`)
  },

  // Удаление шаблона звіта
  deleteReportTemplate: (reportId, templateId) => {
    return api.delete(`/reports/${reportId}/templates/${templateId}`)
  },

  // Получение статистики выполнения звітов
  getReportsStatistics: (params = {}) => {
    return api.get('/reports/statistics', { params })
  },

  // Клонирование звіта
  cloneReport: (reportId, newName = null) => {
    return api.post(`/reports/${reportId}/clone`, {
      new_name: newName,
    })
  },

  // Получение зависимостей звіта (какие таблицы использует)
  getReportDependencies: (reportId) => {
    return api.get(`/reports/${reportId}/dependencies`)
  },

  // Тестирование подключения к базе данных
  testDatabaseConnection: () => {
    return api.get('/reports/test-connection')
  },
}
