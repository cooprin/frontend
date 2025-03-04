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
            :options="clientOptions"
            :label="$t('wialonObjects.ownership.selectClient')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
            :loading="loadingClients"
          />

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

// Default form
const defaultForm = {
  client_id: null,
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
      form.value = { ...defaultForm }
      loadClients()
    } else {
      form.value = { ...defaultForm }
      clientOptions.value = []
    }
  },
  { immediate: true },
)
</script>
