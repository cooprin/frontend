import { api } from 'boot/axios'

export const ProductTypesApi = {
  // Отримання списку типів продуктів з фільтрами і пагінацією
  getProductTypes: (params) => {
    return api.get('/product-types', { params })
  },

  // Отримання конкретного типу
  getProductType: (id) => {
    return api.get(`/product-types/${id}`)
  },

  // Створення типу продукту
  createProductType: (data) => {
    return api.post('/product-types', data)
  },

  // Оновлення типу продукту
  updateProductType: (id, data) => {
    return api.put(`/product-types/${id}`, data)
  },

  // Видалення типу продукту
  deleteProductType: (id) => {
    return api.delete(`/product-types/${id}`)
  },

  // Додавання характеристики до типу
  addCharacteristic: (typeId, data) => {
    return api.post(`/product-types/${typeId}/characteristics`, data)
  },

  // Оновлення характеристики
  updateCharacteristic: (typeId, charId, data) => {
    return api.put(`/product-types/${typeId}/characteristics/${charId}`, data)
  },

  // Видалення характеристики
  deleteCharacteristic: (typeId, charId) => {
    return api.delete(`/product-types/${typeId}/characteristics/${charId}`)
  },

  // Отримання характеристик типу
  getCharacteristics: (typeId) => {
    return api.get(`/product-types/${typeId}/characteristics`)
  },
}
