export default {
  // Загальні
  title: 'Особистий кабінет',
  dashboard: 'Головна',
  profile: 'Профіль',
  logout: 'Вийти',

  // Меню
  myObjects: "Мої об'єкти",
  myInvoices: 'Мої рахунки',
  myDocuments: 'Мої документи',
  myTickets: 'Мої заявки',
  chat: 'Чат з підтримкою',

  // Сторінки
  pages: {
    dashboard: {
      title: 'Особистий кабінет',
      welcome: 'Вітаємо у вашому особистому кабінеті!',
      objectsCount: "Кількість об'єктів",
      unpaidInvoices: 'Неоплачені рахунки',
      openTickets: 'Відкриті заявки',
      lastActivity: 'Остання активність',
    },
    objects: {
      title: "Мої об'єкти",
      noObjects: "У вас немає об'єктів",
      status: 'Статус',
      tariff: 'Тариф',
      monthly: 'на місяць',
    },
    invoices: {
      title: 'Мої рахунки',
      noInvoices: 'У вас немає рахунків',
      invoiceNumber: 'Номер рахунку',
      date: 'Дата',
      period: 'Період',
      amount: 'Сума',
      status: 'Статус',
      download: 'Завантажити',
    },
    documents: {
      title: 'Мої документи',
      noDocuments: 'У вас немає документів',
      fileName: 'Назва файлу',
      type: 'Тип',
      size: 'Розмір',
      uploadDate: 'Дата завантаження',
      download: 'Завантажити',
    },
    tickets: {
      title: 'Мої заявки',
      createNew: 'Створити заявку',
      noTickets: 'У вас немає заявок',
      ticketNumber: 'Номер заявки',
      subject: 'Тема',
      status: 'Статус',
      priority: 'Пріоритет',
      created: 'Створено',
      lastUpdate: 'Останнє оновлення',
    },
    chat: {
      title: 'Чат з підтримкою',
      typeMessage: 'Напишіть повідомлення...',
      send: 'Відправити',
      online: 'Онлайн',
      offline: 'Офлайн',
      support: 'Підтримка',
    },
    profile: {
      title: 'Мій профіль',
      personalInfo: 'Особиста інформація',
      companyInfo: 'Інформація про компанію',
      contactInfo: 'Контактна інформація',
      statisticsInfo: 'Статистика',
    },
  },

  // Статуси
  statuses: {
    active: 'Активний',
    inactive: 'Неактивний',
    suspended: 'Призупинений',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    overdue: 'Прострочено',
  },

  // Повідомлення
  messages: {
    loading: 'Завантаження...',
    noData: 'Немає даних',
    error: 'Сталася помилка',
    success: 'Успішно',
  },
}
