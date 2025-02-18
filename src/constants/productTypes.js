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
export const CHARACTERISTIC_TYPES = [
  {
    value: 'string',
    label: 'Text',
    description: 'Text values',
    validation: {
      maxLength: 255,
    },
  },
  {
    value: 'number',
    label: 'Number',
    description: 'Numeric values',
    validation: {
      min: 0,
      max: 999999,
    },
  },
  {
    value: 'date',
    label: 'Date',
    description: 'Date values',
    validation: {
      min: '1900-01-01',
      max: '2100-12-31',
    },
  },
  {
    value: 'boolean',
    label: 'Boolean',
    description: 'Yes/No values',
    validation: {
      values: [true, false],
    },
  },
  {
    value: 'select',
    label: 'Select',
    description: 'Selection from predefined options',
    validation: {
      minOptions: 1,
      maxOptions: 50,
    },
  },
]
