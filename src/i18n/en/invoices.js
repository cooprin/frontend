export default {
  // Заголовки і дії
  title: 'Invoices',
  add: 'Add Invoice',
  create: 'Create Invoice',

  // Поля
  invoiceNumber: 'Invoice Number',
  invoiceDate: 'Invoice Date',
  billingMonth: 'Billing Month',
  billingYear: 'Billing Year',
  billingPeriod: 'Billing Period',
  client: 'Client',
  totalAmount: 'Total Amount',
  status: 'Status',
  notes: 'Notes',
  createdBy: 'Created By',
  paymentDate: 'Payment Date',

  // Статуси рахунків
  statuses: {
    issued: 'Issued',
    paid: 'Paid',
    cancelled: 'Cancelled',
  },

  // Позиції рахунку
  items: {
    title: 'Invoice Items',
    service: 'Service',
    description: 'Description',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    totalPrice: 'Total Price',
    add: 'Add Item',
    remove: 'Remove',
  },

  // Повідомлення
  createSuccess: 'Invoice created successfully',
  statusUpdateSuccess: 'Invoice status updated successfully',
  noInvoices: 'No invoices found',
  noItems: 'No items in this invoice',

  // Фільтри
  filters: {
    title: 'Filters',
    search: 'Search invoices',
    status: 'Filter by status',
    year: 'Filter by year',
    month: 'Filter by month',
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

  // Загальне
  notFound: 'Invoice not found',
  basicInfo: 'Basic Information',
  statistics: 'Statistics',

  tabs: {
    info: 'Information',
    items: 'Items',
    documents: 'Documents',
  },

  // Місяці
  months: {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  },
  markAsPaid: 'Mark as Paid',
  markAsCancelled: 'Mark as Cancelled',
}
