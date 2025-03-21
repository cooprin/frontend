<template>
  <div>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center">
          <div class="text-h6">{{ $t('payments.objectHistory') }}</div>
          <q-space />
          <q-btn
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
            flat
            color="primary"
            @click="showFilters = !showFilters"
          />
        </div>

        <q-slide-transition>
          <div v-show="showFilters" class="q-mt-md">
            <div class="row q-col-gutter-sm">
              <!-- Рік -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="filters.year"
                  :options="yearOptions"
                  :label="$t('payments.filters.year')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Місяць -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="filters.month"
                  :options="monthOptions"
                  :label="$t('payments.filters.month')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>

      <q-card-section>
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-sm">{{ $t('common.loading') }}</div>
        </div>

        <div v-else-if="payments.length === 0" class="text-center q-pa-md text-grey">
          {{ $t('payments.noPayments') }}
        </div>

        <q-table
          v-else
          :rows="payments"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 0 }"
          flat
          bordered
        >
          <!-- Слот для дати платежу -->
          <template v-slot:body-cell-payment_date="props">
            <q-td :props="props">
              {{ formatDate(props.row.payment_date) }}
            </q-td>
          </template>

          <!-- Слот для періоду -->
          <template v-slot:body-cell-billing_period="props">
            <q-td :props="props">
              {{ $t(`payments.months.${props.row.billing_month}`) }}
              {{ props.row.billing_year }}
            </q-td>
          </template>

          <!-- Слот для суми -->
          <template v-slot:body-cell-amount="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.amount) }}
            </q-td>
          </template>

          <!-- Слот для тарифу -->
          <template v-slot:body-cell-tariff="props">
            <q-td :props="props">
              <div>{{ props.row.tariff_name }}</div>
              <div class="text-caption">{{ formatCurrency(props.row.tariff_price) }}</div>
            </q-td>
          </template>

          <!-- Слот для типу платежу -->
          <template v-slot:body-cell-payment_type="props">
            <q-td :props="props">
              <q-chip :color="getPaymentTypeColor(props.row.payment_type)" text-color="white" dense>
                {{ $t(`payments.types.${props.row.payment_type}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для статусу -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="getPaymentStatusColor(props.row.status)" text-color="white" dense>
                {{ $t(`payments.statuses.${props.row.status}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для дій -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                @click="openPaymentDetails(props.row)"
              >
                <q-tooltip>{{ $t('common.view') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Зведена статистика платежів за об'єктом -->
    <q-card flat bordered class="q-mt-md" v-if="objectInfo">
      <q-card-section>
        <div class="text-h6">{{ $t('payments.statistics.objectSummary') }}</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Загальна сума оплат - виправлений розрахунок -->
          <div class="col-12 col-sm-4">
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('payments.statistics.totalPaid') }}</q-item-label>
                <q-item-label class="text-h5 text-primary">
                  {{ formatCurrency(calculateTotalPaid()) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- Кількість платежів -->
          <div class="col-12 col-sm-4">
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('payments.statistics.paymentsCount') }}</q-item-label>
                <q-item-label class="text-h5 text-secondary">
                  {{ payments.length }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- Поточний тариф -->
          <div class="col-12 col-sm-4">
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('payments.statistics.currentTariff') }}</q-item-label>
                <q-item-label class="text-h5 text-accent">
                  {{ objectInfo.current_price ? formatCurrency(objectInfo.current_price) : '-' }}
                </q-item-label>
                <q-item-label caption v-if="objectInfo.current_tariff">
                  {{ objectInfo.current_tariff }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Оплачені періоди - групування по роках -->
    <q-card
      flat
      bordered
      class="q-mt-md"
      v-if="groupedPaidPeriods && Object.keys(groupedPaidPeriods).length > 0"
    >
      <q-card-section>
        <div class="text-h6">{{ $t('payments.paidPeriods') }}</div>
      </q-card-section>
      <q-card-section>
        <div v-for="(periods, year) in groupedPaidPeriods" :key="year" class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">{{ year }}</div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="period in periods"
              :key="`${period.billing_year}-${period.billing_month}`"
              class="col-6 col-sm-4 col-md-2"
            >
              <q-chip
                color="positive"
                text-color="white"
                icon="check_circle"
                class="full-width justify-center"
              >
                {{ $t(`payments.months.${period.billing_month}`) }}
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Наступний неоплачений період -->
    <q-card flat bordered class="q-mt-md" v-if="nextUnpaidPeriod">
      <q-card-section>
        <div class="text-h6">{{ $t('payments.nextUnpaidPeriod') }}</div>
      </q-card-section>
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <q-chip color="warning" text-color="white" icon="warning" outline class="q-pa-md">
              {{ $t(`payments.months.${nextUnpaidPeriod.billing_month}`) }}
              {{ nextUnpaidPeriod.billing_year }}
            </q-chip>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="payment"
              :label="$t('payments.payNow')"
              @click="openPayPeriodDialog(nextUnpaidPeriod)"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Діалог оплати періоду -->
    <q-dialog v-model="showPayPeriodDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('payments.payPeriod') }}</div>
        </q-card-section>
        <q-card-section v-if="selectedPeriodForPayment">
          <p>{{ $t('payments.payPeriodConfirmation') }}</p>
          <q-chip color="warning" text-color="white" class="q-ma-md">
            {{ $t(`payments.months.${selectedPeriodForPayment.billing_month}`) }}
            {{ selectedPeriodForPayment.billing_year }}
          </q-chip>
          <p v-if="objectInfo && objectInfo.current_tariff">
            {{ $t('payments.tariffInfo') }}: {{ objectInfo.current_tariff }} ({{
              formatCurrency(objectInfo.current_price)
            }})
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            :label="$t('payments.pay')"
            color="positive"
            @click="createPeriodPayment"
            :loading="processingPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PaymentsApi } from 'src/api/payments'
import { useQuasar } from 'quasar'

const props = defineProps({
  objectId: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

// State
const loading = ref(false)
const payments = ref([])
const objectInfo = ref(null)
const showFilters = ref(false)
const totalItems = ref(0)
const paidPeriods = ref([])
const nextUnpaidPeriod = ref(null)
const loadingPeriods = ref(false)
const showPayPeriodDialog = ref(false)
const selectedPeriodForPayment = ref(null)
const processingPayment = ref(false)

// Метод для правильного розрахунку загальної суми
const calculateTotalPaid = () => {
  return payments.value.reduce((total, payment) => {
    // Переконуємося, що значення є числом
    const amount = parseFloat(payment.amount)
    if (!isNaN(amount)) {
      return total + amount
    }
    return total
  }, 0)
}

// Групування оплачених періодів по роках
const groupedPaidPeriods = computed(() => {
  const grouped = {}
  if (!paidPeriods.value || paidPeriods.value.length === 0) return null

  paidPeriods.value.forEach((period) => {
    if (!grouped[period.billing_year]) {
      grouped[period.billing_year] = []
    }
    grouped[period.billing_year].push(period)
  })

  // Сортуємо роки від найновіших до найстаріших
  return Object.fromEntries(Object.entries(grouped).sort((a, b) => b[0] - a[0]))
})

// Додати метод для створення оплати за період
const createPeriodPayment = async () => {
  if (!selectedPeriodForPayment.value || !objectInfo.value) return

  processingPayment.value = true

  try {
    // Перевіряємо наявність всіх необхідних даних
    if (!objectInfo.value.client_id) {
      throw new Error('Не вдалося отримати ID клієнта')
    }

    if (!objectInfo.value.current_price) {
      throw new Error('Не вдалося отримати ціну тарифу')
    }

    const paymentData = {
      object_id: props.objectId,
      client_id: objectInfo.value.client_id,
      billing_month: selectedPeriodForPayment.value.billing_month,
      billing_year: selectedPeriodForPayment.value.billing_year,
      amount: objectInfo.value.current_price || 0,
      payment_type: 'regular',
      payment_date: new Date().toISOString().slice(0, 10),
    }

    await PaymentsApi.createPeriodPayment(paymentData)

    showPayPeriodDialog.value = false

    $q.notify({
      color: 'positive',
      message: t('payments.periodPaymentSuccess'),
      icon: 'check',
    })

    // Перезавантажуємо дані після успішної оплати
    await loadPaymentHistory()
  } catch (error) {
    console.error('Error creating period payment:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    processingPayment.value = false
  }
}

const loadPaidPeriods = async () => {
  if (!props.objectId) return

  loadingPeriods.value = true
  try {
    // Отримання оплачених періодів
    const periodsResponse = await PaymentsApi.getObjectPaidPeriods(props.objectId)
    paidPeriods.value = periodsResponse.data.periods || []

    // Отримання наступного неоплаченого періоду
    const nextPeriodResponse = await PaymentsApi.getNextUnpaidPeriod(props.objectId)

    // Перевіряємо, чи отримали валідні дані
    if (
      nextPeriodResponse.data &&
      nextPeriodResponse.data.period &&
      nextPeriodResponse.data.period.billing_year &&
      nextPeriodResponse.data.period.billing_month
    ) {
      nextUnpaidPeriod.value = nextPeriodResponse.data.period
    } else {
      console.warn(
        'Отримано неповні дані про наступний неоплачений період:',
        nextPeriodResponse.data,
      )
      nextUnpaidPeriod.value = null
    }
  } catch (error) {
    console.error('Error loading paid periods:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingPeriods.value = false
  }
}

// Додати метод для відкриття діалогу оплати періоду
const openPayPeriodDialog = (period) => {
  if (!period || !period.billing_year || !period.billing_month) {
    console.error('Некоректний період для оплати:', period)
    $q.notify({
      color: 'negative',
      message: t('payments.invalidPeriod'),
      icon: 'error',
    })
    return
  }

  selectedPeriodForPayment.value = period
  showPayPeriodDialog.value = true
}

// Фільтри
const filters = ref({
  year: null,
  month: null,
})

// Опції
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 3; i <= currentYear; i++) {
    years.push({ label: i.toString(), value: i.toString() })
  }
  return years
})

const monthOptions = computed(() => [
  { label: t('payments.months.1'), value: '1' },
  { label: t('payments.months.2'), value: '2' },
  { label: t('payments.months.3'), value: '3' },
  { label: t('payments.months.4'), value: '4' },
  { label: t('payments.months.5'), value: '5' },
  { label: t('payments.months.6'), value: '6' },
  { label: t('payments.months.7'), value: '7' },
  { label: t('payments.months.8'), value: '8' },
  { label: t('payments.months.9'), value: '9' },
  { label: t('payments.months.10'), value: '10' },
  { label: t('payments.months.11'), value: '11' },
  { label: t('payments.months.12'), value: '12' },
])

// Columns
const columns = computed(() => [
  {
    name: 'payment_date',
    required: true,
    label: t('payments.date'),
    align: 'left',
    field: 'payment_date',
    sortable: true,
  },
  {
    name: 'billing_period',
    label: t('payments.billingPeriod'),
    align: 'left',
    field: (row) => `${row.billing_month}-${row.billing_year}`,
    sortable: true,
  },
  {
    name: 'amount',
    label: t('payments.amount'),
    align: 'right',
    field: 'amount',
    sortable: true,
  },
  {
    name: 'tariff',
    label: t('payments.tariff'),
    align: 'left',
    field: 'tariff_name',
    sortable: true,
  },
  {
    name: 'payment_type',
    label: t('payments.type'),
    align: 'center',
    field: 'payment_type',
    sortable: true,
  },
  {
    name: 'status',
    label: t('payments.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    sortable: false,
  },
])

// Methods
const loadPaymentHistory = async () => {
  if (!props.objectId) return

  loading.value = true
  try {
    const params = {
      perPage: 'All',
      year: filters.value.year,
      month: filters.value.month,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await PaymentsApi.getObjectPaymentHistory(props.objectId, params)
    payments.value = response.data.payments || []
    objectInfo.value = response.data.object || null
    totalItems.value = response.data.total || 0

    // Завантажуємо оплачені періоди та наступний неоплачений період
    await loadPaidPeriods()
  } catch (error) {
    console.error('Error loading payment history:', error)
    payments.value = []
    objectInfo.value = null
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    year: null,
    month: null,
  }
}

const openPaymentDetails = (payment) => {
  if (!payment || !payment.payment_id) {
    console.error('Неможливо відкрити деталі платежу - відсутній ID платежу:', payment)
    return
  }
  router.push({ name: 'payment-details', params: { id: payment.payment_id } })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA')
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const getPaymentTypeColor = (type) => {
  const colors = {
    regular: 'primary',
    advance: 'positive',
    debt: 'warning',
    adjustment: 'purple',
  }
  return colors[type] || 'grey'
}

const getPaymentStatusColor = (status) => {
  const colors = {
    paid: 'positive',
    partial: 'warning',
    pending: 'info',
    overdue: 'negative',
  }
  return colors[status] || 'grey'
}

// Watchers
watch(
  filters,
  () => {
    loadPaymentHistory()
  },
  { deep: true },
)

watch(
  () => props.objectId,
  (newValue) => {
    if (newValue) {
      loadPaymentHistory()
    }
  },
)

// Життєвий цикл
onMounted(() => {
  if (props.objectId) {
    loadPaymentHistory()
  }
})
</script>
