<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ $t('wialonObjects.ownership.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Відображення інформації про об'єкт -->
          <div class="text-subtitle1">{{ object?.name }}</div>
          <div class="text-caption">
            {{ $t('wialonObjects.wialonId') }}: {{ object?.wialon_id }}
          </div>

          <q-separator class="q-my-md" />

          <!-- Поточний власник -->
          <q-item>
            <q-item-section>
              <q-item-label caption>{{ $t('wialonObjects.ownership.currentOwner') }}</q-item-label>
              <q-item-label>{{ object?.client_name }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Вибір нового власника -->
          <q-select
            v-model="form.client_id"
            :options="clientSearch.filteredOptions.value"
            :label="$t('wialonObjects.ownership.selectClient')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="(val, update) => clientSearch.filterOptions(val, update)"
            @popup-show="clientSearch.resetFilter"
            :loading="loadingClients"
          />

          <!-- Дата зміни власника -->
          <q-input
            v-model="form.operation_date"
            :label="$t('wialonObjects.ownership.operationDate')"
            outlined
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.operation_date" mask="YYYY-MM-DD" :max="maxDate">
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
            :label="$t('wialonObjects.ownership.notes')"
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
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WialonApi } from 'src/api/wialon'
import { ClientsApi } from 'src/api/clients'
import { date } from 'quasar'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  object: {
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
// Searchable select for clients
const clientSearch = useSearchableSelect(clientOptions)

// Обмеження дати - не можна вибрати дату з майбутнього
const maxDate = date.formatDate(new Date(), 'YYYY/MM/DD')

// Default form
const defaultForm = {
  client_id: null,
  notes: '',
  operation_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
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
      is_active: true,
      perPage: 'All',
    })

    // Фільтруємо - виключаємо поточного власника
    clientOptions.value = response.data.clients
      .filter((client) => client.id !== props.object?.client_id)
      .map((client) => ({
        label: client.name,
        value: client.id,
      }))
    clientSearch.initializeOptions(clientOptions.value)
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
    await WialonApi.changeOwner(props.object.id, form.value)

    $q.notify({
      color: 'positive',
      message: t('wialonObjects.ownership.changeSuccess'),
      icon: 'check',
    })

    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error changing owner:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Відстеження змін
watch(
  () => props.object,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...defaultForm,
        operation_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
      }
      loadClients()
    } else {
      form.value = { ...defaultForm }
      clientOptions.value = []
    }
  },
  { immediate: true },
)
</script>
