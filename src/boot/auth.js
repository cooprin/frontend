import { useAuthStore } from 'stores/auth'
import { useCurrency } from 'src/composables/useCurrency'

export default async () => {
  const authStore = useAuthStore()
  const { loadCurrencySettings } = useCurrency()

  // Ініціалізуємо store авторизації
  await authStore.initializeStore()

  // Завантажуємо налаштування валюти при старті додатка
  try {
    await loadCurrencySettings()
  } catch (error) {
    console.error('Failed to load currency settings:', error)
  }
}
