import { api } from 'boot/axios'

export const StockApi = {
  // Отримання залишків з фільтрами і пагінацією
  getStock: (params) => {
    return api.get('/stock', { params })
  },

  // Отримання історії руху
  getMovements: (params) => {
    return api.get('/stock/movements', { params })
  },

  // Отримання поточного місцезнаходження товару
  getCurrentLocation: (productId) => {
    return api.get(`/stock/current-location/${productId}`)
  },

  // Переміщення товару між складами
  transferStock: (data) => {
    return api.post('/stock/transfer', data)
  },

  // Встановлення товару на об'єкт
  installProduct: (data) => {
    return api.post('/stock/install', data)
  },

  // Демонтаж товару з об'єкту
  uninstallProduct: (data) => {
    return api.post('/stock/uninstall', data)
  },

  // Відправка товару в ремонт
  sendToRepair: (data) => {
    return api.post('/stock/repair/send', data)
  },

  // Повернення товару з ремонту
  returnFromRepair: (data) => {
    return api.post('/stock/repair/return', data)
  },

  // Списання товару
  writeOffProduct: (data) => {
    return api.post('/stock/write-off', data)
  },
  exportMovements(params = {}) {
    return api.get('/stock/movements/export', {
      params,
      responseType: 'blob',
    })
  },

  getLowStockItems: (params) => {
    return api.get('/stock/low-stock', { params })
  },

  // Додати нові методи в StockApi

  getStockMetrics: (params) => {
    return api.get('/stock/metrics', { params })
  },

  getStockByWarehouse: (params) => {
    return api.get('/stock/by-warehouse', { params })
  },

  getStockByType: (params) => {
    return api.get('/stock/by-type', { params })
  },

  getStockByModel: (params) => {
    return api.get('/stock/by-model', { params })
  },

  getCriticalStock: (params) => {
    return api.get('/stock/critical', { params })
  },

  getWarehousesOptions: () => {
    return api.get('/warehouses', { params: { perPage: 'All', isActive: true } })
  },

  getProductTypesOptions: () => {
    return api.get('/product-types', { params: { perPage: 'All', isActive: true } })
  },

  getManufacturersOptions: () => {
    return api.get('/manufacturers', { params: { perPage: 'All', isActive: true } })
  },
  // Нові методи для дашборду
  getWarehouseStockSummary: (warehouseId = 'all') => {
    return api.get(`/stock/warehouse-summary/${warehouseId}`)
  },

  getStockByTypesForWarehouse: (warehouseId = 'all') => {
    return api.get(`/stock/stock-by-types/${warehouseId}`)
  },

  getModelStockForWarehouse: (warehouseId = 'all', params = {}) => {
    return api.get(`/stock/models-stock/${warehouseId}`, { params })
  },

  getRepairItems: (params = {}) => {
    return api.get('/stock/repair-items', { params })
  },

  // Додаткові методи для отримання опцій
  getActiveWarehouses: () => {
    return api.get('/warehouses', { params: { perPage: 'All', is_active: true } })
  },
}
