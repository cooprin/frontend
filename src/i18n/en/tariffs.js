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
