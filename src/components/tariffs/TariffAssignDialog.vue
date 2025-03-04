<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ $t('tariffs.assignment.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Відображення інформації про тариф -->
          <div class="text-subtitle1">{{ tariff?.name }}</div>
          <div class="text-caption">{{ formatCurrency(tariff?.price) }}</div>
          <q-separator class="q-my-md" />

          <!-- Вибір об'єкта -->
          <q-select
            v-model="form.object_id"
            :options="objectOptions"
            :label="$t('tariffs.assignment.selectObject')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
            :loading="loadingObjects"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.client_name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Дата початку дії -->
          <q-input
            v-model="form.effective_from"
            :label="$t('tariffs.assignment.effectiveFrom')"
            outlined
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.effective_from" mask="YYYY-MM-DD">
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
            :label="$t('tariffs.assignment.notes')"
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
import { TariffsApi } from 'src/api/tariffs'
import { date } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tariff: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingObjects = ref(false)
const objectOptions = ref([])

// Default form
const defaultForm = {
  object_id: null,
  tariff_id: null,
  effective_from: date.formatDate(new Date(), 'YYYY-MM-DD'),
  notes: '',
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Methods
const loadObjects = async () => {
  loadingObjects.value = true
  try {
    // Тут буде API запит для отримання об'єктів, коли ми його створимо
    // Імітуємо завантаження даних для прикладу
    objectOptions.value = [
      { label: 'Object 1', value: '1', client_name: 'Client A' },
      { label: 'Object 2', value: '2', client_name: 'Client B' },
      { label: 'Object 3', value: '3', client_name: 'Client C' },
    ]

    /* Реальний код буде приблизно такий:
    const response = await WialonApi.getObjects({
      perPage: 'All',
      status: 'active',
    })

    objectOptions.value = response.data.objects.map((obj) => ({
      label: obj.name,
      value: obj.id,
      client_name: obj.client_name,
    }))
    */
  } catch (error) {
    console.error('Error loading objects:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingObjects.value = false
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
      object_id: form.value.object_id,
      tariff_id: form.value.tariff_id,
      effective_from: form.value.effective_from,
      notes: form.value.notes,
    }

    // Відправка запиту на призначення тарифу
    await TariffsApi.assignTariffToObject(data)

    $q.notify({
      color: 'positive',
      message: t('tariffs.assignment.assignSuccess'),
      icon: 'check',
    })

    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error assigning tariff:', error)
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
  () => props.tariff,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...defaultForm,
        tariff_id: newValue.id,
      }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  loadObjects()
})
</script>
