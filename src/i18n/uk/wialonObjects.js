export default {
  // Заголовки і дії
  title: "Об'єкти Wialon",
  add: "Додати об'єкт",
  edit: "Редагувати об'єкт",
  create: "Створити об'єкт",
  delete: "Видалити об'єкт",

  // Поля
  name: 'Назва',
  wialonId: 'Wialon ID',
  description: 'Опис',
  client: 'Клієнт',
  clientName: 'Назва клієнта',
  status: 'Статус',
  productsCount: 'Кількість продуктів',
  tariff: 'Тариф',
  tariffName: 'Назва тарифу',
  tariffPrice: 'Ціна тарифу',
  operationDate: 'Дата операції',

  // Статуси
  statuses: {
    active: 'Активний',
    suspended: 'Призупинений',
    inactive: 'Неактивний',
  },

  // Повідомлення
  createSuccess: "Об'єкт успішно створено",
  updateSuccess: "Об'єкт успішно оновлено",
  deleteSuccess: "Об'єкт успішно видалено",
  deleteConfirmation: "Ви впевнені, що хочете видалити цей об'єкт?",
  cannotDelete: "Неможливо видалити об'єкт з встановленими продуктами",

  // Фільтри
  filters: {
    title: 'Фільтри',
    search: "Пошук об'єктів",
    client: 'Фільтр за клієнтом',
    status: 'Фільтр за статусом',
  },

  // Зміна власника
  ownership: {
    title: 'Зміна власника',
    changeOwner: 'Змінити власника',
    selectClient: 'Виберіть нового власника',
    notes: 'Примітки',
    operationDate: 'Дата операції',
    changeSuccess: 'Власника успішно змінено',
    history: 'Історія власності',
    noHistory: 'Немає записів історії власності',
    period: 'Період',
    currentOwner: 'Поточний власник',
  },

  // Продукти
  products: {
    title: 'Встановлені продукти',
    count: '{count} продуктів',
    empty: 'Немає продуктів',
    noProducts: "На цьому об'єкті немає встановлених продуктів",
  },

  // Загальне
  notFound: "Об'єкт не знайдено",
  basicInfo: 'Основна інформація',
  tariffInfo: 'Інформація про тариф',

  tabs: {
    info: 'Інформація',
    products: 'Продукти',
    history: 'Історія',
    finances: 'Фінанси',
  },
  noTariff: 'Тариф не призначено',
  present: 'наразі',
}
