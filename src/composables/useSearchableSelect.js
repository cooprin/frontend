import { ref, computed, watch } from 'vue'

export function useSearchableSelect(originalOptions) {
  const searchText = ref('')
  const filteredOptions = ref([])
  // Автоматично оновлюємо filteredOptions при зміні originalOptions
  watch(
    originalOptions,
    (newOptions) => {
      if (newOptions && newOptions.length > 0) {
        filteredOptions.value = newOptions
      }
    },
    { immediate: true },
  )

  // Ініціалізуємо фільтровані опції
  const initializeOptions = (options) => {
    filteredOptions.value = options || []
  }

  // Фільтруємо опції на основі пошукового тексту
  const filterOptions = (val, update, options = originalOptions.value) => {
    update(() => {
      if (val === '') {
        filteredOptions.value = options
      } else {
        const needle = val.toLowerCase()
        filteredOptions.value = options.filter(
          (option) => option.label.toLowerCase().indexOf(needle) > -1,
        )
      }
    })
  }

  // Скидаємо фільтр при відкритті
  const resetFilter = (options) => {
    const optionsToReset = options || originalOptions.value || []
    filteredOptions.value = optionsToReset
    searchText.value = ''
  }

  // Опції для q-select
  const selectProps = computed(() => ({
    'use-input': true,
    'input-debounce': 300,
    'hide-selected': false,
    'fill-input': false,
    'new-value-mode': 'add-unique',
  }))

  return {
    searchText,
    filteredOptions,
    initializeOptions,
    filterOptions,
    resetFilter,
    selectProps,
  }
}
