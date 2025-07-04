export default {
  // Загальні
  title: 'Клієнтський портал',
  dashboard: 'Головна',
  profile: 'Профіль',
  logout: 'Вийти',

  // Меню
  myObjects: "Мої об'єкти",
  myInvoices: 'Мої рахунки',
  myDocuments: 'Мої документи',
  myTickets: 'Мої заявки',
  chat: 'Чат підтримки',
  notifications: 'Сповіщення',

  // Сторінки
  pages: {
    dashboard: {
      title: 'Клієнтський портал',
      welcome: 'Ласкаво просимо до вашого клієнтського порталу!',
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
      description: 'Перегляд та завантаження ваших рахунків',
      noInvoices: 'У вас немає рахунків',
      noFilteredInvoices: 'Не знайдено рахунків за вказаними фільтрами',
      loadError: 'Помилка завантаження рахунків',
      downloadError: 'Помилка завантаження рахунку',
      downloadSuccess: 'Рахунок успішно завантажено',
      downloadPdf: 'Завантажити PDF',
      information: 'Інформація про рахунок',
      details: 'Деталі рахунку',
      invoiceNumber: 'Номер рахунку',
      invoiceDate: 'Дата рахунку',
      billingPeriod: 'Розрахунковий період',
      totalAmount: 'Загальна сума',
      paymentDate: 'Дата оплати',
      items: 'Позиції рахунку',
      noItems: 'Позиції не знайдені',
      quantity: 'Кількість',
      unit: 'од.',
      unitPrice: 'Ціна за одиницю',
      totalPrice: 'Загальна ціна',
      filters: {
        status: 'Статус',
        year: 'Рік',
        month: 'Місяць',
      },
      statuses: {
        issued: 'Виставлений',
        paid: 'Оплачений',
        cancelled: 'Скасований',
      },
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
    },
    documents: {
      title: 'Мої документи',
      description: 'Перегляд та завантаження документів',
      noDocuments: 'У вас немає документів',
      noFilteredDocuments: 'Не знайдено документів за вказаними фільтрами',
      fileName: 'Назва файлу',
      type: 'Тип',
      size: 'Розмір',
      uploadDate: 'Дата завантаження',
      download: 'Завантажити',
      search: 'Пошук документів...',
      previewNotSupported: 'Попередній перегляд не підтримується',
      documentName: 'Назва документу',
      fileSize: 'Розмір файлу',
      createdAt: 'Створено',
    },
    chat: {
      title: 'Чат підтримки',
      support: 'Підтримка',
      typeMessage: 'Напишіть повідомлення...',
      send: 'Відправити',
      online: 'Онлайн',
      offline: 'Офлайн',
      newChat: 'Новий чат',
      noChats: 'У вас немає чатів',
      noMessages: 'Немає повідомлень',
      selectRoom: 'Оберіть чат',
      selectRoomDesc: 'Оберіть чат зі списку або створіть новий',
      startConversation: 'Почати розмову',
      startChat: 'Почати чат',
      assignedTo: 'Призначено',
      waitingForAssignment: 'Очікування призначення співробітника',
      attachFile: 'Прикріпити файл',
      selectedFiles: 'Обрані файли',
      typing: 'друкує...',
      chatCreated: 'Чат створено',
      loadError: 'Помилка завантаження чатів',
      sendError: 'Помилка відправки повідомлення',
      createError: 'Помилка створення чату',
      supportChat: 'Чат підтримки',
      convertToTicket: 'Перетворити на заявку',
      downloadFile: 'Завантажити файл',
      fileTooBig: 'Файл занадто великий',
      invalidFileType: 'Невірний тип файлу',
      maxFilesExceeded: 'Перевищено максимальну кількість файлів',
      welcome: 'Ласкаво просимо до чату підтримки',
      welcomeDesc: 'Почніть розмову з нашою командою підтримки. Ми тут, щоб допомогти!',
      commonQuestions: 'Часті питання',
      generalHelp: 'Загальна допомога',
      generalHelpMessage: 'Привіт! Мені потрібна загальна допомога з вашими послугами.',
      technicalIssue: 'Технічна проблема',
      technicalIssueMessage: 'Привіт! У мене технічна проблема і мені потрібна допомога.',
      billing: 'Питання щодо оплати',
      billingMessage: 'Привіт! У мене є питання щодо рахунків або платежів.',
      loading: 'Завантаження...',
      alreadyHasChat: 'У вас вже є активний чат',
      chatDeleted: 'Чат було видалено співробітником',
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
    paid: 'Оплачений',
    unpaid: 'Неоплачений',
    issued: 'Виставлений',
    partial: 'Частково оплачений',
    overdue: 'Прострочений',
  },

  // Повідомлення
  messages: {
    loading: 'Завантаження...',
    noData: 'Немає даних',
    error: 'Сталася помилка',
    success: 'Успішно',
  },
}
