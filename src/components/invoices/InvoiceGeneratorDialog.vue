<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ $t('invoices.generateTitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Рік -->
          <q-select
            v-model="form.year"
            :options="yearOptions"
            :label="$t('invoices.year')"
            :rules="[(val) => !!val || $t('common.validation.required')]"
            outlined
            map-options
            emit-value
          />

          <!-- Місяць -->
          <q-select
            v-model="form.month"
            :options="monthOptions"
            :label="$t('invoices.month')"
            :rules="[(val) => !!val || $t('common.validation.required')]"
            outlined
            map-options
            emit-value
          />

          <!-- Клієнт (опціонально) -->
          <q-select
            v-model="form.clientId"
            :options="clientSearch.filteredOptions.value"
            :label="$t('invoices.client') + ' (' + $t('common.optional') + ')'"
            option-label="label"
            option-value="value"
            outlined
            clearable
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="(val, update) => clientSearch.filterOptions(val, update)"
            @popup-show="clientSearch.resetFilter"
            :loading="loadingClients"
          />
          <!-- Попередження, якщо всі періоди оплачені -->
          <q-banner v-if="showPendingWarning" class="bg-yellow-2 q-my-md">
            <template v-slot:avatar>
              <q-icon name="info" color="warning" />
            </template>
            {{ $t('invoices.allPeriodsAlreadyPaid') }}
          </q-banner>

          <!-- Список неоплачених об'єктів -->
          <div v-if="pendingObjects.length > 0" class="q-my-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('invoices.pendingObjects') }}</div>
            <q-list bordered separator dense>
              <q-item v-for="obj in pendingObjects" :key="obj.id">
                <q-item-section>
                  <q-item-label>{{ obj.name }}</q-item-label>
                  <q-item-label caption>{{ obj.tariff_name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip color="warning" text-color="white" dense>
                    {{ formatCurrency(obj.tariff_price) }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="text-caption q-mb-md">
            {{ $t('invoices.generationInfo') }}
          </div>

          <div class="row justify-end q-gutter-sm">
            <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
            <q-btn
              :label="$t('invoices.generate')"
              color="primary"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { InvoicesApi } from 'src/api/invoices'
import { ClientsApi } from 'src/api/clients'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'
import { useCurrency } from 'src/composables/useCurrency'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'generated'])

const $q = useQuasar()
const { t } = useI18n()
const { formatCurrency: useCurrencyFormatting } = useCurrency()

// State
const loading = ref(false)
const loadingClients = ref(false)
const clientOptions = ref([])
const pendingObjects = ref([])

const checkingPending = ref(false)
const showPendingWarning = ref(false)
// Searchable select for clients
const clientSearch = useSearchableSelect(clientOptions)

// Створюємо масив опцій місяців
const createMonthOptions = (t) => [
  { label: t('invoices.months.1'), value: '1' },
  { label: t('invoices.months.2'), value: '2' },
  { label: t('invoices.months.3'), value: '3' },
  { label: t('invoices.months.4'), value: '4' },
  { label: t('invoices.months.5'), value: '5' },
  { label: t('invoices.months.6'), value: '6' },
  { label: t('invoices.months.7'), value: '7' },
  { label: t('invoices.months.8'), value: '8' },
  { label: t('invoices.months.9'), value: '9' },
  { label: t('invoices.months.10'), value: '10' },
  { label: t('invoices.months.11'), value: '11' },
  { label: t('invoices.months.12'), value: '12' },
]

// Створюємо масив опцій
const monthOptionsArray = createMonthOptions(t)

// Створюємо обчислювану властивість для місячних опцій
const monthOptions = computed(() => monthOptionsArray)

// Метод для перевірки неоплачених періодів
const checkPendingPayments = async () => {
  if (!form.value.clientId || !form.value.year || !form.value.month) {
    return
  }

  checkingPending.value = true
  showPendingWarning.value = false

  try {
    const clientId = form.value.clientId.value || form.value.clientId

    // Переконуємось, що передаємо числові значення або правильно форматовані рядки
    const year = parseInt(form.value.year, 10)
    let month

    if (typeof form.value.month === 'string') {
      month = parseInt(form.value.month, 10)
    } else if (typeof form.value.month === 'number') {
      month = form.value.month
    } else if (form.value.month && form.value.month.value) {
      month = parseInt(form.value.month.value, 10)
    }

    // Якщо не вдалося коректно отримати значення місяця, виходимо
    if (isNaN(month) || month < 1 || month > 12) {
      console.warn('Invalid month value for checkPendingPayments:', form.value.month)
      return
    }

    const response = await InvoicesApi.checkPendingInvoices(clientId, {
      year: year,
      month: month,
    })

    pendingObjects.value = response.data.pendingObjects || []
    showPendingWarning.value = !response.data.hasPendingPayments
  } catch (error) {
    console.error('Error checking pending payments:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    checkingPending.value = false
  }
}

// Отримуємо поточну дату
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1 // JavaScript місяці починаються з 0

// Знаходимо об'єкт місяця для поточного місяця
const currentMonthOption = monthOptionsArray.find((opt) => parseInt(opt.value) === currentMonth)

// Ініціалізуємо форму з правильним місяцем
const form = ref({
  year: currentYear.toString(),
  month: currentMonthOption ? currentMonthOption.value : currentMonth.toString(),
  clientId: null,
})

// Функція для форматування валюти
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return useCurrencyFormatting.formatCurrency(amount)
}

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 1; i <= currentYear + 1; i++) {
    years.push({ label: i.toString(), value: i.toString() })
  }
  return years
})

