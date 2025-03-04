<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ $t('services.assignment.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Відображення інформації про послугу -->
          <div class="text-subtitle1">{{ service?.name }}</div>
          <div class="text-caption">{{ $t(`services.types.${service?.service_type}`) }}</div>
          <q-separator class="q-my-md" />

          <!-- Вибір клієнта -->
          <q-select
            v-model="form.client_id"
            :options="clientOptions"
            :label="$t('services.assignment.selectClient')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
            :loading="loadingClients"
          />

          <!-- Дата початку -->
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
import { ClientsApi } from 'src/api/clients'
import { date } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  service: {
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
const clientOptions = ref([])

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
const loadClients = async () => {
  loadingClients.value = true
  try {
    const response = await ClientsApi.getClients({
      perPage: 'All',
      is_active: true,
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

const onSubmit = async () => {
  loading.value = true
  try {
    // Підготовка даних для відправки
    const data = {
      client_id: form.value.client_id,
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

    // Якщо це помилка про те, що послуга вже призначена клієнту, показуємо відповідне повідомлення
    if (errorMessage.includes('already assigned')) {
      $q.notify({
        color: 'warning',
        message: t('services.assignment.alreadyAssigned'),
        icon: 'warning',
      })
    } else {
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'error',
      })
    }
  } finally {
    loading.value = false
  }
}

// Відстеження змін
watch(
  () => props.service,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...defaultForm,
        service_id: newValue.id,
      }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  loadClients()
})
</script>
