// Валюти що підтримуються системою
export const SUPPORTED_CURRENCIES = [
  {
    code: 'UAH',
    name: 'Ukrainian Hryvnia',
    nameUk: 'Українська гривня',
    symbol: '₴',
    namePlural: 'Ukrainian Hryvnias',
    namePluralUk: 'Українські гривні',
  },
  {
    code: 'USD',
    name: 'US Dollar',
    nameUk: 'Долар США',
    symbol: '$',
    namePlural: 'US Dollars',
    namePluralUk: 'Долари США',
  },
  {
    code: 'EUR',
    name: 'Euro',
    nameUk: 'Євро',
    symbol: '€',
    namePlural: 'Euros',
    namePluralUk: 'Євро',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    nameUk: 'Британський фунт',
    symbol: '£',
    namePlural: 'British Pounds',
    namePluralUk: 'Британські фунти',
  },
  {
    code: 'PLN',
    name: 'Polish Zloty',
    nameUk: 'Польський злотий',
    symbol: 'zł',
    namePlural: 'Polish Zloty',
    namePluralUk: 'Польські злоті',
  },
  {
    code: 'CZK',
    name: 'Czech Koruna',
    nameUk: 'Чеська крона',
    symbol: 'Kč',
    namePlural: 'Czech Korunas',
    namePluralUk: 'Чеські крони',
  },
]

// Формати відображення валюти
export const CURRENCY_FORMATS = {
  SYMBOL_BEFORE: 'symbol_before', // $100
  SYMBOL_AFTER: 'symbol_after', // 100 $
  CODE_AFTER: 'code_after', // 100 USD
}

// Налаштування валюти за замовчуванням
export const DEFAULT_CURRENCY_SETTINGS = {
  currency: 'UAH',
  format: CURRENCY_FORMATS.SYMBOL_BEFORE,
  decimalPlaces: 2,
  useThousandsSeparator: true,
}

// Функція для отримання назви валюти залежно від мови
export const getCurrencyName = (currency, locale = 'en', plural = false) => {
  if (locale === 'uk') {
    return plural ? currency.namePluralUk : currency.nameUk
  }
  return plural ? currency.namePlural : currency.name
}

// Функція для отримання валюти за кодом
export const getCurrencyByCode = (code) => {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)
}