// Функція для коректної ініціалізації форми при відкритті діалогу
const initializeForm = () => {
  // Переконуємося, що місяць показується як текст, а не цифра
  if (form.value.month) {
    const monthValue =
      typeof form.value.month === 'string' ? parseInt(form.value.month, 10) : form.value.month

    const monthOption = monthOptionsArray.find((opt) => parseInt(opt.value) === monthValue)
    if (monthOption) {
      form.value.month = monthOption.value
    }
  }
}

// Methods
const onSubmit = async () => {
  // Перевіряємо наявність обов'язкових полів
  if (!form.value.year || !form.value.month) {
    $q.notify({
      color: 'negative',
      message: t('common.validation.required'),
      icon: 'error',
    })
    return
  }

  loading.value = true
  try {
    // Гарантуємо, що значення року - це ціле число
    const year = parseInt(form.value.year, 10)

    // Гарантуємо, що значення місяця - це ціле число
    // Спочатку обробляємо випадок, коли місяць вже є числом або рядковим представленням числа
    let month

    // Перетворюємо значення місяця на число, незалежно від типу вхідних даних
    if (typeof form.value.month === 'string') {
      // Якщо це рядок, парсимо його як число
      month = parseInt(form.value.month, 10)
    } else if (typeof form.value.month === 'number') {
      // Якщо це вже число, використовуємо як є
      month = form.value.month
    } else if (typeof form.value.month === 'object' && form.value.month !== null) {
      // Якщо це об'єкт (наприклад, з v-model), спробуємо отримати значення
      month = parseInt(form.value.month.value || form.value.month.toString(), 10)
    } else {
      // Інакше викидаємо помилку
      throw new Error(t('common.errors.invalidMonth'))
    }

    // Перевіряємо правильність отриманих значень
    if (isNaN(year)) {
      throw new Error(t('common.errors.invalidYear'))
    }

    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error(t('common.errors.invalidMonth'))
    }

    // Тепер у нас є правильно перетворені числові значення для запиту
    const requestData = {
      year: year,
      month: month, // Гарантовано є числом від 1 до 12
      use_smart_generation: true,
    }

    console.log('Sending request with data:', requestData)
    // Продовжуємо існуючу логіку
    if (form.value.clientId) {
      const clientId = form.value.clientId.value || form.value.clientId
      console.log('Using client ID:', clientId)

      if (pendingObjects.value.length > 0) {
        // Якщо є неоплачені періоди, використовуємо generateInvoicesForClient
        const response = await InvoicesApi.generateInvoicesForClient(clientId, requestData)
        $q.notify({
          color: 'positive',
          message: t('invoices.generatedSuccess', { count: response.data.invoices.length }),
          icon: 'check',
        })
      } else {
        // Якщо всі періоди оплачені, використовуємо стандартну генерацію
        const response = await InvoicesApi.generateInvoices(requestData)
        $q.notify({
          color: 'positive',
          message: t('invoices.generatedSuccess', { count: response.data.invoices.length }),
          icon: 'check',
        })
      }
    } else {
      // Генерація для всіх клієнтів
      const response = await InvoicesApi.generateInvoices(requestData)
      $q.notify({
        color: 'positive',
        message: t('invoices.generatedSuccess', { count: response.data.invoices.length }),
        icon: 'check',
        timeoutDelay: 3000, // Додатковий час для показу сповіщення
      })
    }

    show.value = false
    emit('generated')
  } catch (error) {
    console.error('Error generating invoices:', error)

    // Розширене логування помилки
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', JSON.stringify(error.response.data))
    }

    // Показуємо відповідне повідомлення про помилку
    let errorMessage = t('common.errors.generating')

    if (error.message === t('common.errors.invalidYear')) {
      errorMessage = t('common.errors.invalidYear')
    } else if (error.message === t('common.errors.invalidMonth')) {
      errorMessage = t('common.errors.invalidMonth')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadClients = async () => {
  loadingClients.value = true
  try {
    const response = await ClientsApi.getClients({ perPage: 'All' })

    clientOptions.value = response.data.clients.map((client) => ({
      label: client.name,
      value: client.id,
    }))
    clientSearch.initializeOptions(clientOptions.value)
  } catch (error) {
    console.error('Error loading clients:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingClients.value = false
  }
}

// Додаємо спостерігач за показом діалогу
watch(
  () => show.value,
  (newVal) => {
    if (newVal === true) {
      // Ініціалізуємо форму при відкритті діалогу
      nextTick(() => {
        initializeForm()
      })
    }
  },
)

watch([() => form.value.clientId, () => form.value.year, () => form.value.month], () => {
  if (form.value.clientId && form.value.year && form.value.month) {
    checkPendingPayments()
  }
})

// Lifecycle
onMounted(() => {
  loadClients()

  // Ініціалізуємо форму після загрузки компонента
  nextTick(() => {
    initializeForm()
  })
})
</script>
