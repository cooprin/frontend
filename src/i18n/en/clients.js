export default {
  // Заголовки і дії
  title: 'Clients',
  add: 'Add Client',
  edit: 'Edit Client',
  create: 'Create Client',
  delete: 'Delete Client',

  // Поля
  name: 'Name',
  fullName: 'Full Company Name',
  contactPerson: 'Contact Person',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  description: 'Description',
  wialonId: 'Wialon ID',
  wialonUsername: 'Wialon Username',
  isActive: 'Active',
  objectsCount: 'Objects Count',
  documentsCount: 'Documents Count',

  // Повідомлення
  createSuccess: 'Client created successfully',
  updateSuccess: 'Client updated successfully',
  deleteSuccess: 'Client deleted successfully',
  deleteConfirmation: 'Are you sure you want to delete this client?',
  cannotDelete: 'Cannot delete client with existing objects',

  // Повідомлення
  notFound: 'Client not found',
  noObjects: 'No objects found for this client',

  // Заголовки
  basicInfo: 'Basic Information',
  statistics: 'Statistics',

  // Вкладки та дані послуг і рахунків
  services: {
    noServices: 'No services assigned to this client',
  },

  // Фільтри
  filters: {
    title: 'Filters',
    search: 'Search clients',
    status: 'Filter by status',
  },

  // Документи
  documents: {
    title: 'Documents',
    count: '{count} Documents',
    empty: 'No documents',
    add: 'Add document',
    noDocuments: 'No documents uploaded',
    upload: 'Upload Document',
    selectFile: 'Select file',
    description: 'Description',
    deleteConfirmation: 'Are you sure you want to delete this document?',
    uploadSuccess: 'Document uploaded successfully',
    deleteSuccess: 'Document deleted successfully',
  },

  // Вкладки
  tabs: {
    info: 'Information',
    objects: 'Objects',
    documents: 'Documents',
    services: 'Services',
    invoices: 'Invoices',
  },
  // Wialon payment information
  payment: {
    title: 'Payment Information',
    paidUntil: 'Paid until',
    daysLeft: 'Days left',
    status: {
      active: 'Active',
      expiringSoon: 'Expiring soon',
      expired: 'Debt',
    },
    notConfigured: 'Wialon integration not configured',
    noWialonId: 'Wialon ID not specified',
    error: 'Error getting information',
    loading: 'Loading...',
  },
}
