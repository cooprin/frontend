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

          <!-- Об'єкти для оплати з періодами -->
          <div v-if="showObjectPayments && clientObjects.length > 0 && !form.invoice_id">
            <div class="text-subtitle1 q-mb-sm">{{ $t('payments.objectPayments') }}</div>

            <q-list bordered separator>
              <template v-for="obj in clientObjects" :key="obj.id">
                <!-- Заголовок для об'єкта -->
                <q-item>
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
                      @update:model-value="onObjectToggle(obj.id)"
                    />
                  </q-item-section>
                </q-item>

                <!-- Неоплачені періоди для об'єкта -->
                <q-expansion-item
                  v-if="selectedObjects.includes(obj.id)"
                  :label="$t('payments.unpaidPeriods')"
                  :default-opened="true"
                  dense
                  header-class="bg-grey-2"
                >
                  <q-card v-if="objectPeriodsMap[obj.id]">
                    <q-card-section v-if="loadingObjectPeriods[obj.id]" class="text-center">
                      <q-spinner color="primary" size="2em" />
                      <div class="q-mt-sm">{{ $t('common.loading') }}</div>
                    </q-card-section>

                    <q-card-section
                      v-else-if="objectPeriodsMap[obj.id] && objectPeriodsMap[obj.id].length === 0"
                      class="text-orange text-center"
                    >
                      {{ $t('payments.allPeriodsHaveInvoices') }}
                    </q-card-section>

                    <q-card-section
                      v-else-if="!objectPeriodsMap[obj.id].length"
                      class="text-grey text-center"
                    >
                      {{ $t('payments.noPeriods') }}
                    </q-card-section>

                    <q-card-section v-else>
                      <q-list separator>
                        <q-item
                          v-for="period in objectPeriodsMap[obj.id]"
                          :key="`${obj.id}-${period.billing_year}-${period.billing_month}`"
                        >
                          <q-item-section>
                            <q-item-label
                              >{{ $t(`payments.months.${period.billing_month}`) }}
                              {{ period.billing_year }}</q-item-label
                            >
                          </q-item-section>
                          <q-item-section side>
                            <q-checkbox
                              v-model="selectedPeriodsByObject[obj.id]"
                              :val="`${period.billing_year}-${period.billing_month}`"
                              color="primary"
                              @update:model-value="updateTotalFromSelectedPeriods"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </template>
            </q-list>
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
import { TariffsApi } from 'src/api/tariffs'

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

// Додаткові стани для роботи з періодами для кожного об'єкта
const objectPeriodsMap = ref({}) // Періоди для кожного об'єкта
const loadingObjectPeriods = ref({}) // Стан завантаження для кожного об'єкта
const selectedPeriodsByObject = ref({}) // Вибрані періоди для кожного об'єкта

const isValidUUID = (str) => {
  // Регулярний вираз для перевірки UUID формату
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return str && typeof str === 'string' && uuidRegex.test(str)
}

// Функція для обробки вибору об'єкта
const onObjectToggle = async (objectId) => {
  // Якщо об'єкт тільки що вибрали
  if (selectedObjects.value.includes(objectId)) {
    // Ініціалізуємо масив для вибраних періодів цього об'єкта
    if (!selectedPeriodsByObject.value[objectId]) {
      selectedPeriodsByObject.value[objectId] = []
    }

    // Завантажуємо неоплачені періоди для об'єкта
    await loadPeriodsForObject(objectId)
  } else {
    // Якщо об'єкт більше не вибраний, очищаємо вибрані періоди
    selectedPeriodsByObject.value[objectId] = []
    updateTotalFromSelectedPeriods()
  }
}

