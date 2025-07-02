export default {
  // Заголовки і дії
  title: 'Звіти',
  create: 'Створити звіт',
  edit: 'Редагувати звіт',
  manage: 'Керування звітами',
  execute: 'Виконати',
  add: 'Додати звіт',
  clone: 'Клонувати звіт',
  testExecute: 'Тестове виконання',

  // Поля звіту
  name: 'Назва звіту',
  code: 'Код звіту',
  description: 'Опис',
  sqlQuery: 'SQL запит',
  outputFormat: 'Формат виводу',
  executionTimeout: 'Час очікування виконання',
  cacheDuration: 'Тривалість кешування',
  chartConfig: 'Конфігурація діаграми',
  isActive: 'Активний',

  // Підказки
  codeHint: 'Унікальний ідентифікатор звіту (літери, цифри, підкреслення)',
  cacheDurationHint: '0 = без кешу, >0 = кешувати на вказану кількість хвилин',
  chartConfigHint: 'JSON конфігурація для відображення діаграми',
  sqlParametersHint: 'Використовуйте :назва_параметра в SQL для посилання на параметри',

  // Формати виводу
  formats: {
    table: 'Таблиця',
    chart: 'Діаграма',
    export: 'Тільки експорт',
    both: 'Таблиця + Діаграма',
  },

  // Параметри
  parameters: 'Параметри',
  addParameter: 'Додати параметр',
  editParameter: 'Редагувати параметр',
  noParameters: 'Параметри не визначені',
  parameterName: 'Назва параметра',
  displayName: 'Відображувана назва',
  parameterType: 'Тип параметра',
  defaultValue: 'Значення за замовчуванням',
  isRequired: "Обов'язковий",
  ordering: 'Порядок',

  // Типи параметрів
  parameterTypes: {
    text: 'Текст',
    number: 'Число',
    date: 'Дата',
    datetime: 'Дата і час',
    select: 'Вибір',
    multiselect: 'Множинний вибір',
    boolean: 'Так/Ні',
    clientId: 'Клієнт',
    userId: 'Користувач',
  },

  // Прив'язки до сторінок
  pageAssignments: "Прив'язки до сторінок",
  addPageAssignment: "Додати прив'язку до сторінки",
  editPageAssignment: "Редагувати прив'язку до сторінки",
  noPageAssignments: "Не прив'язано до жодної сторінки",
  pageIdentifier: 'Ідентифікатор сторінки',
  pageTitle: 'Заголовок сторінки',
  displayOrder: 'Порядок відображення',
  isVisible: 'Видимий',
  autoExecute: 'Автоматичне виконання',
  pagesAssigned: "Прив'язані сторінки",
  notAssigned: "Не прив'язано",

  // Ідентифікатори сторінок
  pages: {
    dashboard: 'Панель керування',
    clients: 'Клієнти',
    wialonObjects: "Об'єкти Wialon",
    billing: 'Біллінг',
    products: 'Продукти',
    warehouses: 'Склади',
    services: 'Послуги',
    users: 'Користувачі',
    audit: 'Аудит',
    tickets: 'Тікети',
    chat: 'Чат',
  },

  // Виконання звітів
  results: 'Результати',
  executionTime: 'Час виконання',
  rowsCount: 'Кількість рядків',
  rowsReturned: 'рядків повернено',
  fromCache: 'З кешу',
  servedFromCache: 'Результат отримано з кешу',
  noData: 'Дані не повернуто',
  export: 'Експорт',

  // Статуси виконання
  statuses: {
    success: 'Успішно',
    error: 'Помилка',
    timeout: 'Перевищено час очікування',
    cancelled: 'Скасовано',
  },

  // Фільтри
  filters: {
    search: 'Пошук звітів',
    status: 'Статус',
    outputFormat: 'Формат виводу',
    executionStatus: 'Статус виконання',
    executedBy: 'Виконано користувачем',
    dateFrom: 'Дата з',
    dateTo: 'Дата до',
  },

  // Історія виконання
  executionHistory: 'Історія виконання',
  executedAt: 'Виконано о',
  executedBy: 'Виконано користувачем',
  executedByType: 'Тип виконавця',
  executions: 'Виконання',
  viewDetails: 'Переглянути деталі',
  executionDetails: 'Деталі виконання',
  executionInfo: 'Інформація про виконання',
  rerunWithSameParameters: 'Повторити з тими ж параметрами',
  downloadResults: 'Завантажити результати',
  systemExecution: 'Система',
  ipAddress: 'IP адреса',
  userAgent: 'User Agent',
  errorMessage: 'Повідомлення про помилку',
  technicalDetails: 'Технічні деталі',
  history: 'Історія',

  // Повідомлення успіху
  createSuccess: 'Звіт успішно створено',
  updateSuccess: 'Звіт успішно оновлено',
  deleteSuccess: 'Звіт успішно видалено',
  cloneSuccess: 'Звіт успішно клоновано',
  executionSuccess: 'Звіт успішно виконано',
  testExecuteSuccess: 'Звіт успішно виконано',
  rerunSuccess: 'Звіт успішно перевиконано',
  exportSuccess: 'Результати успішно експортовано',
  downloadSuccess: 'Результати успішно завантажено',
  cacheCleared: 'Кеш успішно очищено',
  loadFromFilesSuccess: 'Звіти успішно завантажено з файлів',

  // Повідомлення помилок
  errorLoadingReport: 'Помилка завантаження звіту',
  errorLoadingReports: 'Помилка завантаження списку звітів',
  errorLoadingParameters: 'Помилка завантаження параметрів звіту',
  errorLoadingHistory: 'Помилка завантаження історії виконання',
  saveError: 'Помилка збереження звіту',
  executionError: 'Помилка виконання звіту',
  testExecuteError: 'Помилка тестування звіту',
  rerunError: 'Помилка повторного виконання звіту',
  exportError: 'Помилка експорту результатів',
  downloadError: 'Помилка завантаження результатів',
  previewError: 'Помилка попереднього перегляду запиту',
  cloneError: 'Помилка клонування звіту',
  cacheClearError: 'Помилка очищення кешу',
  loadFromFilesError: 'Помилка завантаження звітів з файлів',
  exportHistoryError: 'Помилка експорту історії',

  // Підтвердження
  deleteConfirmation: 'Ви впевнені, що хочете видалити цей звіт?',

  // Управління
  clearCache: 'Очистити кеш',
  loadFromFiles: 'Завантажити з файлів',
  previewQuery: 'Попередній перегляд запиту',
  queryPreview: 'Попередній перегляд запиту',
  noPreviewData: 'Немає даних для попереднього перегляду',
  viewSchema: 'Переглянути схему',
  help: 'Допомога',
  sqlParameters: 'SQL параметри',
  exportHistory: 'Експортувати історію',
  exportHistoryNotImplemented: 'Експорт історії ще не реалізовано',

  // Загальні
  status: 'Статус',
  active: 'Активний',
  inactive: 'Неактивний',
}
