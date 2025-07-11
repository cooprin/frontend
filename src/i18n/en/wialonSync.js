export default {
  title: 'Wialon Synchronization',
  description: 'Manage data synchronization between system and Wialon',

  tabs: {
    sessions: 'Sessions',
    discrepancies: 'Discrepancies',
    rules: 'Rules',
    logs: 'Logs',
  },

  sessions: {
    title: 'Synchronization Sessions',
    startNew: 'Start Synchronization',
    status: {
      running: 'Running',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
    },
    columns: {
      startTime: 'Start Time',
      endTime: 'End Time',
      status: 'Status',
      clientsChecked: 'Clients Checked',
      objectsChecked: 'Objects Checked',
      discrepanciesFound: 'Discrepancies Found',
      duration: 'Duration',
    },
    details: 'Session Details',
    logs: 'Session Logs',
    noSessions: 'No synchronization sessions found',
    stats: {
      total: 'Total Sessions',
      completed: 'Completed',
      failed: 'Failed',
      pending: 'Pending Resolution',
    },
  },

  discrepancies: {
    title: 'Discrepancies',
    pending: 'Pending Resolution',
    resolved: 'Resolved',
    types: {
      new_client: 'New Client',
      new_object: 'New Object',
      client_name_changed: 'Client Name Changed',
      object_name_changed: 'Object Name Changed',
      owner_changed: 'Owner Changed',
      client_deleted: 'Client Deleted',
      object_deleted: 'Object Deleted',
    },
    status: {
      pending: 'Pending',
      approved: 'Approved',
      added: 'Added',
      ignored: 'Ignored',
      rejected: 'Rejected',
    },
    actions: {
      approve: 'Approve',
      ignore: 'Ignore',
      reject: 'Reject',
      approveSelected: 'Approve Selected',
      bulkAction: 'Bulk Action',
      createClient: 'Create Client',
      createObject: 'Create Object',
      updateClient: 'Update Client',
      updateObject: 'Update Object',
      changeOwner: 'Change Owner',
      resolve: 'Resolve',
      bulkIgnore: 'Ignore Selected',
    },
    useInteractiveMode: 'Use interactive mode to resolve discrepancies',
    columns: {
      type: 'Type',
      entity: 'Entity',
      wialonData: 'Wialon Data',
      systemData: 'System Data',
      suggestedAction: 'Suggested Action',
      status: 'Status',
      resolvedAt: 'Resolved At',
    },
    noDiscrepancies: 'No discrepancies found',
    resolveSuccess: 'Discrepancies resolved successfully',
    resolveError: 'Error resolving discrepancies',
    stats: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      ignored: 'Ignored',
    },
  },

  rules: {
    title: 'Synchronization Rules',
    create: 'Create Rule',
    edit: 'Edit Rule',
    types: {
      client_mapping: 'Client Mapping',
      object_mapping: 'Object Mapping',
      equipment_check: 'Equipment Check',
      name_comparison: 'Name Comparison',
      owner_validation: 'Owner Validation',
      custom: 'Custom Rule',
    },
    columns: {
      name: 'Name',
      type: 'Type',
      executionOrder: 'Execution Order',
      isActive: 'Active',
      lastExecution: 'Last Execution',
    },
    form: {
      name: 'Rule Name',
      description: 'Description',
      type: 'Rule Type',
      sqlQuery: 'SQL Query',
      parameters: 'Parameters',
      executionOrder: 'Execution Order',
      isActive: 'Active Rule',
    },
    stats: {
      total: 'Total Rules',
      active: 'Active',
      inactive: 'Inactive',
      executions: "Today's Executions",
    },
  },

  logs: {
    title: 'Synchronization Logs',
    levels: {
      info: 'Information',
      warning: 'Warning',
      error: 'Error',
      debug: 'Debug',
    },
    columns: {
      time: 'Time',
      level: 'Level',
      message: 'Message',
      details: 'Details',
    },
    noLogs: 'No logs found',
    actions: {
      clear: 'Clear Logs',
    },
    stats: {
      total: 'Total Records',
      info: 'Information',
      warning: 'Warnings',
      error: 'Errors',
    },
    filters: {
      session: 'Session',
      dateFrom: 'From Date',
      dateTo: 'To Date',
    },
  },

  common: {
    search: 'Search...',
    filter: 'Filter',
    refresh: 'Refresh',
    loading: 'Loading...',
    noData: 'No data',
    selectAll: 'Select All',
    selected: 'Selected',
    showDetails: 'Show Details',
    hideDetails: 'Hide Details',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    actions: 'Actions',
    generalInfo: 'General Information',
    statistics: 'Statistics',
    createdBy: 'Created By',
    system: 'System',
    errorLoading: 'Error loading data',
    syncStarted: 'Synchronization started',
    errorStartingSync: 'Error starting synchronization',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
    never: 'Never',
    found: 'Found',
    resolvedBy: 'Resolved By',
    discrepancyDetails: 'Discrepancy Details',
    resolutionNotes: 'Resolution Notes',
    discrepancyResolved: 'Discrepancy resolved',
    discrepanciesResolved: 'Resolved {count} discrepancies',
    errorLoadingDiscrepancies: 'Error loading discrepancies',
    noRulesFound: 'No synchronization rules found',
    executeRule: 'Execute rule',
    order: 'Order',
    executions: 'Executions',
    ruleDetails: 'Rule Details',
    created: 'Created',
    author: 'Author',
    executionStats: 'Execution Statistics',
    totalExecutions: 'Total Executions',
    nameRequired: 'Name is required',
    ruleTypeRequired: 'Rule type is required',
    sqlQueryRequired: 'SQL query is required',
    jsonFormat: 'JSON format: {key: "value"}',
    invalidJsonFormat: 'Invalid JSON format for parameters',
    ruleUpdated: 'Rule updated',
    ruleCreated: 'Rule created',
    errorSavingRule: 'Error saving rule',
    ruleActivated: 'Rule activated',
    ruleDeactivated: 'Rule deactivated',
    errorTogglingRule: 'Error changing rule status',
    ruleExecuted: "Rule '{name}' executed",
    errorExecutingRule: 'Error executing rule',
    deleteRuleConfirm: "Delete rule '{name}'?",
    ruleDeleted: 'Rule deleted',
    errorDeletingRule: 'Error deleting rule',
    errorLoadingRules: 'Error loading synchronization rules',
    errorLoadingLogs: 'Error loading logs',
    copyMessage: 'Copy message',
    fullMessage: 'Full message',
    logDetails: 'Log record details',
    copyJson: 'Copy JSON',
    clearLogsConfirm: 'Delete all logs? This action cannot be undone.',
    logsCleared: 'Logs cleared',
    errorClearingLogs: 'Error clearing logs',
    messageCopied: 'Message copied',
    jsonCopied: 'JSON copied',
    errorCopying: 'Error copying',
    errorLoadingClientData: 'Error loading client data',
    errorLoadingObjectData: 'Error loading object data',
    onPage: 'on page',
  },
}
