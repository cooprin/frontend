<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('invoices.editTitle') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Номер рахунку -->
          <q-input
            v-model="form.invoice_number"
            :label="$t('invoices.invoiceNumber')"
            :rules="[
              (val) => !!val || t('common.validation.required'),
              (val) => val.length >= 3 || t('common.validation.minLength', { min: 3 }),
            ]"
            outlined
            :error="!!errors.invoice_number"
            :error-message="errors.invoice_number"
            @input="clearError('invoice_number')"
          />

          <!-- Дата рахунку -->
          <q-input
            v-model="form.invoice_date"
            :label="$t('invoices.invoiceDate')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.invoice_date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="OK" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Розрахунковий період - місяць -->
          <q-select
            v-model="form.billing_month"
            :options="monthOptions"
            :label="$t('invoices.billingMonth')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
          />

          <!-- Розрахунковий період - рік -->
          <q-select
            v-model="form.billing_year"
            :options="yearOptions"
            :label="$t('invoices.billingYear')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
          />

          <!-- Примітки -->
          <q-input
            v-model="form.notes"
            :label="$t('invoices.notes')"
            type="textarea"
            outlined
            autogrow
          />

          <!-- Попередження про обмеження -->
          <q-banner class="bg-info text-white">
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            {{ $t('invoices.editLimitations') }}
          </q-banner>

          <div class="row justify-end q-gutter-sm">
            <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
            <q-btn
              :label="$t('common.save')"
              color="primary"
              type="submit"
              :loading="loading"
              :disable="!hasChanges"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { InvoicesApi } from 'src/api/invoices'
import { date } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  invoice: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const errors = ref({})
const originalData = ref({})

// Form data
const form = ref({
  invoice_number: '',
  invoice_date: '',
  billing_month: null,
  billing_year: null,
  notes: '',
})

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Поточний рік для вибору + 3 попередні
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 4; i++) {
    const year = currentYear - i
    years.push({ label: year.toString(), value: year })
  }
  return years
})

// Місяці для вибору
const monthOptions = computed(() => {
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push({ label: t(`invoices.months.${i}`), value: i })
  }
  return months
})

// Перевірка чи є зміни
const hasChanges = computed(() => {
  if (!originalData.value) return false

  return (
    form.value.invoice_number !== originalData.value.invoice_number ||
    form.value.invoice_date !== originalData.value.invoice_date ||
    form.value.billing_month !== originalData.value.billing_month ||
    form.value.billing_year !== originalData.value.billing_year ||
    (form.value.notes || '') !== (originalData.value.notes || '')
  )
})

// Methods
const initializeForm = () => {
  if (!props.invoice) return

  const invoiceDate = props.invoice.invoice_date
    ? date.formatDate(props.invoice.invoice_date, 'YYYY-MM-DD')
    : date.formatDate(new Date(), 'YYYY-MM-DD')

  form.value = {
    invoice_number: props.invoice.invoice_number || '',
    invoice_date: invoiceDate,
    billing_month: props.invoice.billing_month || null,
    billing_year: props.invoice.billing_year || null,
    notes: props.invoice.notes || '',
  }

  // Зберігаємо оригінальні дані для порівняння
  originalData.value = { ...form.value }

  // Очищаємо помилки
  errors.value = {}
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const onSubmit = async () => {
  if (!hasChanges.value) {
    $q.notify({
      color: 'warning',
      message: t('common.noChanges'),
      icon: 'warning',
    })
    return
  }

  loading.value = true
  errors.value = {}

  try {
    await InvoicesApi.updateInvoice(props.invoice.id, form.value)

    $q.notify({
      color: 'positive',
      message: t('invoices.updateSuccess'),
      icon: 'check',
    })

    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error updating invoice:', error)

    // Обробка помилок валідації
    if (error.response?.status === 400) {
      const message = error.response.data.message || t('common.errors.updating')

      // Перевірка на унікальність номера
      if (message.includes('номером') && message.includes('існує')) {
        errors.value.invoice_number = message
      } else {
        $q.notify({
          color: 'negative',
          message: message,
          icon: 'error',
        })
      }
    } else {
      $q.notify({
        color: 'negative',
        message: t('common.errors.updating'),
        icon: 'error',
      })
    }
  } finally {
    loading.value = false
  }
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.invoice) {
      initializeForm()
    }
  },
)

watch(
  () => props.invoice,
  (newInvoice) => {
    if (newInvoice && props.modelValue) {
      initializeForm()
    }
  },
)
</script>

<style scoped>
.q-banner {
  border-radius: 4px;
}
</style>
