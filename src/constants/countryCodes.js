export const countryCodes = [
  // Europe
  { code: '+380', country: 'Ukraine (Україна)', mask: '(##) ###-##-##' },
  { code: '+44', country: 'United Kingdom', mask: '#### ### ####' },
  { code: '+49', country: 'Germany (Deutschland)', mask: '### #########' },
  { code: '+33', country: 'France', mask: '# ## ## ## ##' },
  { code: '+39', country: 'Italy', mask: '### ### ####' },
  { code: '+34', country: 'Spain', mask: '### ### ###' },
  { code: '+48', country: 'Poland (Polska)', mask: '### ### ###' },
  { code: '+40', country: 'Romania', mask: '### ### ###' },
  { code: '+31', country: 'Netherlands', mask: '# ## ## ## ##' },
  { code: '+32', country: 'Belgium', mask: '### ### ###' },
  { code: '+30', country: 'Greece', mask: '### ### ####' },
  { code: '+420', country: 'Czech Republic', mask: '### ### ###' },
  { code: '+351', country: 'Portugal', mask: '### ### ###' },
  { code: '+46', country: 'Sweden', mask: '## ### ####' },
  { code: '+36', country: 'Hungary', mask: '## ### ####' },
  { code: '+43', country: 'Austria', mask: '### ### ####' },
  { code: '+41', country: 'Switzerland', mask: '## ### ####' },
  { code: '+45', country: 'Denmark', mask: '## ## ## ##' },
  { code: '+358', country: 'Finland', mask: '## ### ####' },
  { code: '+421', country: 'Slovakia', mask: '### ### ###' },
  { code: '+47', country: 'Norway', mask: '### ## ###' },
  { code: '+353', country: 'Ireland', mask: '## ### ####' },
  { code: '+354', country: 'Iceland', mask: '### ####' },

  // North America
  { code: '+1', country: 'USA', mask: '(###) ###-####' },
  { code: '+1', country: 'Canada', mask: '(###) ###-####' },
  { code: '+52', country: 'Mexico', mask: '(###) ###-####' },

  // South America
  { code: '+55', country: 'Brazil', mask: '(##) #####-####' },
  { code: '+54', country: 'Argentina', mask: '(##) ####-####' },
  { code: '+57', country: 'Colombia', mask: '(###) ###-####' },
  { code: '+56', country: 'Chile', mask: '# #### ####' },
  { code: '+51', country: 'Peru', mask: '### ### ###' },
  { code: '+58', country: 'Venezuela', mask: '(###) ###-####' },
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
