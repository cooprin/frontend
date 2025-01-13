import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    message: {
      hello: 'Hello',
      welcome: 'Welcome',
    },
  },
  uk: {
    message: {
      hello: 'Привіт',
      welcome: 'Ласкаво просимо',
    },
  },
}

export default createI18n({
  legacy: false,
  locale: 'uk',
  fallbackLocale: 'en',
  messages,
})
