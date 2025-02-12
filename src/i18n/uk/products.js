export default {
  // Заголовки і дії
  title: 'Продукти',
  add: 'Додати продукт',
  edit: 'Редагувати продукт',
  create: 'Створити продукт',
  delete: 'Видалити продукт',
  view: 'Переглянути продукт',

  // Поля продукту
  sku: 'Артикул',
  model: 'Модель',
  manufacturer: 'Виробник',
  supplier: 'Постачальник',
  status: 'Статус',
  warrantyEnd: 'Кінець гарантії',
  purchaseDate: 'Дата покупки',
  supplierWarrantyEnd: 'Кінець гарантії постачальника',
  isOwn: 'Власний продукт',
  ownership: 'Власність',
  own: 'Власний',
  notOwn: 'Не власний',
  quantity: 'Кількість',
  currentObject: "Поточний об'єкт",
  price: 'Ціна',
  description: 'Опис',

  // Статуси
  statuses: {
    in_stock: 'В наявності',
    installed: 'Встановлено',
    in_repair: 'В ремонті',
    written_off: 'Списано',
  },

  // Повідомлення успіху/помилок
  createSuccess: 'Продукт успішно створено',
  updateSuccess: 'Продукт успішно оновлено',
  deleteSuccess: 'Продукт успішно видалено',
  statusUpdateSuccess: 'Статус продукту успішно оновлено',
  deleteConfirmation: 'Ви впевнені, що хочете видалити цей продукт?',
  cannotDelete: 'Неможливо видалити продукт з існуючими залишками або історією переміщень',

  // Фільтри
  filters: {
    title: 'Фільтри',
    manufacturer: 'Фільтр за виробником',
    status: 'Фільтр за статусом',
    ownership: 'Фільтр за власністю',
    dateFrom: 'Дата покупки з',
    dateTo: 'Дата покупки по',
    warranty: 'Статус гарантії',
  },
}
