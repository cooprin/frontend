import { api } from 'boot/axios'

export const CharacteristicTypesApi = {
  // Отримання списку типів характеристик
  getCharacteristicTypes: () => {
    return api.get('/characteristic-types')
  },

  // Додавання характеристики до типу продукту
  addCharacteristic: (productTypeId, data) => {
    return api.post(`/characteristic-types/${productTypeId}/characteristics`, data)
  },

  // Оновлення характеристики
  updateCharacteristic: (productTypeId, characteristicId, data) => {
    return api.put(
      `/characteristic-types/${productTypeId}/characteristics/${characteristicId}`,
      data,
    )
  },

  // Видалення характеристики
  deleteCharacteristic: (productTypeId, characteristicId) => {
    return api.delete(`/characteristic-types/${productTypeId}/characteristics/${characteristicId}`)
  },

  // Оновлення порядку характеристик
  updateCharacteristicsOrder: (productTypeId, characteristics) => {
    return api.put(`/characteristic-types/${productTypeId}/characteristics/order`, {
      characteristics,
    })
  },

  // Валідація значення характеристики
  validateCharacteristic: (data) => {
    return api.post('/characteristic-types/validate', data)
  },
}
