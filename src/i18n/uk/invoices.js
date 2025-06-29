export default {
  // Заголовки і дії
  title: 'Рахунки',
  add: 'Додати рахунок',
  create: 'Створити рахунок',

  // Поля
  invoiceNumber: 'Номер рахунку',
  invoiceDate: 'Дата рахунку',
  billingMonth: 'Місяць',
  billingYear: 'Рік',
  billingPeriod: 'Розрахунковий період',
  client: 'Клієнт',
  totalAmount: 'Загальна сума',
  status: 'Статус',
  notes: 'Примітки',
  createdBy: 'Створено',
  paymentDate: 'Дата оплати',

  // Статуси рахунків
  statuses: {
    issued: 'Виставлений',
    paid: 'Оплачений',
    cancelled: 'Скасований',
  },

  // Позиції рахунку
  items: {
    title: 'Позиції рахунку',
    service: 'Послуга',
    description: 'Опис',
    quantity: 'Кількість',
    unitPrice: 'Ціна за одиницю',
    totalPrice: 'Загальна ціна',
    add: 'Додати позицію',
    remove: 'Видалити',
  },

  // Повідомлення
  createSuccess: 'Рахунок успішно створено',
  statusUpdateSuccess: 'Статус рахунку успішно оновлено',
  noInvoices: 'Рахунки не знайдено',
  noItems: 'В цьому рахунку немає позицій',
  somePeriodsAlreadyPaid: 'Деякі періоди вже оплачені',
  paid: 'Оплачено',
  invoiceExists: 'Рахунок існує: {number}',
  allPeriodsAlreadyPaid: 'Всі періоди вже оплачені',
  pendingObjects: "Об'єкти для оплати",
  allPeriodsHaveInvoices: 'Всі періоди вже мають виставлені рахунки',
  noValidPayments: 'Немає валідних платежів',

  // Фільтри
  filters: {
    title: 'Фільтри',
    search: 'Пошук рахунків',
    status: 'Фільтр за статусом',
    year: 'Фільтр за роком',
    month: 'Фільтр за місяцем',
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

  // Загальне
  notFound: 'Рахунок не знайдено',
  basicInfo: 'Основна інформація',
  statistics: 'Статистика',

  tabs: {
    info: 'Інформація',
    items: 'Позиції',
    documents: 'Документи',
  },

  // Місяці
  months: {
    1: 'Січень',
    2: 'Лютий',
    3: 'Березень',
    4: 'Квітень',
    5: 'Травень',
    6: 'Червень',
    7: 'Липень',
    8: 'Серпень',
    9: 'Вересень',
    10: 'Жовтень',
    11: 'Листопад',
    12: 'Грудень',
  },
  markAsPaid: 'Позначити як оплачений',
  markAsCancelled: 'Позначити як скасований',
  generateTitle: 'Створення рахунків',
  generate: 'Згенерувати рахунки',
  generateInvoices: 'Згенерувати рахунки',
  generationInfo:
    "Буде створено рахунки для всіх клієнтів з активними послугами на основі об'єктів за вибраний період.",
  generatedSuccess: 'Успішно створено {count} рахунків',
  month: 'Місяць',
  year: 'Рік',
  optional: "необов'язково",
  smartGenerate: 'Швидка генерація',
  paymentAmount: 'Сума оплати',
  paymentType: 'Тип оплати',
  paymentTypes: {
    regular: 'Звичайний',
    advance: 'Аванс',
    debt: 'Борг',
    adjustment: 'Коригування',
  },
  paymentSuccess: 'Платіж успішно збережено',
  cancelSuccess: 'Рахунок скасовано',
  cancellationReason: 'Причина скасування',
  generatePdf: 'Згенерувати PDF',
  smartGenerationSuccess: 'Рахунки успішно згенеровані',
  edit: 'Редагувати',
  print: 'Друк',
  editTitle: 'Редагування рахунку',
  updateSuccess: 'Рахунок успішно оновлено',
  editLimitations:
    'Можна редагувати тільки основну інформацію рахунку. Позиції змінювати не можна.',
}
