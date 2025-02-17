// Кольори для типів характеристик (це чисто UI частина)
export const CHARACTERISTIC_COLORS = {
  string: 'blue',
  number: 'green',
  date: 'purple',
  boolean: 'orange',
  select: 'red',
}

// Базові налаштування валідації (шаблони для нових характеристик)
export const DEFAULT_CHARACTERISTIC_VALIDATION = {
  string: {
    minLength: 0,
    maxLength: 255,
    pattern: null,
  },
  number: {
    min: null,
    max: null,
    decimals: 0,
  },
  date: {
    min: null,
    max: null,
    format: 'YYYY-MM-DD',
  },
  boolean: {
    default: false,
  },
  select: {
    multiple: false,
    min: null,
    max: null,
  },
}
