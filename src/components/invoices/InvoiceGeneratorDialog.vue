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
          />

          <!-- Місяць -->
          <q-select
            v-model="form.month"
            :options="monthOptions"
            :label="$t('invoices.month')"
            :rules="[(val) => !!val || $t('common.validation.required')]"
            outlined
          />

          <!-- Клієнт (опціонально) -->
          <q-select
            v-model="form.clientId"
            :options="clientOptions"
            :label="$t('invoices.client') + ' (' + $t('common.optional') + ')'"
            option-label="label"
            option-value="value"
            outlined
            clearable
            :loading="loadingClients"
            @filter="filterClients"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { InvoicesApi } from 'src/api/invoices'
import { ClientsApi } from 'src/api/clients'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'generated'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingClients = ref(false)
const clientOptions = ref([])
const pendingObjects = ref([])

const checkingPending = ref(false)
const showPendingWarning = ref(false)

// Метод для перевірки неоплачених періодів
const checkPendingPayments = async () => {
  if (!form.value.clientId || !form.value.year || !form.value.month) {
    return
  }

  checkingPending.value = true
  showPendingWarning.value = false

  try {
    const clientId = form.value.clientId.value || form.value.clientId
    const response = await InvoicesApi.checkPendingInvoices(clientId, {
      year: form.value.year,
      month: form.value.month,
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

// Default form
const currentDate = new Date()
const defaultForm = {
  year: currentDate.getFullYear().toString(),
  month: (currentDate.getMonth() + 1).toString(),
  clientId: null,
}

const form = ref({ ...defaultForm })

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

const monthOptions = computed(() => [
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
])

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
    // Безпечно парсимо значення
    const year = parseInt(form.value.year, 10)
    const month = parseInt(form.value.month, 10)

    // Перевіряємо правильність значень
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      throw new Error(t('common.errors.invalidInput'))
    }

    const requestData = {
      year: year,
      month: month,
      use_smart_generation: true, // Параметр для розумної генерації рахунків
    }

    // Додаємо логування для діагностики
    console.log('Відправляємо запит з даними:', JSON.stringify(requestData))

    // Визначаємо, який метод API потрібно викликати
    let response

    if (form.value.clientId) {
      // Отримуємо правильний ID клієнта
      let clientId

      if (typeof form.value.clientId === 'object' && form.value.clientId !== null) {
        clientId = form.value.clientId.value
      } else {
        clientId = form.value.clientId
      }

      console.log('ID клієнта:', clientId)

      if (!clientId) {
        throw new Error('Невірний ID клієнта')
      }

      // Перевіряємо наявність неоплачених об'єктів
      if (pendingObjects.value && pendingObjects.value.length > 0) {
        console.log('Викликаємо generateInvoicesForClient для клієнта', clientId)
        response = await InvoicesApi.generateInvoicesForClient(clientId, requestData)
      } else {
        console.log('Викликаємо generateInvoices для клієнта', clientId)
        // Додаємо clientId в запит для генерації рахунків тільки для цього клієнта
        response = await InvoicesApi.generateInvoices({
          ...requestData,
          client_id: clientId,
        })
      }
    } else {
      console.log('Викликаємо generateInvoices для всіх клієнтів')
      response = await InvoicesApi.generateInvoices(requestData)
    }

    console.log('Відповідь від сервера:', response)

    $q.notify({
      color: 'positive',
      message: t('invoices.generatedSuccess', { count: response.data.invoices?.length || 0 }),
      icon: 'check',
    })

    show.value = false
    emit('generated')
  } catch (error) {
    console.error('Error generating invoices:', error)
    // Розширене логування помилки
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }

    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.generating'),
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

const filterClients = (val, update) => {
  if (val === '') {
    update(() => {
      // Do nothing, keep full list
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    clientOptions.value = clientOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    )
  })
}
watch([() => form.value.clientId, () => form.value.year, () => form.value.month], () => {
  if (form.value.clientId && form.value.year && form.value.month) {
    checkPendingPayments()
  }
})

// Lifecycle
onMounted(() => {
  loadClients()
})
</script>
