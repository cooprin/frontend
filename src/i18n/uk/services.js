export default {
  // Заголовки і дії
  title: 'Послуги',
  add: 'Додати послугу',
  edit: 'Редагувати послугу',
  create: 'Створити послугу',
  delete: 'Видалити послугу',

  // Поля
  name: 'Назва',
  description: 'Опис',
  serviceType: 'Тип послуги',
  fixedPrice: 'Фіксована ціна',
  isActive: 'Активна',
  clientsCount: 'Кількість клієнтів',

  // Типи послуг
  types: {
    fixed: 'Фіксована ціна',
    object_based: "Ціна за об'єкт",
  },

  // Повідомлення
  createSuccess: 'Послуга успішно створена',
  updateSuccess: 'Послуга успішно оновлена',
  deleteSuccess: 'Послуга успішно видалена',
  deleteConfirmation: 'Ви впевнені, що хочете видалити цю послугу?',
  cannotDelete: 'Неможливо видалити послугу з існуючими призначеннями клієнтам',

  // Фільтри
  filters: {
    title: 'Фільтри',
    search: 'Пошук послуг',
    type: 'Фільтр за типом',
    status: 'Фільтр за статусом',
  },

  // Призначення послуг
  assignment: {
    title: 'Призначити послугу',
    assignTo: 'Призначити клієнту',
    selectClient: 'Виберіть клієнта',
    startDate: 'Дата початку',
    notes: 'Примітки',
    assignSuccess: 'Послуга успішно призначена',
    alreadyAssigned: 'Ця послуга вже призначена клієнту',
  },

  // Клієнти послуги
  clients: {
    title: 'Клієнти',
    count: '{count} клієнтів',
    empty: 'Немає клієнтів',
    noClients: 'Ця послуга не призначена жодному клієнту',
    startDate: 'Дата початку',
    endDate: 'Дата закінчення',
    status: 'Статус',
    terminate: 'Припинити надання',
    terminateSuccess: 'Надання послуги успішно припинено',
    terminationDate: 'Дата припинення',
  },

  // Статуси призначення послуг
  statuses: {
    active: 'Активна',
    terminated: 'Припинена',
  },
  notFound: 'Послугу не знайдено',
  basicInfo: 'Основна інформація',
  statistics: 'Статистика',

  tabs: {
    info: 'Інформація',
    clients: 'Клієнти',
  },
}
