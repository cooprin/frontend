export default {
  // Заголовки і дії
  title: 'Services',
  add: 'Add Service',
  edit: 'Edit Service',
  create: 'Create Service',
  delete: 'Delete Service',

  // Поля
  name: 'Name',
  description: 'Description',
  serviceType: 'Service Type',
  fixedPrice: 'Fixed Price',
  isActive: 'Active',
  clientsCount: 'Clients Count',

  // Типи послуг
  types: {
    fixed: 'Fixed Price',
    object_based: 'Object-based Price',
  },

  // Повідомлення
  createSuccess: 'Service created successfully',
  updateSuccess: 'Service updated successfully',
  deleteSuccess: 'Service deleted successfully',
  deleteConfirmation: 'Are you sure you want to delete this service?',
  cannotDelete: 'Cannot delete service with existing client assignments',

  // Фільтри
  filters: {
    title: 'Filters',
    search: 'Search services',
    type: 'Filter by type',
    status: 'Filter by status',
  },

  // Призначення послуг
  assignment: {
    title: 'Assign Service',
    assignTo: 'Assign to Client',
    selectClient: 'Select Client',
    startDate: 'Start Date',
    notes: 'Notes',
    assignSuccess: 'Service assigned successfully',
    alreadyAssigned: 'This service is already assigned to the client',
  },

  // Клієнти послуги
  clients: {
    title: 'Clients',
    count: '{count} Clients',
    empty: 'No clients',
    noClients: 'This service is not assigned to any clients',
    startDate: 'Start Date',
    endDate: 'End Date',
    status: 'Status',
    terminate: 'Terminate Service',
    terminateSuccess: 'Service terminated successfully',
    terminationDate: 'Termination Date',
  },

  // Статуси призначення послуг
  statuses: {
    active: 'Active',
    terminated: 'Terminated',
  },
  notFound: 'Service not found',
  basicInfo: 'Basic Information',
  statistics: 'Statistics',

  tabs: {
    info: 'Information',
    clients: 'Clients',
  },
}
