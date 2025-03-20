<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? $t('payments.edit') : $t('payments.create') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Клієнт -->
          <q-select
            v-model="form.client_id"
            :options="clientOptions"
            :label="$t('payments.client')"
            :rules="[(val) => !!val || $t('common.validation.required')]"
            option-label="label"
            option-value="value"
            outlined
            :readonly="isEdit"
            :loading="loadingClients"
            @filter="filterClients"
            @update:model-value="onClientSelected"
          />

          <!-- Сума платежу -->
          <q-input
            v-model.number="form.amount"
            :label="$t('payments.amount')"
            type="number"
            outlined
            :rules="[
              (val) =>
                (val !== null && val !== undefined && val !== '') ||
                $t('common.validation.required'),
              (val) => val > 0 || $t('common.validation.minValue', { min: 0.01 }),
            ]"
            prefix="₴"
          />

          <!-- Дата платежу -->
          <q-input
            v-model="form.payment_date"
            :label="$t('payments.date')"
            outlined
            :rules="[(val) => !!val || $t('common.validation.required')]"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.payment_date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="OK" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Тип платежу -->
          <q-select
            v-model="form.payment_type"
            :options="paymentTypeOptions"
            :label="$t('payments.type')"
            outlined
            map-options
            emit-value
          />

          <!-- Рахунок -->
          <q-select
            v-if="!isEdit"
            v-model="form.invoice_id"
            :options="invoiceOptions"
            :label="$t('payments.invoice')"
            option-label="label"
            option-value="value"
            outlined
            clearable
            :loading="loadingInvoices"
            @update:model-value="onInvoiceSelected"
          />

          <!-- Об'єкти для оплати -->
          <div v-if="showObjectPayments && clientObjects.length > 0">
            <div class="text-subtitle1 q-mb-sm">{{ $t('payments.objectPayments') }}</div>

            <q-list bordered separator>
              <q-item v-for="obj in clientObjects" :key="obj.id">
                <q-item-section>
                  <q-item-label>{{ obj.name }}</q-item-label>
                  <q-item-label caption>
                    {{ $t('payments.currentTariff') }}:
                    {{ obj.current_tariff_name || '-' }}
                    ({{ formatCurrency(obj.current_tariff_price) || '-' }})
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <!-- Перемикач для вибору об'єкта -->
                  <q-toggle
                    v-model="selectedObjects"
                    :val="obj.id"
                    color="primary"
                    :disable="objectsLocked"
                    @update:model-value="updateTotalAmount"
                  />
                </q-item-section>
                <q-item-section side style="width: 120px">
                  <!-- Поле для введення суми -->
                  <q-input
                    v-if="selectedObjects.includes(obj.id)"
                    v-model.number="objectAmounts[obj.id]"
                    dense
                    outlined
                    type="number"
                    prefix="₴"
                    :disable="objectInputsLocked"
                    @update:model-value="updateTotalAmount"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <!-- Вибір періодів для оплати -->
          <div v-if="selectedObjects.length === 1 && !objectsLocked">
            <q-separator class="q-my-md" />

            <div class="row items-center q-mb-sm">
              <div class="text-subtitle1">{{ $t('payments.periodPayment') }}</div>
              <q-space />
              <q-btn
                flat
                dense
                :icon="showPeriodSelection ? 'expand_less' : 'expand_more'"
                :label="showPeriodSelection ? $t('common.hide') : $t('common.show')"
                @click="togglePeriodSelection"
              />
            </div>

            <q-slide-transition>
              <div v-show="showPeriodSelection">
                <div v-if="loadingPeriods" class="text-center q-py-md">
                  <q-spinner color="primary" size="2em" />
                  <div class="q-mt-sm">{{ $t('common.loading') }}</div>
                </div>

                <div
                  v-else-if="availablePeriods.length === 0"
                  class="text-grey text-center q-py-md"
                >
                  {{ $t('payments.noPeriods') }}
                </div>

                <div v-else>
                  <q-list bordered separator>
                    <q-item
                      v-for="period in availablePeriods"
                      :key="`${period.year}-${period.month}`"
                    >
                      <q-item-section>
                        <q-item-label
                          >{{ $t(`payments.months.${period.month}`) }}
                          {{ period.year }}</q-item-label
                        >
                        <q-item-label caption v-if="period.is_paid" class="text-positive">
                          {{ $t('payments.alreadyPaid') }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <!-- Перемикач для вибору періоду -->
                        <q-toggle
                          v-model="selectedPeriods"
                          :val="`${period.year}-${period.month}`"
                          :disable="period.is_paid"
                          color="primary"
                          @update:model-value="updateTotalFromPeriods"
                        />
                      </q-item-section>

                      <q-item-section side style="width: 120px">
                        <!-- Поле для введення суми -->
                        <q-input
                          v-if="selectedPeriods.includes(`${period.year}-${period.month}`)"
                          v-model.number="periodAmounts[`${period.year}-${period.month}`]"
                          dense
                          outlined
                          type="number"
                          prefix="₴"
                          :disable="period.is_paid"
                          @update:model-value="updateTotalFromPeriods"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-slide-transition>
          </div>

          <!-- Примітки -->
          <q-input
            v-model="form.notes"
            :label="$t('payments.notes')"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { PaymentsApi } from 'src/api/payments'
import { ClientsApi } from 'src/api/clients'
import { InvoicesApi } from 'src/api/invoices'
import { WialonApi } from 'src/api/wialon'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingClients = ref(false)
const loadingInvoices = ref(false)
const loadingObjects = ref(false)
const clientOptions = ref([])
const invoiceOptions = ref([])
const clientObjects = ref([])
const selectedObjects = ref([])
const objectAmounts = ref({})
const showObjectPayments = ref(false)
const objectsLocked = ref(false) // Блокувати вибір об'єктів (якщо рахунок вибраний)
const objectInputsLocked = ref(false) // Блокувати редагування сум (якщо рахунок вибраний)
const availablePeriods = ref([])
const loadingPeriods = ref(false)
const selectedPeriods = ref([])
const showPeriodSelection = ref(false)
const periodAmounts = ref({})

const loadAvailablePeriods = async (objectId) => {
  if (!objectId) return

  loadingPeriods.value = true
  try {
    const response = await PaymentsApi.getAvailablePaymentPeriods(objectId)
    availablePeriods.value = response.data.periods || []

    // Ініціалізуємо суми для кожного періоду
    availablePeriods.value.forEach((period) => {
      // Використовуємо ключ у форматі 'YYYY-MM' для зручності
      const periodKey = `${period.year}-${period.month}`
      periodAmounts.value[periodKey] = period.suggested_amount || 0
    })
  } catch (error) {
    console.error('Error loading available periods:', error)
    availablePeriods.value = []
  } finally {
    loadingPeriods.value = false
  }
}

// Метод для перемикання відображення вибору періодів
const togglePeriodSelection = () => {
  showPeriodSelection.value = !showPeriodSelection.value
  if (showPeriodSelection.value && selectedObjects.value.length === 1) {
    // Завантажуємо доступні періоди тільки для одного вибраного об'єкта
    loadAvailablePeriods(selectedObjects.value[0])
  }
}

// Метод для обчислення загальної суми з вибраних періодів
const calculatePeriodTotal = () => {
  let total = 0
  selectedPeriods.value.forEach((periodKey) => {
    total += periodAmounts.value[periodKey] || 0
  })
  return total
}

// Метод для оновлення загальної суми платежу при зміні вибраних періодів
const updateTotalFromPeriods = () => {
  if (selectedPeriods.value.length > 0) {
    form.value.amount = calculatePeriodTotal()
  }
}

// Default form
const defaultForm = {
  client_id: null,
  amount: null,
  payment_date: new Date().toISOString().slice(0, 10),
  payment_type: 'regular',
  invoice_id: null,
  notes: '',
  object_payments: [],
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)

const paymentTypeOptions = computed(() => [
  { label: t('payments.types.regular'), value: 'regular' },
  { label: t('payments.types.advance'), value: 'advance' },
  { label: t('payments.types.debt'), value: 'debt' },
  { label: t('payments.types.adjustment'), value: 'adjustment' },
])

// Methods
const onSubmit = async () => {
  loading.value = true
  try {
    // Підготовка даних
    const paymentData = {
      client_id: form.value.client_id.value || form.value.client_id,
      amount: form.value.amount,
      payment_date: form.value.payment_date,
      payment_type: form.value.payment_type,
      notes: form.value.notes,
    }

    // Додаємо рахунок, якщо вибрано
    if (form.value.invoice_id) {
      paymentData.invoice_id = form.value.invoice_id.value || form.value.invoice_id
    }

    // Додаємо інформацію про оплату об'єктів, якщо рахунок не вибрано
    if (!form.value.invoice_id) {
      // Платіж за об'єкти
      if (selectedObjects.value.length > 0) {
        paymentData.object_payments = selectedObjects.value.map((objId) => {
          // Знаходимо об'єкт щоб отримати його тариф
          const obj = clientObjects.value.find((o) => o.id === objId)
          return {
            object_id: objId,
            tariff_id: obj.current_tariff_id,
            amount: objectAmounts.value[objId] || obj.current_tariff_price || 0,
            billing_month: new Date(form.value.payment_date).getMonth() + 1,
            billing_year: new Date(form.value.payment_date).getFullYear(),
          }
        })
      }

      // Платіж за періоди
      if (selectedPeriods.value.length > 0 && selectedObjects.value.length === 1) {
        const objectId = selectedObjects.value[0]
        const obj = clientObjects.value.find((o) => o.id === objectId)

        paymentData.period_payments = selectedPeriods.value.map((periodKey) => {
          const [year, month] = periodKey.split('-')
          return {
            object_id: objectId,
            tariff_id: obj.current_tariff_id,
            amount: periodAmounts.value[periodKey] || 0,
            billing_month: parseInt(month),
            billing_year: parseInt(year),
          }
        })
      }
    }

    if (isEdit.value) {
      await PaymentsApi.updatePayment(props.editData.id, paymentData)
      $q.notify({
        color: 'positive',
        message: t('payments.updateSuccess'),
        icon: 'check',
      })
    } else {
      await PaymentsApi.createPayment(paymentData)
      $q.notify({
        color: 'positive',
        message: t('payments.createSuccess'),
        icon: 'check',
      })
    }

    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error saving payment:', error)
    $q.notify({
      color: 'negative',
      message:
        error.response?.data?.message ||
        t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
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

const onClientSelected = async (clientId) => {
  if (!clientId) {
    // Скидаємо дані, якщо клієнт не вибраний
    clientObjects.value = []
    selectedObjects.value = []
    objectAmounts.value = {}
    invoiceOptions.value = []
    form.value.invoice_id = null
    showObjectPayments.value = false

    // Скидаємо дані періодів
    availablePeriods.value = []
    selectedPeriods.value = []
    periodAmounts.value = {}
    showPeriodSelection.value = false
    return
  }

  const actualClientId = clientId.value || clientId

  // Скидаємо вибраний рахунок при зміні клієнта
  form.value.invoice_id = null
  selectedObjects.value = []

  // Скидаємо вибрані періоди
  selectedPeriods.value = []

  // Завантажуємо рахунки клієнта
  await loadClientInvoices(actualClientId)

  // Завантажуємо об'єкти клієнта
  await loadClientObjects(actualClientId)
}
const loadClientInvoices = async (clientId) => {
  if (!clientId) return

  loadingInvoices.value = true
  try {
    const response = await InvoicesApi.getClientInvoices(clientId, {
      perPage: 'All',
      status: 'issued', // Тільки невиставлені рахунки
    })

    invoiceOptions.value = response.data.invoices.map((invoice) => ({
      label: `${invoice.invoice_number} (${t(`invoices.months.${invoice.billing_month}`)} ${invoice.billing_year} - ${formatCurrency(invoice.total_amount)})`,
      value: invoice.id,
      amount: invoice.total_amount,
      billing_month: invoice.billing_month,
      billing_year: invoice.billing_year,
      has_objects: invoice.items_count > 0,
    }))
  } catch (error) {
    console.error('Error loading invoices:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingInvoices.value = false
  }
}

const loadClientObjects = async (clientId) => {
  if (!clientId) return

  loadingObjects.value = true
  try {
    const response = await WialonApi.getObjects({
      client_id: clientId,
      status: 'active',
      perPage: 'All',
    })

    if (response.data.objects && response.data.objects.length > 0) {
      clientObjects.value = response.data.objects.map((obj) => ({
        id: obj.id,
        name: obj.name,
        wialon_id: obj.wialon_id,
        current_tariff_id: obj.tariff_id,
        current_tariff_name: obj.tariff_name,
        current_tariff_price: obj.tariff_price,
      }))

      // Ініціалізуємо суми для об'єктів
      clientObjects.value.forEach((obj) => {
        if (obj.current_tariff_price) {
          objectAmounts.value[obj.id] = parseFloat(obj.current_tariff_price)
        }
      })

      showObjectPayments.value = true
    } else {
      clientObjects.value = []
      showObjectPayments.value = false
    }
  } catch (error) {
    console.error('Error loading client objects:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingObjects.value = false
  }
}

const onInvoiceSelected = async () => {
  if (!form.value.invoice_id) {
    // Якщо рахунок не вибрано, розблокуємо вибір об'єктів і сум
    objectsLocked.value = false
    objectInputsLocked.value = false
    selectedObjects.value = [] // Очищаємо вибрані об'єкти
    updateTotalAmount()
    return
  }

  const invoiceId = form.value.invoice_id.value || form.value.invoice_id

  try {
    // Завантажуємо деталі рахунку незалежно від типу
    const response = await InvoicesApi.getInvoice(invoiceId)
    const invoiceDetails = response.data.invoice

    // Встановлюємо суму з рахунку
    form.value.amount = invoiceDetails.total_amount

    // Очищаємо вибрані об'єкти
    selectedObjects.value = []

    // Перевірка, чи має рахунок позиції
    if (invoiceDetails.items && Array.isArray(invoiceDetails.items)) {
      let hasObjectBasedItems = false

      // Проходимо по кожній позиції рахунку
      for (const item of invoiceDetails.items) {
        // Перевіряємо, чи є метадані об'єктів
        if (item.metadata && item.metadata.objects && Array.isArray(item.metadata.objects)) {
          hasObjectBasedItems = true

          // Для кожного об'єкта в метаданих
          for (const obj of item.metadata.objects) {
            // Знаходимо відповідний об'єкт в clientObjects
            const matchingClientObj = clientObjects.value.find((o) => o.id === obj.id)

            if (matchingClientObj) {
              // Додаємо об'єкт до вибраних, якщо він ще не вибраний
              if (!selectedObjects.value.includes(obj.id)) {
                selectedObjects.value.push(obj.id)
              }

              // Встановлюємо суму для об'єкта
              objectAmounts.value[obj.id] = parseFloat(obj.price)
            }
          }
        }
      }

      // Якщо рахунок містить об'єкти, блокуємо їх редагування
      if (hasObjectBasedItems) {
        objectsLocked.value = true
        objectInputsLocked.value = true
      } else {
        // Якщо рахунок не містить об'єктів (це fixed послуга), просто блокуємо вибір
        objectsLocked.value = true
        objectInputsLocked.value = true
        selectedObjects.value = [] // Очищаємо вибрані об'єкти для рахунків без об'єктів
      }
    }

    // Додамо логування для діагностики
    console.log('Invoice details:', invoiceDetails)
    console.log('Selected objects after processing:', selectedObjects.value)
    console.log('Object amounts after processing:', objectAmounts.value)
  } catch (error) {
    console.error('Error loading invoice details:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

const updateTotalAmount = () => {
  // Якщо рахунок вибрано, не оновлюємо суму вручну
  if (form.value.invoice_id) return

  // Якщо ні, підраховуємо суму з вибраних об'єктів
  let total = 0

  for (const objId of selectedObjects.value) {
    const amount = objectAmounts.value[objId] || 0
    total += parseFloat(amount)
  }

  // Оновлюємо суму форми
  form.value.amount = total
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

// Відстеження змін editData
watch(
  () => props.editData,
  (newValue) => {
    if (newValue) {
      // Конвертуємо дані для редагування
      form.value = {
        ...defaultForm,
        client_id: newValue.client_id,
        amount: newValue.amount,
        payment_date: newValue.payment_date
          ? new Date(newValue.payment_date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        payment_type: newValue.payment_type,
        notes: newValue.notes || '',
      }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)

// Життєвий цикл
onMounted(() => {
  loadClients()
})
</script>
