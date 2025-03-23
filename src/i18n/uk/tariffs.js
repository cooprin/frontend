export default {
  // Заголовки і дії
  title: 'Тарифи',
  add: 'Додати тариф',
  edit: 'Редагувати тариф',
  create: 'Створити тариф',
  delete: 'Видалити тариф',

  // Поля
  name: 'Назва',
  description: 'Опис',
  price: 'Ціна',
  isActive: 'Активний',
  objectsCount: "Кількість об'єктів",
  priceEditDisabled: 'Ціну не можна змінювати для існуючих тарифів',
  effectiveFrom: 'Дата початку дії',
  period: 'Період',
  history: 'Історія тарифів',
  noHistory: 'Немає історії тарифів',

  // Повідомлення
  createSuccess: 'Тариф успішно створено',
  updateSuccess: 'Тариф успішно оновлено',
  deleteSuccess: 'Тариф успішно видалено',
  deleteConfirmation: 'Ви впевнені, що хочете видалити цей тариф?',
  cannotDelete: "Неможливо видалити тариф з існуючими призначеннями об'єктам",

  // Фільтри
  filters: {
    title: 'Фільтри',
    search: 'Пошук тарифів',
    status: 'Фільтр за статусом',
  },

  // Призначення тарифів
  assignment: {
    title: 'Призначити тариф',
    assignTo: "Призначити об'єкту",
    selectObject: "Виберіть об'єкт",
    effectiveFrom: 'Дата початку дії',
    notes: 'Примітки',
    assignSuccess: 'Тариф успішно призначено',
    alreadyAssigned: "Цей тариф вже призначено об'єкту",
    paidPeriodsWarning: 'Увага! Існують оплачені періоди з іншим тарифом',
    recommendedDate: 'Рекомендована дата',
    useRecommended: 'Використати рекомендовану',
    dateInPaidPeriod: 'Дата знаходиться в оплаченому періоді. Рекомендовано використати {date}',
    dateInPaidPeriodHint: 'Увага! Цей період вже має призначений та оплачений тариф',
    nextMonth: 'наступний місяць',
  },

  // Об'єкти з тарифом
  objects: {
    title: "Об'єкти",
    count: "{count} об'єктів",
    empty: "Немає об'єктів",
    noObjects: "Цей тариф не призначено жодному об'єкту",
    clientName: 'Клієнт',
    effectiveFrom: 'Дата початку дії',
    effectiveTo: 'Дата закінчення дії',
  },

  // Загальне
  notFound: 'Тариф не знайдено',
  basicInfo: 'Основна інформація',
  statistics: 'Статистика',

  tabs: {
    info: 'Інформація',
    objects: "Об'єкти",
    history: 'Історія призначень',
  },
}