// Функція для завантаження періодів для конкретного об'єкта
const loadPeriodsForObject = async (objectId) => {
  if (!objectId) return

  // Встановлюємо прапорець завантаження
  loadingObjectPeriods.value[objectId] = true

  try {
    // Завантажуємо інформацію про дату призначення об'єкта клієнту
    const ownershipResponse = await WialonApi.getObjectOwnership(objectId)
    const ownershipStartDate = ownershipResponse.data.start_date
      ? new Date(ownershipResponse.data.start_date)
      : null

    // Завантажуємо тарифну історію об'єкта
    const tariffHistoryResponse = await TariffsApi.getObjectTariffHistory(objectId)
    const tariffHistory = tariffHistoryResponse.data.history || []

    // Завантажуємо всі зроблені платежі для об'єкта
    const paymentsResponse = await PaymentsApi.getObjectPayments(objectId)
    const existingPayments = paymentsResponse.data.payments || []

    // Визначаємо початкову дату для аналізу (дата придбання або першого тарифу)
    const firstTariffDate =
      tariffHistory.length > 0
        ? new Date(tariffHistory[tariffHistory.length - 1].effective_from)
        : null

    let startDate = ownershipStartDate
    if (!startDate || (firstTariffDate && firstTariffDate > startDate)) {
      startDate = firstTariffDate
    }

    // Якщо немає дати початку, використовуємо поточну дату
    if (!startDate) {
      startDate = new Date()
    }

    // Обчислюємо всі місяці від дати початку до поточного місяця
    const currentDate = new Date()
    const allPeriods = []

    // Клонуємо дату початку, щоб не змінити оригінал
    const iterDate = new Date(startDate)
    // Встановлюємо на перше число місяця
    iterDate.setDate(1)

    // Перебираємо всі місяці від дати початку до поточного
    while (
      iterDate.getFullYear() < currentDate.getFullYear() ||
      (iterDate.getFullYear() === currentDate.getFullYear() &&
        iterDate.getMonth() <= currentDate.getMonth())
    ) {
      const year = iterDate.getFullYear()
      const month = iterDate.getMonth() + 1 // JavaScript місяці починаються з 0

      // Знаходимо тариф, який був активний у цей період
      const activeTariff = tariffHistory.find((t) => {
        const effectiveFrom = new Date(t.effective_from)
        const effectiveTo = t.effective_to ? new Date(t.effective_to) : new Date()

        // Перше число поточного місяця
        const periodStart = new Date(year, month - 1, 1)
        // Перевіряємо, чи тариф був активний у цей період
        return effectiveFrom <= periodStart && periodStart <= effectiveTo
      })

      // Перевіряємо, чи цей період вже оплачений
      const isPaid = existingPayments.some(
        (payment) => payment.billing_year === year && payment.billing_month === month,
      )

      // Додаємо період до списку, якщо є активний тариф і об'єкт був активний
      if (activeTariff) {
        allPeriods.push({
          billing_year: year,
          billing_month: month,
          is_paid: isPaid,
          tariff_id: activeTariff.tariff_id,
          tariff_name: activeTariff.tariff_name,
          price: activeTariff.price,
        })
      }

      // Переходимо до наступного місяця
      iterDate.setMonth(iterDate.getMonth() + 1)
    }

    // Фільтруємо неоплачені періоди
    let unpaidPeriods = allPeriods.filter((period) => !period.is_paid)

    // Додаємо запит для перевірки рахунків за періоди
    const invoiceCheckPromises = unpaidPeriods.map(async (period) => {
      try {
        // Додаємо запит до API для перевірки наявності рахунку за період
        const invoiceResponse = await InvoicesApi.checkInvoiceExistence(
          objectId,
          period.billing_year,
          period.billing_month,
        )

        // Додаємо інформацію про рахунок до періоду
        period.has_invoice = invoiceResponse.data.exists
        period.invoice_number = invoiceResponse.data.invoice_number || null

        return period
      } catch (error) {
        console.error(
          `Error checking invoice for period ${period.billing_year}-${period.billing_month}:`,
          error,
        )
        period.has_invoice = false
        return period
      }
    })

    // Чекаємо завершення всіх перевірок
    unpaidPeriods = await Promise.all(invoiceCheckPromises)

    // Фільтруємо періоди, виключаючи ті, для яких вже є рахунки
    unpaidPeriods = unpaidPeriods.filter((period) => !period.has_invoice)

    // Зберігаємо періоди для об'єкта
    objectPeriodsMap.value[objectId] = unpaidPeriods

    // Якщо є неоплачені періоди, автоматично вибираємо перший
    if (unpaidPeriods.length > 0) {
      const firstPeriod = unpaidPeriods[0]
      const periodKey = `${firstPeriod.billing_year}-${firstPeriod.billing_month}`

      // Переконуємося, що масив існує
      if (!selectedPeriodsByObject.value[objectId]) {
        selectedPeriodsByObject.value[objectId] = []
      }

      // Додаємо перший період до вибраних, якщо він ще не вибраний
      if (!selectedPeriodsByObject.value[objectId].includes(periodKey)) {
        selectedPeriodsByObject.value[objectId].push(periodKey)
      }

      // Зберігаємо ціну для цього періоду у локальному кеші
      objectAmounts.value[objectId] = parseFloat(firstPeriod.price) || 0

      // Оновлюємо загальну суму
      updateTotalFromSelectedPeriods()
    }
  } catch (error) {
    console.error(`Error loading periods for object ${objectId}:`, error)
    objectPeriodsMap.value[objectId] = []
  } finally {
    loadingObjectPeriods.value[objectId] = false
  }
}

