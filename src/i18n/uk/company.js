export default {
  title: 'Налаштування компанії',
  tabs: {
    details: 'Дані компанії',
    bankAccounts: 'Банківські рахунки',
    documents: 'Юридичні документи',
    wialonIntegration: 'Інтеграція з Wialon',
    settings: 'Системні налаштування',
  },
  details: {
    title: 'Інформація про компанію',
    legalName: 'Юридична назва',
    shortName: 'Коротка назва',
    legalForm: 'Організаційно-правова форма',
    edrpou: 'Код ЄДРПОУ',
    taxNumber: 'ІПН',
    legalAddress: 'Юридична адреса',
    actualAddress: 'Фактична адреса',
    phone: 'Телефон',
    email: 'Email',
    website: 'Веб-сайт',
    director: 'Директор',
    directorPosition: 'Посада директора',
    accountant: 'Головний бухгалтер',
    logo: 'Логотип компанії',
    uploadLogo: 'Завантажити логотип',
    removeLogo: 'Видалити логотип',
    saveSuccess: 'Дані компанії успішно збережені',
    logoUploadSuccess: 'Логотип успішно завантажено',
  },
  bankAccounts: {
    title: 'Банківські рахунки',
    add: 'Додати рахунок',
    edit: 'Редагувати рахунок',
    bankName: 'Назва банку',
    accountNumber: 'Номер рахунку',
    iban: 'IBAN',
    mfo: 'МФО',
    swiftCode: 'SWIFT код',
    currency: 'Валюта',
    isDefault: 'Основний рахунок',
    description: 'Опис',
    noAccounts: 'Банківські рахунки не знайдені',
    confirmDelete: 'Ви впевнені, що хочете видалити цей банківський рахунок?',
    saveSuccess: 'Банківський рахунок успішно збережено',
    deleteSuccess: 'Банківський рахунок успішно видалено',
  },
  documents: {
    title: 'Юридичні документи',
    upload: 'Завантажити документ',
    documentName: 'Назва документа',
    documentType: 'Тип документа',
    effectiveDate: 'Дата набуття чинності',
    expiryDate: 'Дата закінчення',
    description: 'Опис',
    uploadedBy: 'Завантажив',
    uploadedAt: 'Дата завантаження',
    fileSize: 'Розмір файлу',
    download: 'Завантажити',
    noDocuments: 'Юридичні документи не знайдені',
    confirmDelete: 'Ви впевнені, що хочете видалити цей документ?',
    uploadSuccess: 'Документ успішно завантажено',
    deleteSuccess: 'Документ успішно видалено',
  },
  wialonIntegration: {
    title: 'Налаштування інтеграції з Wialon',
    apiUrl: 'URL API',
    tokenName: 'Назва токена',
    tokenValue: 'Значення токена',
    isActive: 'Активна',
    lastSyncTime: 'Остання синхронізація',
    syncInterval: 'Інтервал синхронізації (хвилин)',
    testConnection: "Перевірити з'єднання",
    connectionSuccess: "З'єднання успішне!",
    connectionError: "Помилка з'єднання",
    saveSuccess: 'Налаштування інтеграції з Wialon успішно збережені',
    syncObjects: "Синхронізувати об'єкти",
    syncSuccess: "Об'єкти успішно синхронізовано",
    syncFailed: 'Помилка синхронізації',
  },
  settings: {
    title: 'Системні налаштування',
    category: 'Категорія',
    key: 'Ключ',
    value: 'Значення',
    valueType: 'Тип значення',
    description: 'Опис',
    isPublic: 'Публічний',
    add: 'Додати налаштування',
    edit: 'Редагувати налаштування',
    noSettings: 'Системні налаштування не знайдені',
    confirmDelete: 'Ви впевнені, що хочете видалити це налаштування?',
    saveSuccess: 'Налаштування успішно збережено',
    deleteSuccess: 'Налаштування успішно видалено',
    categories: {
      system: 'Система',
      email: 'Email',
      invoice: 'Рахунки',
      general: 'Загальні',
    },
    valueTypes: {
      string: 'Текст',
      number: 'Число',
      boolean: 'Так/Ні',
      json: 'JSON',
      date: 'Дата',
    },
  },
}
