export default {
  // Заголовки і дії
  title: 'Tariffs',
  add: 'Add Tariff',
  edit: 'Edit Tariff',
  create: 'Create Tariff',
  delete: 'Delete Tariff',

  // Поля
  name: 'Name',
  description: 'Description',
  price: 'Price',
  isActive: 'Active',
  objectsCount: 'Objects Count',
  priceEditDisabled: 'Price cannot be changed for existing tariffs',
  effectiveFrom: 'Effective From',
  period: 'Period',
  history: 'Tariff History',
  noHistory: 'No tariff history',

  // Повідомлення
  createSuccess: 'Tariff created successfully',
  updateSuccess: 'Tariff updated successfully',
  deleteSuccess: 'Tariff deleted successfully',
  deleteConfirmation: 'Are you sure you want to delete this tariff?',
  cannotDelete: 'Cannot delete tariff with existing object assignments',

  // Фільтри
  filters: {
    title: 'Filters',
    search: 'Search tariffs',
    status: 'Filter by status',
  },

  // Призначення тарифів
  assignment: {
    title: 'Assign Tariff',
    assignTo: 'Assign to Object',
    selectObject: 'Select Object',
    effectiveFrom: 'Effective From',
    notes: 'Notes',
    assignSuccess: 'Tariff assigned successfully',
    alreadyAssigned: 'This tariff is already assigned to the object',
    paidPeriodsWarning: 'Warning! There are paid periods with another tariff',
    recommendedDate: 'Recommended date',
    useRecommended: 'Use recommended',
    dateInPaidPeriod: 'Date is in a paid period. Recommended to use {date}',
    dateInPaidPeriodHint: 'Warning! This period already has an assigned and paid tariff',
    nextMonth: 'next month',
  },

  // Об'єкти з тарифом
  objects: {
    title: 'Objects',
    count: '{count} Objects',
    empty: 'No objects',
    noObjects: 'This tariff is not assigned to any objects',
    clientName: 'Client',
    effectiveFrom: 'Effective From',
    effectiveTo: 'Effective To',
  },

  // Загальне
  notFound: 'Tariff not found',
  basicInfo: 'Basic Information',
  statistics: 'Statistics',

  tabs: {
    info: 'Information',
    objects: 'Objects',
    history: 'Assignment History',
  },
}
