<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ $t('tariffs.assignment.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Відображення інформації про тариф -->
          <div class="text-subtitle1">{{ tariff?.name }}</div>
          <div class="text-caption">{{ formatCurrency(tariff?.price) }}</div>
          <q-separator class="q-my-md" />

          <!-- Вибір об'єкта -->
          <q-select
            v-model="form.object_id"
            :options="objectOptions"
            :label="$t('tariffs.assignment.selectObject')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
            :loading="loadingObjects"
            @update:model-value="onObjectSelected"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.client_name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Інформація про оплачені періоди та рекомендація -->
          <q-banner v-if="paymentInfo.hasPaidPeriods" class="bg-amber-1 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="amber" />
            </template>
            {{ $t('tariffs.assignment.paidPeriodsWarning') }}
            <div v-if="paymentInfo.nextUnpaidPeriod" class="q-mt-sm">
              {{ $t('tariffs.assignment.recommendedDate') }}:
              <strong>{{ formatMonthYear(paymentInfo.nextUnpaidPeriod) }}</strong>
              <q-btn
                flat
                dense
                color="primary"
                :label="$t('tariffs.assignment.useRecommended')"
                @click="useRecommendedDate"
                class="q-ml-sm"
              />
            </div>
          </q-banner>

          <!-- Дата початку дії -->
          <q-input
            v-model="form.effective_from"
            :label="$t('tariffs.assignment.effectiveFrom')"
            outlined
            :rules="[validateEffectiveDate]"
            :class="{ 'bg-amber-1': isDateInPaidPeriod }"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.effective_from" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="OK" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Попередження про заплановану зміну -->
          <q-banner v-if="willBePlanned" class="bg-info-1 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="schedule" color="info" />
            </template>
            {{ $t('tariffs.assignment.willBePlanned') }}
          </q-banner>

          <!-- Примітки -->
          <q-input
            v-model="form.notes"
            :label="$t('tariffs.assignment.notes')"
            type="textarea"
            outlined
            autogrow
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
            <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { TariffsApi } from 'src/api/tariffs'
import { PaymentsApi } from 'src/api/payments'
import { date } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tariff: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingObjects = ref(false)
const objectOptions = ref([])
const paymentInfo = ref({
  hasPaidPeriods: false,
  paidPeriods: [],
  nextUnpaidPeriod: null,
  checkingPayments: false,
})

// Default form
const defaultForm = {
  object_id: null,
  tariff_id: null,
  effective_from: date.formatDate(new Date(), 'YYYY-MM-DD'),
  notes: '',
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Визначаємо, чи вибрана дата знаходиться в оплаченому періоді
const isDateInPaidPeriod = computed(() => {
  if (!paymentInfo.value.paidPeriods || paymentInfo.value.paidPeriods.length === 0) {
    return false
  }

  const selectedDate = new Date(form.value.effective_from)
  const selectedMonth = selectedDate.getMonth() + 1
  const selectedYear = selectedDate.getFullYear()

  return paymentInfo.value.paidPeriods.some(
    (period) => period.billing_year == selectedYear && period.billing_month == selectedMonth,
  )
})

// Визначаємо, чи буде зміна запланована на майбутнє
const willBePlanned = computed(() => {
  if (!form.value.effective_from) return false

  const selectedDate = new Date(form.value.effective_from)
  const today = new Date()

  // видаляємо години, хвилини і секунди для порівняння
  today.setHours(0, 0, 0, 0)

  return selectedDate > today
})

// Methods
const loadObjects = async () => {
  loadingObjects.value = true
  try {
    // Тут буде API запит для отримання об'єктів
    const response = await fetch('/api/wialon-objects')
    const data = await response.json()

    objectOptions.value = data.objects.map((obj) => ({
      label: obj.name,
      value: obj.id,
      client_name: obj.client_name,
    }))

    /* Реальний код буде приблизно такий:
    const response = await WialonApi.getObjects({
      perPage: 'All',
      status: 'active',
    });

    objectOptions.value = response.data.objects.map((obj) => ({
      label: obj.name,
      value: obj.id,
      client_name: obj.client_name,
    }));
    */
  } catch (error) {
    console.error('Error loading objects:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingObjects.value = false
  }
}

const onObjectSelected = async (objectId) => {
  if (!objectId) return

  paymentInfo.value.checkingPayments = true

  try {
    // Отримуємо оплачені періоди
    const periodsResponse = await PaymentsApi.getObjectPaidPeriods(objectId)
    const paidPeriods = periodsResponse.data.periods

    // Отримуємо наступний неоплачений період
    const nextPeriodResponse = await PaymentsApi.getNextUnpaidPeriod(objectId)
    const nextUnpaidPeriod = nextPeriodResponse.data.period

    paymentInfo.value = {
      hasPaidPeriods: paidPeriods && paidPeriods.length > 0,
      paidPeriods: paidPeriods || [],
      nextUnpaidPeriod: nextUnpaidPeriod,
      checkingPayments: false,
    }

    // Якщо є неоплачений період, пропонуємо його використовувати
    if (nextUnpaidPeriod) {
      // Але не змінюємо автоматично дату, тільки пропонуємо
      // Користувач може вибрати кнопку "Використовувати рекомендовану дату"
    }
  } catch (error) {
    console.error('Error checking payment periods:', error)
    paymentInfo.value = {
      hasPaidPeriods: false,
      paidPeriods: [],
      nextUnpaidPeriod: null,
      checkingPayments: false,
    }
  }
}

const useRecommendedDate = () => {
  if (!paymentInfo.value.nextUnpaidPeriod) return

  // Створюємо дату з першого дня неоплаченого місяця
  const year = paymentInfo.value.nextUnpaidPeriod.billing_year
  const month = paymentInfo.value.nextUnpaidPeriod.billing_month - 1 // JavaScript місяці починаються з 0

  const recommendedDate = new Date(year, month, 1)
  form.value.effective_from = date.formatDate(recommendedDate, 'YYYY-MM-DD')
}

const validateEffectiveDate = (val) => {
  if (!val) return t('common.validation.required')

  if (isDateInPaidPeriod.value) {
    return t('tariffs.assignment.dateInPaidPeriod')
  }

  return true
}

const formatMonthYear = (period) => {
  if (!period) return ''

  const monthNames = [
    t('invoices.months.1'),
    t('invoices.months.2'),
    t('invoices.months.3'),
    t('invoices.months.4'),
    t('invoices.months.5'),
    t('invoices.months.6'),
    t('invoices.months.7'),
    t('invoices.months.8'),
    t('invoices.months.9'),
    t('invoices.months.10'),
    t('invoices.months.11'),
    t('invoices.months.12'),
  ]

  const monthIndex = period.billing_month - 1
  return `${monthNames[monthIndex]} ${period.billing_year}`
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const onSubmit = async () => {
  loading.value = true
  try {
    // Підготовка даних для відправки
    const data = {
      object_id: form.value.object_id,
      tariff_id: form.value.tariff_id,
      effective_from: form.value.effective_from,
      notes: form.value.notes,
    }

    // Відправка запиту на призначення тарифу
    await TariffsApi.assignTariffToObject(data)

    $q.notify({
      color: 'positive',
      message: t('tariffs.assignment.assignSuccess'),
      icon: 'check',
    })

    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error assigning tariff:', error)
    const errorMessage = error.response?.data?.message || t('common.errors.saving')

    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Відстеження змін
watch(
  () => props.tariff,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...defaultForm,
        tariff_id: newValue.id,
      }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  loadObjects()
})
</script>
