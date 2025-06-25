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
    addSuccess: 'Коментар успішно додано',
    addError: 'Помилка додавання коментаря',
    edit: 'Редагувати коментар',
    text: 'Текст коментаря',
    updateSuccess: 'Коментар успішно оновлено',
    updateError: 'Помилка оновлення коментаря',
    deleteConfirm: 'Видалити коментар',
    deleteMessage: 'Ви впевнені, що хочете видалити цей коментар?',
    deleteSuccess: 'Коментар успішно видалено',
    deleteError: 'Помилка видалення коментаря',
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
  createError: 'Помилка створення заявки',
  assignSuccess: 'Заявку успішно призначено',
  assignError: 'Помилка призначення заявки',
  updateError: 'Помилка оновлення заявки',
  notFound: 'Заявку не знайдено',

  // Фільтри
  filters: {
    title: 'Фільтри',
    search: 'Пошук заявок',
    category: 'Категорія',
    status: 'Статус',
    priority: 'Пріоритет',
    assignedTo: 'Відповідальний',
    unassigned: 'Не призначені',
    assignedToMe: 'Призначені мені',
    urgentOnly: 'Тільки термінові',
    highPriorityOnly: 'Тільки високий пріоритет',
  },

  // Вкладки
  tabs: {
    new: 'Нові',
    inProgress: 'В роботі',
    resolved: 'Вирішені',
    all: 'Всі',
    details: 'Деталі',
    history: 'Історія',
  },

  // Швидкі дії та інформація
  assignToMe: 'Призначити на себе',
  startWork: 'Почати роботу',
  markResolved: 'Позначити як вирішену',
  clientInfo: 'Інформація про клієнта',
  client: 'Клієнт',
  ticketInfo: 'Інформація про заявку',
  clientComment: 'Коментар клієнта',
  staffComment: 'Коментар співробітника',
  created: 'Створена',
  resolved: 'Вирішена',
  closed: 'Закрита',
}
