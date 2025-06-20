export default {
  // Заголовки і дії
  title: 'Клієнти',
  add: 'Додати клієнта',
  edit: 'Редагувати клієнта',
  create: 'Створити клієнта',
  delete: 'Видалити клієнта',

  // Поля
  name: 'Назва',
  fullName: 'Повна назва компанії',
  contactPerson: 'Контактна особа',
  phone: 'Телефон',
  countryCode: 'Код країни',
  email: 'Email',
  address: 'Адреса',
  description: 'Опис',
  wialonId: 'Wialon User ID',
  wialonResourceId: 'Wialon Resource ID',
  wialonUsername: 'Логін Wialon',
  isActive: 'Активний',
  objectsCount: "Кількість об'єктів",
  documentsCount: 'Кількість документів',
  status: 'Статус',

  // Підказки для полів Wialon
  wialonResourceIdHint: 'ID ресурсу для біллінгу в Wialon',
  wialonUserIdHint: 'User ID для авторизації в Wialon',
  wialonUsernameHint: "Ім'я користувача в Wialon",

  // Описи полів Wialon (для інформаційного банера)
  wialonFields: {
    resourceIdDescription: 'для роботи з біллінгом',
    userIdDescription: 'для авторизації користувача',
    usernameDescription: 'логін користувача',
  },

  // Повідомлення валідації
  validation: {
    wialonIdNumeric: 'Wialon User ID повинен містити лише цифри',
    wialonResourceIdNumeric: 'Wialon Resource ID повинен містити лише цифри',
  },

  // Повідомлення
  createSuccess: 'Клієнт успішно створений',
  updateSuccess: 'Клієнт успішно оновлений',
  deleteSuccess: 'Клієнт успішно видалений',
  deleteConfirmation: 'Ви впевнені, що хочете видалити цього клієнта?',
  cannotDelete: "Неможливо видалити клієнта з існуючими об'єктами",

  // Повідомлення
  notFound: 'Клієнта не знайдено',
  noObjects: "Для цього клієнта не знайдено об'єктів",

  // Заголовки
  basicInfo: 'Основна інформація',
  statistics: 'Статистика',

  // Вкладки та дані послуг і рахунків
  services: {
    noServices: 'Послуги не призначені цьому клієнту',
  },

  // Фільтри
  filters: {
    title: 'Фільтри',
    search: 'Пошук клієнтів',
    status: 'Фільтр за статусом',
  },

  // Документи
  documents: {
    title: 'Документи',
    count: '{count} документів',
    empty: 'Немає документів',
    add: 'Додати документ',
    noDocuments: 'Документи не завантажені',
    upload: 'Завантажити документ',
    selectFile: 'Вибрати файл',
    description: 'Опис',
    deleteConfirmation: 'Ви впевнені, що хочете видалити цей документ?',
    uploadSuccess: 'Документ успішно завантажено',
    deleteSuccess: 'Документ успішно видалено',
  },

  // Вкладки
  tabs: {
    info: 'Інформація',
    objects: "Об'єкти",
    documents: 'Документи',
    services: 'Послуги',
    invoices: 'Рахунки',
  },

  // Платіжна інформація Wialon
  payment: {
    title: 'Платіжна інформація',
    daysLeft: 'Залишилось днів',
    paidUntil: 'Оплачено до',
    status: {
      active: 'Активний',
      expiring_soon: 'Закінчується',
      expired: 'Прострочено',
      blocked: 'Заблокований',
      unknown: 'Невідомо',
    },
    reason: {
      paid: 'Акаунт оплачений',
      unlimited: 'Необмежений доступ',
      expiring: 'Доступ закінчується',
      days_expired: 'Період оплати закінчився',
      account_blocked: 'Акаунт заблокований',
      parent_account_blocked: 'Батьківський акаунт заблокований',
    },
    notConfigured: 'Інтеграція з Wialon не налаштована',
    noWialonResourceId: 'Wialon Resource ID не вказано',
    error: 'Помилка отримання інформації',
    loading: 'Завантаження...',
    plan: 'Тарифний план',
    parentAccount: 'Батьківський акаунт',
  },
}
