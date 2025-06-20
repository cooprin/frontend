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
  countryCode: 'Country Code',
  email: 'Email',
  address: 'Address',
  description: 'Description',
  wialonId: 'Wialon User ID',
  wialonResourceId: 'Wialon Resource ID',
  wialonUsername: 'Wialon Username',
  isActive: 'Active',
  objectsCount: 'Objects Count',
  documentsCount: 'Documents Count',
  status: 'Status',

  // Підказки для полів Wialon
  wialonResourceIdHint: 'Resource ID for billing in Wialon',
  wialonUserIdHint: 'User ID for authorization in Wialon',
  wialonUsernameHint: 'Username in Wialon',

  // Описи полів Wialon (для інформаційного банера)
  wialonFields: {
    resourceIdDescription: 'for billing operations',
    userIdDescription: 'for user authorization',
    usernameDescription: 'user login',
  },

  // Validation messages
  validation: {
    wialonIdNumeric: 'Wialon User ID must contain only numbers',
    wialonResourceIdNumeric: 'Wialon Resource ID must contain only numbers',
  },

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
    daysLeft: 'Days left',
    paidUntil: 'Paid until',
    status: {
      active: 'Active',
      expiring_soon: 'Expiring soon',
      expired: 'Expired',
      blocked: 'Blocked',
      unknown: 'Unknown',
    },
    reason: {
      paid: 'Account is paid',
      unlimited: 'Unlimited access',
      expiring: 'Access expiring soon',
      days_expired: 'Payment period expired',
      account_blocked: 'Account is blocked',
      parent_account_blocked: 'Parent account is blocked',
    },
    notConfigured: 'Wialon integration not configured',
    noWialonResourceId: 'Wialon Resource ID not specified',
    error: 'Error getting information',
    loading: 'Loading...',
    plan: 'Tariff plan',
    parentAccount: 'Parent account',
  },
}
