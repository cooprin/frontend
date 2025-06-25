export default {
  // Заголовки і дії
  title: 'Tickets',
  add: 'Create Ticket',
  edit: 'Edit Ticket',
  create: 'Create Ticket',
  delete: 'Delete Ticket',
  view: 'View Ticket',

  // Поля
  ticketNumber: 'Ticket Number',
  ticketTitle: 'Title',
  description: 'Description',
  category: 'Category',
  object: 'Object',
  priority: 'Priority',
  status: 'Status',
  assignedTo: 'Assigned To',
  createdBy: 'Created By',
  createdAt: 'Created At',
  resolvedAt: 'Resolved At',
  closedAt: 'Closed At',

  // Пріоритети
  priorities: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  },

  // Статуси
  statuses: {
    open: 'Open',
    in_progress: 'In Progress',
    waiting_client: 'Waiting Client',
    resolved: 'Resolved',
    closed: 'Closed',
    cancelled: 'Cancelled',
  },

  // Категорії
  categories: {
    technical_support: 'Technical Support',
    technical_support_desc: 'General technical support questions',
    hardware_issues: 'Hardware Issues',
    hardware_issues_desc: 'GPS tracker and equipment malfunctions',
    configuration: 'Configuration',
    configuration_desc: 'Requests for object configuration changes',
    billing_payment: 'Billing & Payment',
    billing_payment_desc: 'Questions about service payments and invoices',
    system_access: 'System Access',
    system_access_desc: 'Problems with Wialon system login',
    other: 'Other',
    other_desc: 'Other questions and suggestions',
  },

  // Коментарі
  comments: {
    title: 'Comments',
    add: 'Add Comment',
    addSuccess: 'Comment added successfully',
    addError: 'Error adding comment',
    edit: 'Edit Comment',
    text: 'Comment Text',
    updateSuccess: 'Comment updated successfully',
    updateError: 'Error updating comment',
    deleteConfirm: 'Delete Comment',
    deleteMessage: 'Are you sure you want to delete this comment?',
    deleteSuccess: 'Comment deleted successfully',
    deleteError: 'Error deleting comment',
    internal: 'Internal Comment',
    public: 'Public Comment',
    noComments: 'No comments',
    addComment: 'Write a comment...',
  },

  // Файли
  files: {
    title: 'Files',
    upload: 'Attach File',
    download: 'Download',
    delete: 'Delete',
    noFiles: 'No files',
  },

  // Повідомлення
  createSuccess: 'Ticket created successfully',
  updateSuccess: 'Ticket updated successfully',
  deleteSuccess: 'Ticket deleted successfully',
  deleteConfirmation: 'Are you sure you want to delete this ticket?',
  commentSuccess: 'Comment added',
  fileUploadSuccess: 'File uploaded',
  createError: 'Error creating ticket',
  assignSuccess: 'Ticket assigned successfully',
  assignError: 'Error assigning ticket',
  updateError: 'Error updating ticket',
  notFound: 'Ticket not found',

  // Фільтри
  filters: {
    title: 'Filters',
    search: 'Search tickets',
    category: 'Category',
    status: 'Status',
    priority: 'Priority',
    assignedTo: 'Assigned To',
    unassigned: 'Unassigned',
    assignedToMe: 'Assigned to Me',
    urgentOnly: 'Urgent Only',
    highPriorityOnly: 'High Priority Only',
  },

  // Вкладки
  tabs: {
    new: 'New',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    all: 'All',
    details: 'Details',
    history: 'History',
  },

  // Швидкі дії та інформація
  assignToMe: 'Assign to Me',
  startWork: 'Start Work',
  markResolved: 'Mark as Resolved',
  clientInfo: 'Client Information',
  client: 'Client',
  ticketInfo: 'Ticket Information',
  clientComment: 'Client Comment',
  staffComment: 'Staff Comment',
  created: 'Created',
  resolved: 'Resolved',
  closed: 'Closed',
}
