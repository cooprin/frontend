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
import { ref, computed, onMounted } from 'vue'
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
  loading.value = true
  try {
    const requestData = {
      year: parseInt(form.value.year),
      month: parseInt(form.value.month),
    }

    // Додаємо clientId, якщо вибраний клієнт
    if (form.value.clientId) {
      requestData.clientId = form.value.clientId.value || form.value.clientId
    }

    const response = await InvoicesApi.generateInvoices(requestData)

    $q.notify({
      color: 'positive',
      message: t('invoices.generatedSuccess', { count: response.data.invoices.length }),
      icon: 'check',
    })

    show.value = false
    emit('generated', response.data.invoices)
  } catch (error) {
    console.error('Error generating invoices:', error)
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

// Lifecycle
onMounted(() => {
  loadClients()
})
</script>
