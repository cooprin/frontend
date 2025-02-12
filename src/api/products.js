import { api } from 'boot/axios'

export const ProductsApi = {
  // Отримання списку продуктів з фільтрами і пагінацією
  getProducts: (params) => {
    return api.get('/products', { params })
  },

  // Отримання конкретного продукту
  getProduct: (id) => {
    return api.get(`/products/${id}`)
  },

  // Створення продукту
  createProduct: (data) => {
    return api.post('/products', data)
  },

  // Оновлення продукту
  updateProduct: (id, data) => {
    return api.put(`/products/${id}`, data)
  },

  // Видалення продукту
  deleteProduct: (id) => {
    return api.delete(`/products/${id}`)
  },

  // Зміна статусу продукту
  updateStatus: (id, status, objectId = null) => {
    return api.put(`/products/${id}/status`, { status, object_id: objectId })
  },

  // Отримання списку виробників для селекту
  getManufacturers: () => {
    return api.get('/manufacturers', {
      params: {
        perPage: 'All',
        isActive: true,
      },
    })
  },

  // Отримання списку постачальників для селекту
  getSuppliers: () => {
    return api.get('/suppliers', {
      params: {
        perPage: 'All',
        isActive: true,
      },
    })
  },

  // Отримання списку моделей для селекту
  getModels: (manufacturerId = null) => {
    return api.get('/models', {
      params: {
        perPage: 'All',
        isActive: true,
        manufacturer: manufacturerId,
      },
    })
  },
}
