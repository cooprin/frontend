export default {
  // Заголовки і дії
  title: 'Заявки',
  add: 'Створити заявку',
  edit: 'Редагувати заявку',
  create: 'Створити заявку',
  delete: 'Видалити заявку',
  view: 'Переглянути заявку',

  // Поля
  ticketNumber: 'Номер заявки',
  ticketTitle: 'Заголовок',
  description: 'Опис',
  category: 'Категорія',
  object: "Об'єкт",
  priority: 'Пріоритет',
  status: 'Статус',
  assignedTo: 'Відповідальний',
  createdBy: 'Створено',
  createdAt: 'Дата створення',
  resolvedAt: 'Дата вирішення',
  closedAt: 'Дата закриття',

  // Пріоритети
  priorities: {
    low: 'Низький',
    medium: 'Середній',
    high: 'Високий',
    urgent: 'Терміновий',
  },

  // Статуси
  statuses: {
    open: 'Відкрита',
    in_progress: 'В роботі',
    waiting_client: 'Очікує клієнта',
    resolved: 'Вирішена',
    closed: 'Закрита',
    cancelled: 'Скасована',
  },

  // Категорії
  categories: {
    technical_support: 'Технічна підтримка',
    technical_support_desc: 'Загальні питання з технічної підтримки',
    hardware_issues: 'Проблеми з обладнанням',
    hardware_issues_desc: 'Несправності GPS трекерів та іншого обладнання',
    configuration: 'Налаштування',
    configuration_desc: "Запити на зміну налаштувань об'єктів",
    billing_payment: 'Оплата та рахунки',
    billing_payment_desc: 'Питання щодо оплати послуг та рахунків',
    system_access: 'Доступ до системи',
    system_access_desc: 'Проблеми з входом в систему Wialon',
    other: 'Інше',
    other_desc: 'Інші питання та пропозиції',
  },

  // Коментарі
  comments: {
    title: 'Коментарі',
    add: 'Додати коментар',
    internal: 'Внутрішній коментар',
    public: 'Публічний коментар',
    noComments: 'Коментарів немає',
    addComment: 'Напишіть коментар...',
  },

  // Файли
  files: {
    title: 'Файли',
    upload: 'Прикріпити файл',
    download: 'Завантажити',
    delete: 'Видалити',
    noFiles: 'Файлів немає',
  },

  // Повідомлення
  createSuccess: 'Заявку успішно створено',
  updateSuccess: 'Заявку успішно оновлено',
  deleteSuccess: 'Заявку успішно видалено',
  deleteConfirmation: 'Ви впевнені, що хочете видалити цю заявку?',
  commentSuccess: 'Коментар додано',
  fileUploadSuccess: 'Файл завантажено',

  // Фільтри
  filters: {
    title: 'Фільтри',
    search: 'Пошук заявок',
    category: 'Категорія',
    status: 'Статус',
    priority: 'Пріоритет',
    assignedTo: 'Відповідальний',
  },

  // Вкладки
  tabs: {
    details: 'Деталі',
    comments: 'Коментарі',
    files: 'Файли',
    history: 'Історія',
  },
  createError: 'Помилка створення заявки',
  created: 'Створена',
  resolved: 'Вирішена',
  closed: 'Закрита',
  notFound: 'Заявку не знайдено',
  ticketInfo: 'Інформація про заявку',
  clientComment: 'Коментар клієнта',
  staffComment: 'Коментар співробітника',
}