// Функція для оновлення загальної суми на основі вибраних періодів
const updateTotalFromSelectedPeriods = () => {
  let totalSum = 0

  // Проходимо по всіх вибраних об'єктах
  for (const objId of selectedObjects.value) {
    // Отримуємо об'єкт і його тариф
    const obj = clientObjects.value.find((o) => o.id === objId)
    const tariffPrice = obj ? parseFloat(obj.current_tariff_price) || 0 : 0

    // Якщо є вибрані періоди для цього об'єкта
    if (selectedPeriodsByObject.value[objId] && selectedPeriodsByObject.value[objId].length > 0) {
      // Додаємо тариф за кожен вибраний період
      totalSum += selectedPeriodsByObject.value[objId].length * tariffPrice
    }
  }

  // Оновлюємо загальну суму
  form.value.amount = totalSum
}

const loadAvailablePeriods = async (objectId) => {
  if (!objectId) return

  loadingPeriods.value = true
  try {
    const response = await PaymentsApi.getAvailablePaymentPeriods(objectId)
    availablePeriods.value = response.data.periods || []

    // Очищаємо вибрані періоди
    selectedPeriods.value = []
    periodAmounts.value = {}

    if (availablePeriods.value.length > 0) {
      // Знаходимо перший неоплачений період
      const firstUnpaidPeriod = availablePeriods.value.find((period) => !period.is_paid)

      if (firstUnpaidPeriod) {
        // Формуємо ключ для періоду у форматі "YYYY-MM"
        const periodKey = `${firstUnpaidPeriod.billing_year}-${firstUnpaidPeriod.billing_month}`

        // Автоматично вибираємо перший неоплачений період
        selectedPeriods.value.push(periodKey)

        // Встановлюємо суму для періоду
        periodAmounts.value[periodKey] = parseFloat(firstUnpaidPeriod.price) || 0

        // Оновлюємо загальну суму форми
        updateTotalFromPeriods()
      }
    }
  } catch (error) {
    console.error('Error loading available periods:', error)
    availablePeriods.value = []
  } finally {
    loadingPeriods.value = false
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
    } else if (selectedObjects.value.length > 0) {
      // Прямі оплати за об'єкти без рахунку
      paymentData.object_payments = []

      // Для кожного вибраного об'єкта
      for (const objId of selectedObjects.value) {
        const obj = clientObjects.value.find((o) => o.id === objId)

        // Пропускаємо об'єкти з невалідними тарифами
        if (!obj || !isValidUUID(obj.current_tariff_id)) {
          console.warn(
            `Пропускаємо платіж для об'єкта ${obj?.name || objId} - невалідний або відсутній tariff_id`,
          )
          $q.notify({
            color: 'warning',
            message: t('payments.invalidTariff', { name: obj?.name || objId }),
            icon: 'warning',
          })
          continue
        }

        // Якщо є вибрані періоди для цього об'єкта
        if (
          selectedPeriodsByObject.value[objId] &&
          selectedPeriodsByObject.value[objId].length > 0
        ) {
          // Для кожного вибраного періоду створюємо запис оплати
          for (const periodKey of selectedPeriodsByObject.value[objId]) {
            const [year, month] = periodKey.split('-')

            paymentData.object_payments.push({
              object_id: objId,
              tariff_id: obj.current_tariff_id,
              amount: parseFloat(obj.current_tariff_price) || 0,
              billing_month: parseInt(month),
              billing_year: parseInt(year),
            })
          }
        }
      }

      // Перевіряємо, чи є хоч один валідний платіж
      if (paymentData.object_payments.length === 0) {
        $q.notify({
          color: 'negative',
          message: t('payments.noValidPayments'),
          icon: 'error',
        })
        loading.value = false
        return
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

    // Очищаємо дані про періоди
    objectPeriodsMap.value = {}
    selectedPeriodsByObject.value = {}
    loadingObjectPeriods.value = {}

    return
  }

  const actualClientId = clientId.value || clientId

  // Скидаємо вибраний рахунок при зміні клієнта
  form.value.invoice_id = null
  selectedObjects.value = []

  // Очищаємо дані про періоди
  objectPeriodsMap.value = {}
  selectedPeriodsByObject.value = {}
  loadingObjectPeriods.value = {}

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
        // Перевіряємо, чи tariff_id є валідним UUID
        current_tariff_id: isValidUUID(obj.tariff_id) ? obj.tariff_id : null,
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

  // Якщо вибрано один об'єкт, показуємо секцію вибору періодів
  if (selectedObjects.value.length === 1) {
    // Завантажуємо доступні періоди для об'єкта
    loadAvailablePeriods(selectedObjects.value[0])
    showPeriodSelection.value = true
  } else {
    showPeriodSelection.value = false
  }
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
