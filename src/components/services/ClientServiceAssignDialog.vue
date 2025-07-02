<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ $t('services.assignment.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Вибір послуги -->
          <q-select
            v-model="form.service_id"
            :options="serviceSearch.filteredOptions.value"
            :label="$t('services.assignment.selectService')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="(val, update) => serviceSearch.filterOptions(val, update)"
            @popup-show="serviceSearch.resetFilter"
            :loading="loadingServices"
          />

          <!-- Дата початку дії -->
          <q-input v-model="form.start_date" :label="$t('services.assignment.startDate')" outlined>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.start_date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="OK" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Примітки -->
          <q-input
            v-model="form.notes"
            :label="$t('services.assignment.notes')"
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
import { ServicesApi } from 'src/api/services'
import { date } from 'quasar'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  clientId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingServices = ref(false)
const serviceOptions = ref([])
// Searchable select for services
const serviceSearch = useSearchableSelect(serviceOptions)

// Default form
const defaultForm = {
  client_id: null,
  service_id: null,
  start_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
  notes: '',
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Methods
const loadServices = async () => {
  loadingServices.value = true
  try {
    const response = await ServicesApi.getServices({
      is_active: true,
      perPage: 'All',
    })

    // Фільтруємо тільки послуги з фіксованою ціною
    serviceOptions.value = response.data.services
      .filter((service) => service.service_type === 'fixed')
      .map((service) => ({
        label: `${service.name} (${formatCurrency(service.fixed_price)})`,
        value: service.id,
      }))
    serviceSearch.initializeOptions(serviceOptions.value)
  } catch (error) {
    console.error('Error loading services:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingServices.value = false
  }
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
      client_id: props.clientId,
      service_id: form.value.service_id,
      start_date: form.value.start_date,
      notes: form.value.notes,
    }

    // Відправка запиту на призначення послуги
    await ServicesApi.assignServiceToClient(data)

    $q.notify({
      color: 'positive',
      message: t('services.assignment.assignSuccess'),
      icon: 'check',
    })

    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error assigning service:', error)
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
  () => props.clientId,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...defaultForm,
        client_id: newValue,
      }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  loadServices()
})
</script>
