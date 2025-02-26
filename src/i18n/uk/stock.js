export default {
  // Заголовки і дії
  title: 'Склад',
  movements: 'Переміщення товарів',
  transfer: 'Перемістити товар',
  adjust: 'Коригувати запас',
  install: 'Встановити',
  uninstall: 'Демонтувати',
  sendToRepair: 'Відправити в ремонт',
  returnFromRepair: 'Повернути з ремонту',
  writeOff: 'Списати',

  // Поля
  warehouse: 'Склад',
  product: 'Продукт',
  quantity: 'Кількість',
  fromWarehouse: 'З складу',
  toWarehouse: 'На склад',
  type: 'Тип операції',
  comment: 'Коментар',
  createdBy: 'Створено',
  createdAt: 'Дата створення',
  object: "Об'єкт",

  // Типи операцій
  types: {
    transfer: 'Переміщення',
    install: 'Встановлення',
    uninstall: 'Демонтаж',
    repair_send: 'Відправка в ремонт',
    repair_return: 'Повернення з ремонту',
    write_off: 'Списання',
    warranty_change: 'Зміна гарантії',
    stock_in: 'Надходження',
    stock_out: 'Видача',
    receipt: 'Надходження',
    shipment: 'Відвантаження',
    return: 'Повернення',
    adjustment: 'Коригування',
  },

  // Повідомлення
  transferSuccess: 'Товар успішно переміщено',
  adjustSuccess: 'Запас успішно скориговано',
  insufficientStock: 'Недостатньо товару на складі-джерелі',
  installSuccess: 'Продукт успішно встановлено',
  uninstallSuccess: 'Продукт успішно демонтовано',
  sendToRepairSuccess: 'Продукт успішно відправлено в ремонт',
  returnFromRepairSuccess: 'Продукт успішно повернуто з ремонту',
  writeOffSuccess: 'Продукт успішно списано',

  // Фільтри
  filters: {
    title: 'Фільтри',
    warehouse: 'Фільтр за складом',
    dateFrom: 'Дата з',
    dateTo: 'Дата по',
    type: 'Фільтр за типом операції',
    product: 'Фільтр за продуктом',
    fromWarehouse: 'З складу',
    toWarehouse: 'На склад',
  },
}
