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
  email: 'Email',
  address: 'Адреса',
  description: 'Опис',
  wialonId: 'Wialon ID',
  wialonUsername: 'Логін Wialon',
  isActive: 'Активний',
  objectsCount: "Кількість об'єктів",
  documentsCount: 'Кількість документів',

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
    paidUntil: 'Проплачено до',
    daysLeft: 'Залишилось днів',
    status: {
      active: 'Активний',
      expiringSoon: 'Закінчується',
      expired: 'Заборгованість',
    },
    notConfigured: 'Інтеграція з Wialon не налаштована',
    noWialonId: 'Wialon ID не вказано',
    error: 'Помилка отримання інформації',
    loading: 'Завантаження...',
  },
}
