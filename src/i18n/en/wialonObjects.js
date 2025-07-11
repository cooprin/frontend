export default {
  // Заголовки і дії
  title: 'Wialon Objects',
  add: 'Add Object',
  edit: 'Edit Object',
  create: 'Create Object',
  delete: 'Delete Object',

  // Поля
  name: 'Name',
  wialonId: 'Wialon ID',
  description: 'Description',
  client: 'Client',
  clientName: 'Client Name',
  status: 'Status',
  productsCount: 'Products Count',
  tariff: 'Tariff',
  tariffName: 'Tariff Name',
  tariffPrice: 'Tariff Price',
  operationDate: 'Operation Date',
  tariffEffectiveFrom: 'Tariff Effective From',
  tariffEffectiveHint: 'Date from which the tariff will be effective',
  tariffMatchOperationDate: 'Matches operation date',

  // Статуси
  statuses: {
    active: 'Active',
    suspended: 'Suspended',
    inactive: 'Inactive',
  },

  // Повідомлення
  createSuccess: 'Object created successfully',
  updateSuccess: 'Object updated successfully',
  deleteSuccess: 'Object deleted successfully',
  deleteConfirmation: 'Are you sure you want to delete this object?',
  cannotDelete: 'Cannot delete object with installed products',
  statusWarning: 'Note: Objects with non-active status will not have tariff assignments',

  // Фільтри
  filters: {
    title: 'Filters',
    search: 'Search objects',
    client: 'Filter by client',
    status: 'Filter by status',
  },

  // Зміна власника
  ownership: {
    title: 'Change Owner',
    changeOwner: 'Change Owner',
    selectClient: 'Select New Owner',
    notes: 'Notes',
    operationDate: 'Operation Date',
    changeSuccess: 'Owner changed successfully',
    history: 'Ownership History',
    noHistory: 'No ownership history records',
    period: 'Period',
    currentOwner: 'Current Owner',
  },

  // Продукти
  products: {
    title: 'Installed Products',
    count: '{count} Products',
    empty: 'No products',
    noProducts: 'This object has no installed products',
  },

  // Загальне
  notFound: 'Object not found',
  basicInfo: 'Basic Information',
  tariffInfo: 'Tariff Information',

  tabs: {
    info: 'Information',
    products: 'Products',
    history: 'History',
    finances: 'Finances',
  },
  noTariff: 'No tariff assigned',
  present: 'present',
}
