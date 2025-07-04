export default {
  // Заголовки і дії
  title: 'Reports',
  create: 'Create Report',
  edit: 'Edit Report',
  manage: 'Manage Reports',
  execute: 'Execute',
  add: 'Add Report',
  clone: 'Clone Report',
  testExecute: 'Test Execute',

  // Поля звіту
  name: 'Report Name',
  code: 'Report Code',
  description: 'Description',
  sqlQuery: 'SQL Query',
  outputFormat: 'Output Format',
  executionTimeout: 'Execution Timeout',
  cacheDuration: 'Cache Duration',
  chartConfig: 'Chart Configuration',
  isActive: 'Active',

  // Підказки
  codeHint: 'Unique identifier for the report (letters, numbers, underscore)',
  cacheDurationHint: '0 = no cache, >0 = cache for specified minutes',
  chartConfigHint: 'JSON configuration for chart display',
  sqlParametersHint: 'Use :parameter_name in SQL to reference parameters',

  // Формати виводу
  formats: {
    table: 'Table',
    chart: 'Chart',
    export: 'Export Only',
    both: 'Table + Chart',
  },

  // Параметри
  parameters: 'Parameters',
  addParameter: 'Add Parameter',
  editParameter: 'Edit Parameter',
  noParameters: 'No parameters defined',
  parameterName: 'Parameter Name',
  displayName: 'Display Name',
  parameterType: 'Parameter Type',
  defaultValue: 'Default Value',
  isRequired: 'Required',
  ordering: 'Order',

  // Типи параметрів
  parameterTypes: {
    text: 'Text',
    number: 'Number',
    date: 'Date',
    datetime: 'Date & Time',
    select: 'Select',
    multiselect: 'Multi Select',
    boolean: 'Yes/No',
    clientId: 'Client',
    userId: 'User',
  },

  // Прив'язки до сторінок
  pageAssignments: 'Page Assignments',
  addPageAssignment: 'Add Page Assignment',
  editPageAssignment: 'Edit Page Assignment',
  noPageAssignments: 'Not assigned to any pages',
  pageIdentifier: 'Page Identifier',
  pageTitle: 'Page Title',
  displayOrder: 'Display Order',
  isVisible: 'Visible',
  autoExecute: 'Auto Execute',
  pagesAssigned: 'Pages Assigned',
  notAssigned: 'Not assigned',

  // Ідентифікатори сторінок
  pages: {
    invoices: 'Invoices',
    clients: 'Clients',
    wialonObjects: 'Wialon Objects',
    billing: 'Payments',
    products: 'Products',
    warehouses: 'Warehouses',
    services: 'Services',
    users: 'Users',
    audit: 'Audit',
    tickets: 'Tickets',
    chat: 'Chat',
  },

  // Виконання звітів
  results: 'Results',
  executionTime: 'Execution Time',
  rowsCount: 'Rows Count',
  rowsReturned: 'rows returned',
  fromCache: 'From Cache',
  servedFromCache: 'Result served from cache',
  noData: 'No data returned',
  export: 'Export',

  // Статуси виконання
  statuses: {
    success: 'Success',
    error: 'Error',
    timeout: 'Timeout',
    cancelled: 'Cancelled',
  },

  // Фільтри
  filters: {
    search: 'Search reports',
    status: 'Status',
    outputFormat: 'Output Format',
    executionStatus: 'Execution Status',
    executedBy: 'Executed By',
    dateFrom: 'Date From',
    dateTo: 'Date To',
  },

  // Історія виконання
  executionHistory: 'Execution History',
  executedAt: 'Executed At',
  executedBy: 'Executed By',
  executedByType: 'Executed By Type',
  executions: 'Executions',
  viewDetails: 'View Details',
  executionDetails: 'Execution Details',
  executionInfo: 'Execution Information',
  rerunWithSameParameters: 'Rerun with Same Parameters',
  downloadResults: 'Download Results',
  systemExecution: 'System',
  ipAddress: 'IP Address',
  userAgent: 'User Agent',
  errorMessage: 'Error Message',
  technicalDetails: 'Technical Details',
  history: 'History',

  // Повідомлення успіху
  createSuccess: 'Report created successfully',
  updateSuccess: 'Report updated successfully',
  deleteSuccess: 'Report deleted successfully',
  cloneSuccess: 'Report cloned successfully',
  executionSuccess: 'Report executed successfully',
  testExecuteSuccess: 'Report executed successfully',
  rerunSuccess: 'Report re-executed successfully',
  exportSuccess: 'Results exported successfully',
  downloadSuccess: 'Results downloaded successfully',
  cacheCleared: 'Cache cleared successfully',
  loadFromFilesSuccess: 'Reports loaded from files successfully',

  // Повідомлення помилок
  errorLoadingReport: 'Error loading report',
  errorLoadingReports: 'Error loading reports list',
  errorLoadingParameters: 'Error loading report parameters',
  errorLoadingHistory: 'Error loading execution history',
  saveError: 'Error saving report',
  executionError: 'Error executing report',
  testExecuteError: 'Error testing report',
  rerunError: 'Error re-executing report',
  exportError: 'Error exporting results',
  downloadError: 'Error downloading results',
  previewError: 'Error previewing query',
  cloneError: 'Error cloning report',
  cacheClearError: 'Error clearing cache',
  loadFromFilesError: 'Error loading reports from files',
  exportHistoryError: 'Error exporting history',

  // Підтвердження
  deleteConfirmation: 'Are you sure you want to delete this report?',

  // Управління
  clearCache: 'Clear Cache',
  loadFromFiles: 'Load from Files',
  previewQuery: 'Preview Query',
  queryPreview: 'Query Preview',
  noPreviewData: 'No preview data',
  viewSchema: 'View Schema',
  help: 'Help',
  sqlParameters: 'SQL Parameters',
  exportHistory: 'Export History',
  exportHistoryNotImplemented: 'History export not implemented yet',

  // Загальні
  status: 'Status',
  active: 'Active',
  inactive: 'Inactive',
  schemaNotImplemented: 'Database schema view not implemented yet',
}
