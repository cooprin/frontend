<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? t('wialonObjects.edit') : t('wialonObjects.create') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Назва -->
          <q-input
            v-model="form.name"
            :label="t('wialonObjects.name')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            autofocus
          />

          <!-- Wialon ID -->
          <q-input
            v-model="form.wialon_id"
            :label="t('wialonObjects.wialonId')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
          />

          <!-- Клієнт -->
          <q-select
            v-model="form.client_id"
            :options="clientOptions"
            :label="t('wialonObjects.client')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
            :loading="loadingClients"
          />

          <!-- Тариф -->
          <div>
            <q-toggle
              v-model="autoAssignTariff"
              :label="t('wialonObjects.autoAssignTariff')"
              class="q-mb-sm"
            />

            <q-select
              v-if="!autoAssignTariff"
              v-model="form.tariff_id"
              :options="tariffOptions"
              :label="t('wialonObjects.tariff')"
              outlined
              emit-value
              map-options
              :loading="loadingTariffs"
            />
            <div v-else class="text-caption q-pl-sm text-grey">
              {{ t('wialonObjects.autoTariffAssignment') }}
            </div>
          </div>

          <!-- Статус -->
          <q-select
            v-model="form.status"
            :options="statusOptions"
            :label="t('common.status')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
          />

          <!-- Опис -->
          <q-input
            v-model="form.description"
            :label="t('wialonObjects.description')"
            type="textarea"
            outlined
            autogrow
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn :label="t('common.cancel')" color="grey" v-close-popup />
            <q-btn :label="t('common.save')" color="primary" type="submit" :loading="loading" />
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
import { WialonApi } from 'src/api/wialon'
import { ClientsApi } from 'src/api/clients'
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
const loadingTariffs = ref(false)
const clientOptions = ref([])
const tariffOptions = ref([])
// Автоматичне призначення тарифу
const autoAssignTariff = ref(true)

// Default form
const defaultForm = {
  name: '',
  wialon_id: '',
  description: '',
  client_id: null,
  tariff_id: null,
  status: 'active',
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)

const statusOptions = computed(() => [
  { label: t('wialonObjects.statuses.active'), value: 'active' },
  { label: t('wialonObjects.statuses.suspended'), value: 'suspended' },
  { label: t('wialonObjects.statuses.inactive'), value: 'inactive' },
])

// Methods
const loadClients = async () => {
  loadingClients.value = true
  try {
    const response = await ClientsApi.getClients({
      is_active: true,
      perPage: 'All',
    })

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

const loadTariffs = async () => {
  loadingTariffs.value = true
  try {
    const response = await TariffsApi.getTariffs({
      is_active: true,
      perPage: 'All',
    })

    tariffOptions.value = response.data.tariffs.map((tariff) => ({
      label: `${tariff.name} (${formatCurrency(tariff.price)})`,
      value: tariff.id,
    }))
  } catch (error) {
    console.error('Error loading tariffs:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingTariffs.value = false
  }
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const onSubmit = async () => {
  loading.value = true
  try {
    const data = { ...form.value }

    // Якщо встановлене автоматичне призначення тарифу, вилучаємо tariff_id з даних
    if (autoAssignTariff.value) {
      data.tariff_id = null
      // Можна додати спеціальний флаг для бекенду, якщо потрібно
      data.auto_assign_tariff = true
    }

    if (isEdit.value) {
      await WialonApi.updateObject(props.editData.id, data)
      $q.notify({
        color: 'positive',
        message: t('wialonObjects.updateSuccess'),
        icon: 'check',
      })
    } else {
      await WialonApi.createObject(data)
      $q.notify({
        color: 'positive',
        message: t('wialonObjects.createSuccess'),
        icon: 'check',
      })
    }
    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error saving object:', error)
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

// Відстеження змін
watch(
  () => props.editData,
  (newValue) => {
    if (newValue) {
      form.value = { ...defaultForm, ...newValue }
      // Якщо редагуємо і є тариф, вимикаємо автоматичне призначення
      autoAssignTariff.value = !newValue.tariff_id
    } else {
      form.value = { ...defaultForm }
      // При створенні нового об'єкту по замовчуванню вмикаємо автоматичне призначення
      autoAssignTariff.value = true
    }
  },
  { immediate: true },
)
watch(
  () => autoAssignTariff.value,
  (newValue) => {
    if (newValue) {
      // Якщо включили автоматичне призначення, обнуляємо вибраний тариф
      form.value.tariff_id = null
    }
  },
)

// Lifecycle
onMounted(() => {
  loadClients()
  loadTariffs()
})
</script>
