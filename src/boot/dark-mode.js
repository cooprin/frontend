import { Dark } from 'quasar'

export default () => {
  const darkMode = localStorage.getItem('darkMode')
  if (darkMode !== null) {
    Dark.set(darkMode === 'true')
  }
}
