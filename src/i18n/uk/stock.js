export default {
  // Заголовки і дії
  title: 'Склад',
  movements: 'Рух товарів',
  transfer: 'Переміщення товару',
  adjust: 'Коригування кількості',

  // Поля
  warehouse: 'Склад',
  product: 'Продукт',
  quantity: 'Кількість',
  fromWarehouse: 'Зі складу',
  toWarehouse: 'На склад',
  type: 'Тип операції',
  comment: 'Коментар',
  createdBy: 'Створив',
  createdAt: 'Дата створення',

  // Типи операцій
  types: {
    transfer: 'Переміщення',
    install: 'Встановлення',
    uninstall: 'Демонтаж',
    repair_send: 'Відправка в ремонт',
    repair_return: 'Повернення з ремонту',
    write_off: 'Списання',
    warranty_change: 'Зміна гарантії',
    stock_in: 'Прихід',
    stock_out: 'Видача',
    receipt: 'Надходження',
    shipment: 'Відвантаження',
    return: 'Повернення',
    adjustment: 'Коригування',
  },

  // Повідомлення
  transferSuccess: 'Товар успішно переміщено',
  adjustSuccess: 'Кількість успішно скориговано',
  insufficientStock: 'Недостатньо товару на складі',

  // Фільтри
  filters: {
    title: 'Фільтри',
    warehouse: 'Фільтр за складом',
    dateFrom: 'Дата з',
    dateTo: 'Дата по',
    type: 'Фільтр за типом операції',
    product: 'Фільтр за продуктом',
  },
}
