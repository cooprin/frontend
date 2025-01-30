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
    firstName: "Ім'я",
    lastName: 'Прізвище',
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
  },
  profile: {
    title: 'Профіль',
    uploadAvatar: 'Завантажити аватар',
    newPassword: 'Новий пароль',
    confirmPassword: 'Підтвердіть пароль',
    saveChanges: 'Зберегти зміни',
    selectAvatar: 'Обрати аватар',
    firstName: "Ім'я",
    lastName: 'Прізвище',
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
    changes: 'Зміни',
    viewChanges: 'Переглянути зміни',
    oldValues: 'Старі значення',
    newValues: 'Нові значення',
    fetchError: 'Помилка завантаження журналу',
    noChanges: 'Змін не зафіксовано',
    clearFilters: 'Очистити фільтри',
    actionInfo: 'Інформація про дію',
    actions: {
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
  },
}
