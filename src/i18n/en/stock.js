export default {
  // Заголовки і дії
  title: 'Stock',
  movements: 'Stock Movements',
  transfer: 'Transfer Stock',
  adjust: 'Adjust Stock',
  install: 'Install',
  uninstall: 'Uninstall',
  sendToRepair: 'Send to Repair',
  returnFromRepair: 'Return from Repair',
  writeOff: 'Write Off',

  // Поля
  warehouse: 'Warehouse',
  product: 'Product',
  quantity: 'Quantity',
  fromWarehouse: 'From Warehouse',
  toWarehouse: 'To Warehouse',
  type: 'Operation Type',
  comment: 'Comment',
  createdBy: 'Created By',
  createdAt: 'Created At',
  object: 'Object',

  // Типи операцій
  types: {
    transfer: 'Transfer',
    install: 'Installation',
    uninstall: 'Uninstallation',
    repair_send: 'Send to Repair',
    repair_return: 'Return from Repair',
    write_off: 'Write Off',
    warranty_change: 'Warranty Change',
    stock_in: 'Stock In',
    stock_out: 'Stock Out',
    receipt: 'Receipt',
    shipment: 'Shipment',
    return: 'Return',
    adjustment: 'Adjustment',
  },

  // Повідомлення
  transferSuccess: 'Stock transferred successfully',
  adjustSuccess: 'Stock adjusted successfully',
  insufficientStock: 'Insufficient stock in source warehouse',
  installSuccess: 'Product installed successfully',
  uninstallSuccess: 'Product uninstalled successfully',
  sendToRepairSuccess: 'Product sent to repair successfully',
  returnFromRepairSuccess: 'Product returned from repair successfully',
  writeOffSuccess: 'Product written off successfully',

  // Фільтри
  filters: {
    title: 'Filters',
    warehouse: 'Filter by warehouse',
    dateFrom: 'Date from',
    dateTo: 'Date to',
    type: 'Filter by operation type',
    product: 'Filter by product',
    fromWarehouse: 'From Warehouse',
    toWarehouse: 'To Warehouse',
  },
}
