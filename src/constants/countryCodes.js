export const countryCodes = [
  { code: '+380', country: 'Ukraine (Україна)', format: '(##) ###-##-##', mask: '(##) ###-####' },
  { code: '+1', country: 'USA/Canada', format: '(###) ###-####', mask: '(###) ###-####' },
  { code: '+44', country: 'United Kingdom', format: '## #### ####', mask: '### ### ####' },
  { code: '+48', country: 'Poland (Polska)', format: '### ### ###', mask: '### ### ###' },
  {
    code: '+49',
    country: 'Germany (Deutschland)',
    format: '### ##########',
    mask: '### #########',
  },
  // Можна додати більше країн за потреби
]

export const getPhoneWithoutCode = (phone) => {
  if (!phone) return ''
  // Видаляємо код країни та все, крім цифр
  return phone.replace(/^\+\d+\s*/, '').replace(/\D/g, '')
}

export const formatPhoneWithCode = (phone, countryCode) => {
  if (!phone || !countryCode) return ''
  return `${countryCode} ${phone}`
}
