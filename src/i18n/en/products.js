export default {
  // Заголовки і дії
  title: 'Products',
  add: 'Add Product',
  edit: 'Edit Product',
  create: 'Create Product',
  delete: 'Delete Product',
  view: 'View Product',
  characteristics: 'Characteristics',
  noCharacteristics: 'No characteristics defined',
  type: 'Product Type',
  mainInfo: 'Main Information',
  editLimitedFields: 'You can edit limited fields in edit mode',
  skuHint: 'Format: uppercase letters, numbers and dashes',
  fillRequiredFields: 'Please fill all required fields',

  // Поля продукту
  sku: 'SKU',
  model: 'Model',
  manufacturer: 'Manufacturer',
  supplier: 'Supplier',
  status: 'Status',
  warrantyEnd: 'Warranty End',
  purchaseDate: 'Purchase Date',
  supplierWarrantyEnd: 'Supplier Warranty End',
  isOwn: 'Own Product',
  ownership: 'Ownership',
  own: 'Own',
  notOwn: 'Not Own',
  quantity: 'Quantity',
  currentObject: 'Current Object',
  price: 'Price',
  description: 'Description',
  warehouse: 'Warehouse',
  productType: 'Product Type',
  all: 'All',
  currentLocation: 'Current Location',
  movements: 'Movement History',
  objectId: 'Object ID',
  supplierInfo: 'Supplier Information',
  supplierContact: 'Contact Person',
  supplierPhone: 'Phone',
  supplierEmail: 'Email',
  changeStatus: 'Change Status',

  // Статуси
  statuses: {
    in_stock: 'In Stock',
    installed: 'Installed',
    in_repair: 'In Repair',
    written_off: 'Written Off',
  },

  // Повідомлення успіху/помилок
  createSuccess: 'Product created successfully',
  updateSuccess: 'Product updated successfully',
  deleteSuccess: 'Product deleted successfully',
  statusUpdateSuccess: 'Product status updated successfully',
  deleteConfirmation: 'Are you sure you want to delete this product?',
  cannotDelete: 'Cannot delete product with existing stock or movement history',
  exportSuccess: 'Products exported successfully',
  exportError: 'Error exporting products',

  // Фільтри
  filters: {
    title: 'Filters',
    manufacturer: 'Filter by manufacturer',
    status: 'Filter by status',
    ownership: 'Filter by ownership',
    dateFrom: 'Purchase date from',
    dateTo: 'Purchase date to',
    warranty: 'Warranty status',
    search: 'Search products...',
  },
}
