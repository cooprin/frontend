export default {
  DashboardPage: {
    hello: 'Вітаємо',
    description: 'Вітаємо в системі',
  },
  users: {
    title: 'Користувачі',
    addUser: 'Додати користувача',
    editUser: 'Редагувати користувача',
    email: 'Email',
    first_name: "Ім'я",
    last_name: 'Прізвище',
    password: 'Пароль',
    phone: 'Телефон',
    role: 'Роль',
    status: 'Статус',
    lastLogin: 'Останній вхід',
    actions: 'Дії',
    search: 'Пошук користувачів...',
    required: "Це поле обов'язкове",
    invalidEmail: 'Невірний формат email',
    confirmDelete: 'Видалити користувача',
    deleteMessage: 'Ви впевнені, що хочете видалити користувача {name}?',
    saveSuccess: 'Користувач збережений успішно',
    saveError: 'Помилка при збереженні користувача',
    deleteSuccess: 'Користувач видалений успішно',
    deleteError: 'Помилка при видаленні користувача',
    fetchError: 'Помилка при завантаженні користувачів',
    statusUpdateSuccess: 'Статус користувача оновлено успішно',
    statusUpdateError: 'Помилка при оновленні статусу користувача',
    changePassword: 'Змінити пароль',
    newPassword: 'Новий пароль',
    confirmPassword: 'Підтвердіть пароль',
    passwordLength: 'Пароль повинен містити мінімум 8 символів',
    passwordMatch: 'Паролі не співпадають',
    passwordSuccess: 'Пароль змінено успішно',
    passwordError: 'Помилка при зміні пароля',
    isActive: 'Активний',
    activate: 'Активувати',
    deactivate: 'Деактивувати',
    confirmDeleteWithAudit: 'Видалити користувача з записами аудиту',
    deleteWithAuditMessage:
      "Користувач {name} має {count} записів в журналі аудиту. Видалення цього користувача також видалить всі пов'язані записи аудиту. Ви впевнені, що хочете продовжити?",
    confirmDeleteWithRecords: 'Видалити з записами аудиту',
    deleteWithAuditSuccess: 'Користувача та записи аудиту успішно видалено',
    countryCode: 'Код країни',
  },
  profile: {
    title: 'Профіль',
    uploadAvatar: 'Завантажити аватар',
    newPassword: 'Новий пароль',
    confirmPassword: 'Підтвердіть пароль',
    saveChanges: 'Зберегти зміни',
    selectAvatar: 'Обрати аватар',
    first_name: "Ім'я",
    last_name: 'Прізвище',
    changePassword: 'Змінити пароль',
    currentPassword: 'Поточний пароль',
    avatarError: 'Виникла помилка при оновленні аватара.',
    avatarSuccess: 'Аватар успішно оновлено!',
    profileError: 'Виникла помилка при оновленні профілю.',
    profileSuccess: 'Профіль успішно оновлено!',
    passwordError: 'Виникла помилка при оновленні пароля.',
    passwordSuccess: 'Пароль успішно оновлено!',
    role: 'Роль',
    phone: 'Телефон',
    required: "Це поле обов'язкове",
    passwordLength: 'Пароль повинен містити мінімум 8 символів',
    password: 'Пароль',
    countryCode: 'Код країни',
  },
  roles: {
    title: 'Ролі користувачів',
    addRole: 'Додати роль',
    editRole: 'Редагувати роль',
    name: 'Назва',
    description: 'Опис',
    createdAt: 'Створено',
    updatedAt: 'Оновлено',
    actions: 'Дії',
    search: 'Пошук ролей...',
    required: "Це поле обов'язкове",
    confirmDelete: 'Видалити роль',
    deleteMessage: 'Ви впевнені, що хочете видалити роль {name}?',
    saveSuccess: 'Роль збережена успішно',
    saveError: 'Помилка при збереженні ролі',
    deleteSuccess: 'Роль видалена успішно',
    deleteError: 'Помилка при видаленні ролі',
    fetchError: 'Помилка при завантаженні ролей',
    roleInUse: 'Неможливо видалити роль, яка використовується користувачами',
  },
  auditLogs: {
    title: 'Журнал операцій',
    search: 'Пошук',
    actionType: 'Тип дії',
    entityType: "Тип об'єкту",
    dateFrom: 'Дата від',
    dateTo: 'Дата до',
    date: 'Дата',
    user: 'Користувач',
    action: 'Дія',
    viewChanges: 'Переглянути зміни',
    oldValues: 'Старі значення',
    newValues: 'Нові значення',
    fetchError: 'Помилка завантаження журналу',
    noChanges: 'Змін не зафіксовано',
    clearFilters: 'Очистити фільтри',
    actionInfo: 'Інформація про дію',
    auditType: 'Тип аудиту',
    auditTypes: {
      all: 'Всі типи',
      system: 'Системний',
      business: 'Бізнес',
    },
    actions: {
      create: 'Створення',
      update: 'Оновлення',
      delete: 'Видалення',
      view: 'Перегляд',
      export: 'Експорт',
      import: 'Імпорт',
      audit_export: 'Експорт аудиту',
      audit_export_success: 'Успішний експорт аудиту',
      audit_export_error: 'Помилка експорту аудиту',
      // Системні дії
      list_view: 'Перегляд списку',
      error: 'Помилка',
      roles_list_view: 'Перегляд списку ролей',

      // Авторизація
      login: 'Вхід в систему',
      login_success: 'Успішний вхід',
      login_failed: 'Невдалий вхід',
      logout: 'Вихід із системи',

      // Користувачі
      user_create: 'Створення користувача',
      user_update: 'Оновлення користувача',
      user_delete: 'Видалення користувача',
      user_register: 'Реєстрація користувача',
      admin_password_change: 'Зміна пароля адміністратором',

      // Профіль
      profile_update: 'Оновлення профілю',
      avatar_update: 'Зміна аватара',
      password_change: 'Зміна пароля',
      password_change_failed: 'Невдала зміна пароля',
      status_change: 'Зміна статусу',

      // Ролі
      role_create: 'Створення ролі',
      role_update: 'Оновлення ролі',
      role_delete: 'Видалення ролі',
      role_delete_attempt: 'Спроба видалення ролі',

      // Перегляди
      view_roles: 'Перегляд ролей',
      view_users: 'Перегляд користувачів',
      view_profile: 'Перегляд профілю',
    },
    entities: {
      user: 'Користувач',
      role: 'Роль',
      profile: 'Профіль',
      system: 'Система',
      auth: 'Авторизація',
    },
    schema: 'Схема',
    table: 'Таблиця',
    ipAddress: 'IP Адреса',
    browserInfo: 'Інформація про браузер',
    changes: {
      title: 'Зміни',
      onlyChanged: 'Змінені поля',
      fullComparison: 'Повне порівняння',
      rawData: 'Вихідні дані',
      filter: 'Фільтр змін',
      all: 'Всі записи',
      withChanges: 'Зі змінами',
      withoutChanges: 'Без змін',
      noChanges: 'Змін не зафіксовано',
    },
    export: 'Експорт в Excel',
    exportSuccess: 'Дані успішно експортовано',
    exportError: 'Помилка при експорті даних',
    viewBrowserInfo: 'Інформація про браузер',
  },
  permissions: {
    title: 'Права доступу',
    search: 'Пошук',
    addPermission: 'Додати право',
    editPermission: 'Редагувати право',
    name: 'Назва',
    code: 'Код',
    group: 'Група',
    isSystem: 'Системне',
    actions: 'Дії',
    required: "Поле обов'язкове",
    invalidCode: 'Невірний формат коду (приклад: users.read)',
    codeHint: 'Формат: ресурс.дія (напр., users.read)',
    saveSuccess: 'Право успішно збережено',
    saveError: 'Помилка при збереженні права',
    deleteSuccess: 'Право успішно видалено',
    deleteError: 'Помилка при видаленні права',
    confirmDelete: 'Видалення права',
    deleteMessage: 'Ви впевнені, що хочете видалити право "{name}"?',
    cannotDeleteSystem: 'Не можна видалити системне право',
    fetchError: 'Помилка завантаження прав',
    groupsError: 'Помилка завантаження груп прав',
    manageGroups: 'Управління групами',
    groups: 'Групи прав',
    addGroup: 'Додати групу',
    editGroup: 'Редагувати групу',
    groupName: 'Назва групи',
    groupDescription: 'Опис',
    groupSaveSuccess: 'Групу успішно збережено',
    groupSaveError: 'Помилка при збереженні групи',
    confirmDeleteGroup: 'Видалення групи',
    deleteGroupMessage: 'Ви впевнені, що хочете видалити групу "{name}"?',
    groupDeleteSuccess: 'Групу успішно видалено',
    groupDeleteError: 'Помилка при видаленні групи',
  },
  resources: {
    title: 'Ресурси системи',
    search: 'Пошук',
    addResource: 'Додати ресурс',
    editResource: 'Редагувати ресурс',
    name: 'Назва',
    code: 'Код',
    type: 'Тип',
    metadata: 'Метадані',
    actions: 'Дії',
    required: "Поле обов'язкове",
    invalidCode: 'Невірний формат коду (тільки малі літери та підкреслення)',
    invalidJson: 'Невірний формат JSON',
    codeHint: 'Використовуйте малі літери та підкреслення',
    manageActions: 'Управління діями',
    saveSuccess: 'Ресурс успішно збережено',
    saveError: 'Помилка при збереженні ресурсу',
    deleteSuccess: 'Ресурс успішно видалено',
    deleteError: 'Помилка при видаленні ресурсу',
    confirmDelete: 'Видалення ресурсу',
    deleteMessage: 'Ви впевнені, що хочете видалити ресурс "{name}"?',
    fetchError: 'Помилка завантаження ресурсів',
    actionsError: 'Помилка завантаження дій ресурсу',
    actionsSaveSuccess: 'Дії ресурсу успішно збережені',
    actionsSaveError: 'Помилка при збереженні дій ресурсу',
    typeTable: 'Таблиця',
    typeModule: 'Модуль',
    typeFunction: 'Функція',
  },
  error: {
    notFound: 'Сторінку не знайдено',
    returnHome: 'Повернутися на головну',
  },
}
