// src/api/product-types.js
import { api } from 'boot/axios'

export const ProductTypesApi = {
  // Отримання списку типів продуктів
  getProductTypes: (params) => {
    return api.get('/product-types', { params })
  },

  // Отримання одного типу продукту
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

  // Характеристики
  getCharacteristics: (productTypeId) => {
    return api.get(`/product-types/${productTypeId}/characteristics`)
  },

  addCharacteristic: (productTypeId, data) => {
    return api.post(`/product-types/${productTypeId}/characteristics`, data)
  },

  updateCharacteristic: (productTypeId, characteristicId, data) => {
    return api.put(`/product-types/${productTypeId}/characteristics/${characteristicId}`, data)
  },

  deleteCharacteristic: (productTypeId, characteristicId) => {
    return api.delete(`/product-types/${productTypeId}/characteristics/${characteristicId}`)
  },

  // Оновлення порядку характеристик
  updateCharacteristicsOrder: (productTypeId, data) => {
    return api.put(`/product-types/${productTypeId}/characteristics/order`, data)
  },
}
