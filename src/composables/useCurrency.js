import { ref, computed } from 'vue'
import { CompanyApi } from 'src/api/company'
import { getCurrencyByCode } from 'src/constants/currencies'

// Глобальний стан налаштувань валюти
const currencySettings = ref({
  currency: 'UAH',
  format: 'symbol_before',
  decimalPlaces: 2,
  useThousandsSeparator: true,
})

const isLoaded = ref(false)

export function useCurrency() {
  // Завантаження налаштувань валюти
  const loadCurrencySettings = async () => {
    if (isLoaded.value) return

    try {
      const response = await CompanyApi.getCurrencySettings()
      if (response.data.success) {
        currencySettings.value = { ...response.data.settings }
        isLoaded.value = true
      }
    } catch (error) {
      console.error('Error loading currency settings:', error)
      // Використовуємо дефолтні налаштування
      isLoaded.value = true
    }
  }

  // Форматування суми згідно налаштувань
  const formatCurrency = (amount, customSettings = null) => {
    const settings = customSettings || currencySettings.value
    const currency = getCurrencyByCode(settings.currency)

    if (!currency) return amount.toString()

    // Перевіряємо що amount є числом
    const numAmount = Number(amount)
    if (isNaN(numAmount)) return amount.toString()

    // Форматуємо число
    const parts = numAmount.toFixed(settings.decimalPlaces).split('.')

    if (settings.useThousandsSeparator) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const formattedAmount = parts.join('.')

    // Застосовуємо формат
    switch (settings.format) {
      case 'symbol_before':
        return `${currency.symbol}${formattedAmount}`
      case 'symbol_after':
        return `${formattedAmount} ${currency.symbol}`
      case 'code_after':
        return `${formattedAmount} ${currency.code}`
      default:
        return `${currency.symbol}${formattedAmount}`
    }
  }

  // Отримання символу поточної валюти
  const getCurrencySymbol = () => {
    const currency = getCurrencyByCode(currencySettings.value.currency)
    return currency ? currency.symbol : '₴'
  }

  // Отримання коду поточної валюти
  const getCurrencyCode = () => {
    return currencySettings.value.currency
  }

  // Computed для реактивності
  const currentCurrency = computed(() => {
    return getCurrencyByCode(currencySettings.value.currency)
  })

  return {
    currencySettings: computed(() => currencySettings.value),
    currentCurrency,
    loadCurrencySettings,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyCode,
    isLoaded: computed(() => isLoaded.value),
  }
}
