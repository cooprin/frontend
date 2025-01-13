import { createI18n } from 'vue-i18n'
import uk from './uk'
import en from './en'

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('userLanguage') || 'uk',
  fallbackLocale: 'en',
  messages: {
    uk,
    en,
  },
})
