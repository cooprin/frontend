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
            :loading="loadingClients"
            :readonly="isEdit"
            @filter="filterClients"
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
                  <q-item-label caption
                    >{{ $t('payments.currentTariff') }}:
                    {{ obj.current_tariff || '-' }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="selectedObjects" :val="obj.id" color="primary" />
                </q-item-section>
                <q-item-section side style="width: 120px">
                  <q-input
                    v-if="selectedObjects.includes(obj.id)"
                    v-model.number="objectAmounts[obj.id]"
                    dense
                    outlined
                    type="number"
                    prefix="₴"
                    :disable="!selectedObjects.includes(obj.id)"
                  />
                </q-item-section>
              </q-item>
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

    // Додаємо інформацію про оплату об'єктів
    if (selectedObjects.value.length > 0) {
      paymentData.object_payments = selectedObjects.value.map((objId) => {
        // Знаходимо об'єкт щоб отримати його тариф
        const obj = clientObjects.value.find((o) => o.id === objId)
        return {
          object_id: objId,
          tariff_id: obj.tariff_id,
          amount: objectAmounts.value[objId] || 0,
          billing_month: new Date(form.value.payment_date).getMonth() + 1,
          billing_year: new Date(form.value.payment_date).getFullYear(),
        }
      })
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
    const response = await ClientsApi.getClient(clientId)
    if (response.data.client && response.data.client.objects) {
      clientObjects.value = response.data.client.objects
        .filter((obj) => obj.status === 'active')
        .map((obj) => {
          // Додаємо початкову суму для кожного об'єкта
          // і перевіряємо наявність tariff_price
          if (obj.tariff_price) {
            objectAmounts.value[obj.id] = parseFloat(obj.tariff_price)
          } else if (obj.current_price) {
            objectAmounts.value[obj.id] = parseFloat(obj.current_price)
          } else {
            objectAmounts.value[obj.id] = 0
          }
          return obj
        })

      // Перевіряємо чи варто показувати розділ з об'єктами
      showObjectPayments.value = clientObjects.value.length > 0
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

const onInvoiceSelected = () => {
  if (form.value.invoice_id) {
    const invoice = invoiceOptions.value.find(
      (i) => i.value === form.value.invoice_id.value || i.value === form.value.invoice_id,
    )
    if (invoice && invoice.amount) {
      form.value.amount = invoice.amount
    }
  }
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

// Відстеження змін клієнта для завантаження рахунків і об'єктів
watch(
  () => form.value.client_id,
  (newValue) => {
    if (newValue) {
      const clientId = newValue.value || newValue
      loadClientInvoices(clientId)
      loadClientObjects(clientId)
    } else {
      invoiceOptions.value = []
      clientObjects.value = []
      showObjectPayments.value = false
    }
  },
)

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
watch(
  selectedObjects,
  (newSelection) => {
    // Перераховувати загальну суму коли обрані об'єкти змінюються
    if (newSelection.length > 0 && !form.value.invoice_id) {
      // Оновлюємо суму лише якщо не вибраний рахунок
      let totalObjectsAmount = 0
      newSelection.forEach((objId) => {
        totalObjectsAmount += objectAmounts.value[objId] || 0
      })
      form.value.amount = totalObjectsAmount
    }
  },
  { deep: true },
)

// Життєвий цикл
onMounted(() => {
  loadClients()
})
</script>
