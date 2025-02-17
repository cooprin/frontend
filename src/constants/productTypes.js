export const PRODUCT_TYPE_CODES = [
  { label: 'PC - Personal Computer', value: 'PC', description: 'Desktop computers' },
  { label: 'LT - Laptop', value: 'LT', description: 'Portable computers' },
  { label: 'MN - Monitor', value: 'MN', description: 'Display devices' },
  { label: 'PR - Printer', value: 'PR', description: 'Printing devices' },
  { label: 'KB - Keyboard', value: 'KB', description: 'Input devices - Keyboards' },
  { label: 'MS - Mouse', value: 'MS', description: 'Input devices - Mouse' },
  { label: 'HD - Hard Drive', value: 'HD', description: 'Storage devices' },
  { label: 'RAM - Memory', value: 'RAM', description: 'Memory modules' },
  { label: 'NW - Network', value: 'NW', description: 'Network equipment' },
  { label: 'SW - Software', value: 'SW', description: 'Software licenses' },
  { label: 'UPS - Power Supply', value: 'UPS', description: 'Uninterruptible power supplies' },
  { label: 'PH - Phone', value: 'PH', description: 'Mobile phones and accessories' },
  { label: 'TB - Tablet', value: 'TB', description: 'Tablet computers' },
  { label: 'SR - Server', value: 'SR', description: 'Server hardware' },
]

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

export const CHARACTERISTIC_COLORS = {
  string: 'blue',
  number: 'green',
  date: 'purple',
  boolean: 'orange',
  select: 'red',
}

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

export const COMMON_CHARACTERISTICS = {
  PC: [
    { name: 'Processor', code: 'cpu', type: 'string', is_required: true },
    { name: 'RAM', code: 'ram', type: 'number', is_required: true },
    { name: 'Storage', code: 'storage', type: 'string', is_required: true },
    { name: 'OS', code: 'os', type: 'select', options: ['Windows', 'Linux', 'macOS'] },
  ],
  LT: [
    { name: 'Screen Size', code: 'screen_size', type: 'number', is_required: true },
    { name: 'Processor', code: 'cpu', type: 'string', is_required: true },
    { name: 'RAM', code: 'ram', type: 'number', is_required: true },
    { name: 'Storage', code: 'storage', type: 'string', is_required: true },
  ],
  // Можна додати більше перевизначених характеристик для інших типів
}
