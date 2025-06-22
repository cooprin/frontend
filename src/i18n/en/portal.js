export default {
  // Загальні
  title: 'Customer Portal',
  dashboard: 'Dashboard',
  profile: 'Profile',
  logout: 'Logout',

  // Меню
  myObjects: 'My Objects',
  myInvoices: 'My Invoices',
  myDocuments: 'My Documents',
  myTickets: 'My Tickets',
  chat: 'Support Chat',

  // Сторінки
  pages: {
    dashboard: {
      title: 'Customer Portal',
      welcome: 'Welcome to your customer portal!',
      objectsCount: 'Objects Count',
      unpaidInvoices: 'Unpaid Invoices',
      openTickets: 'Open Tickets',
      lastActivity: 'Last Activity',
    },
    objects: {
      title: 'My Objects',
      noObjects: 'You have no objects',
      status: 'Status',
      tariff: 'Tariff',
      monthly: 'per month',
    },
    invoices: {
      title: 'My Invoices',
      noInvoices: 'You have no invoices',
      invoiceNumber: 'Invoice Number',
      date: 'Date',
      period: 'Period',
      amount: 'Amount',
      status: 'Status',
      download: 'Download',
    },
    documents: {
      title: 'My Documents',
      noDocuments: 'You have no documents',
      fileName: 'File Name',
      type: 'Type',
      size: 'Size',
      uploadDate: 'Upload Date',
      download: 'Download',
    },
    tickets: {
      title: 'My Tickets',
      createNew: 'Create Ticket',
      noTickets: 'You have no tickets',
      ticketNumber: 'Ticket Number',
      subject: 'Subject',
      status: 'Status',
      priority: 'Priority',
      created: 'Created',
      lastUpdate: 'Last Update',
    },
    chat: {
      title: 'Support Chat',
      typeMessage: 'Type a message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      support: 'Support',
    },
    profile: {
      title: 'My Profile',
      personalInfo: 'Personal Information',
      companyInfo: 'Company Information',
      contactInfo: 'Contact Information',
      statisticsInfo: 'Statistics',
    },
  },

  // Статуси
  statuses: {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    paid: 'Paid',
    unpaid: 'Unpaid',
    overdue: 'Overdue',
  },

  // Повідомлення
  messages: {
    loading: 'Loading...',
    noData: 'No data',
    error: 'An error occurred',
    success: 'Success',
  },
}
