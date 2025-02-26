export default {
  // Заголовки і дії
  title: 'Stock',
  movements: 'Stock Movements',
  transfer: 'Transfer Stock',
  adjust: 'Adjust Stock',

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

  // Фільтри
  filters: {
    title: 'Filters',
    warehouse: 'Filter by warehouse',
    dateFrom: 'Date from',
    dateTo: 'Date to',
    type: 'Filter by operation type',
    product: 'Filter by product',
  },
}
