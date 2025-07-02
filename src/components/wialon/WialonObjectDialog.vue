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
            :options="clientSearch.filteredOptions.value"
            :label="t('wialonObjects.client')"
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

          <!-- Дата операції (компактний варіант) -->
          <q-input
            v-model="form.operation_date"
            :label="t('wialonObjects.operationDate')"
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

          <!-- Статус -->
          <q-select
            v-model="form.status"
            :options="statusOptions"
            :label="t('common.status')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
          >
            <template v-slot:hint>
              <template v-if="form.status !== 'active'">
                {{ t('wialonObjects.statusWarning') }}
              </template>
            </template>
          </q-select>

          <!-- Тариф - показується тільки коли статус "active" -->
          <template v-if="form.status === 'active'">
            <q-select
              v-model="form.tariff_id"
              :options="tariffSearch.filteredOptions.value"
              :label="t('wialonObjects.tariff')"
              outlined
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="(val, update) => tariffSearch.filterOptions(val, update)"
              @popup-show="tariffSearch.resetFilter"
              :loading="loadingTariffs"
            />

            <!-- Дата зміни тарифу (інформативне відображення) -->
            <div v-if="form.tariff_id && !isEdit" class="q-mb-md">
              <div class="text-subtitle2">{{ t('wialonObjects.tariffEffectiveFrom') }}</div>
              <div>{{ formatDate(form.operation_date) }}</div>
              <div class="text-caption text-grey">
                {{ t('wialonObjects.tariffMatchOperationDate') }}
              </div>
            </div>

            <!-- Дата зміни тарифу (для редагування) -->
            <q-input
              v-if="form.tariff_id && isEdit"
              v-model="form.tariff_effective_from"
              :label="t('wialonObjects.tariffEffectiveFrom')"
              :rules="[(val) => !!val || t('common.validation.required')]"
              outlined
              readonly
            >
              <template v-slot:hint>
                {{ t('wialonObjects.tariffEffectiveHint') }}
              </template>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.tariff_effective_from" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </template>

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
import { date } from 'quasar'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
  initialData: {
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
// Searchable selects
const clientSearch = useSearchableSelect(clientOptions)
const tariffSearch = useSearchableSelect(tariffOptions)

// Обмеження дати - не можна вибрати дату з майбутнього
const maxDate = date.formatDate(new Date(), 'YYYY/MM/DD')

// Default form
const defaultForm = {
  name: '',
  wialon_id: '',
  description: '',
  client_id: null,
  tariff_id: null,
  tariff_effective_from: date.formatDate(new Date(), 'YYYY-MM-DD'),
  status: 'active',
  operation_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
}

const form = ref({ ...defaultForm })

const formatDate = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

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
    tariffSearch.initializeOptions(tariffOptions.value)
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

    // Для нових об'єктів встановлюємо дату тарифу рівною даті операції
    if (!isEdit.value && data.status === 'active' && data.tariff_id) {
      data.tariff_effective_from = data.operation_date
    }

    // Якщо статус не активний, не відправляємо дані про тариф
    if (data.status !== 'active') {
      delete data.tariff_id
      delete data.tariff_effective_from
    }

    let response
    if (isEdit.value) {
      response = await WialonApi.updateObject(props.editData.id, data)

      // Перевіряємо наявність попереджень у відповіді
      if (response.data.warnings && response.data.warnings.length > 0) {
        // Відображаємо попередження користувачеві
        $q.notify({
          color: 'warning',
          message: response.data.warnings.join(' '),
          icon: 'warning',
          timeout: 10000,
          actions: [
            {
              label: t('common.understand'),
              color: 'white',
              handler: () => {
                // Просто закриваємо повідомлення
              },
            },
          ],
        })
      }

      $q.notify({
        color: 'positive',
        message: t('wialonObjects.updateSuccess'),
        icon: 'check',
      })
    } else {
      response = await WialonApi.createObject(data)
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

    const errorMessage =
      error.response?.data?.message || t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`)

    if (errorMessage.includes('вже оплачений')) {
      $q.notify({
        color: 'warning',
        message: errorMessage,
        icon: 'warning',
        timeout: 10000,
        actions: [
          {
            label: t('common.understand'),
            color: 'white',
            handler: () => {
              // Просто закриваємо повідомлення
            },
          },
        ],
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

const loadTariffDetails = async () => {
  // Завантажуємо деталі тарифу тільки якщо об'єкт активний і вибрано тариф
  if (form.value.tariff_id && form.value.status === 'active') {
    if (isEdit.value && props.editData) {
      try {
        const response = await TariffsApi.getOptimalChangeDate(props.editData.id)
        const optimalDate = response.data.changeDate

        // Встановлюємо оптимальну дату для початку дії тарифу
        form.value.tariff_effective_from = date.formatDate(optimalDate, 'YYYY-MM-DD')
      } catch (error) {
        console.error('Error loading optimal tariff change date:', error)
        // Якщо помилка, встановлюємо дату операції
        form.value.tariff_effective_from = form.value.operation_date
      }
    } else {
      // Для нового об'єкта встановлюємо дату тарифу таку ж як і дата операції
      form.value.tariff_effective_from = form.value.operation_date
    }
  }
}

// Відстеження змін
watch(
  () => [props.editData, props.initialData],
  ([newEditData, newInitialData]) => {
    if (newEditData) {
      // Режим редагування
      form.value = {
        ...defaultForm,
        ...newEditData,
        operation_date: newEditData.operation_date || date.formatDate(new Date(), 'YYYY-MM-DD'),
      }
    } else if (newInitialData) {
      // Режим створення з початковими даними
      form.value = {
        ...defaultForm,
        ...newInitialData,
        operation_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
      }
    } else {
      // Режим створення без даних
      form.value = { ...defaultForm }
    }
  },
  { immediate: true, deep: true },
)

// Відстеження зміни дати операції для нових об'єктів
watch(
  () => form.value.operation_date,
  (newValue) => {
    if (!isEdit.value && form.value.status === 'active') {
      // Оновлюємо дату тарифу для відображення, але не для редагування
      form.value.tariff_effective_from = newValue
    }
  },
)

// Відстеження зміни тарифу
watch(
  () => form.value.tariff_id,
  (newValue, oldValue) => {
    if (newValue && newValue !== oldValue && form.value.status === 'active') {
      loadTariffDetails()
    }
  },
)

// Відстеження зміни статусу
watch(
  () => form.value.status,
  (newValue, oldValue) => {
    if (newValue !== 'active' && form.value.tariff_id) {
      // Якщо статус змінено на неактивний і був вибраний тариф, скидаємо тариф
      form.value.tariff_id = null
      form.value.tariff_effective_from = null
    } else if (newValue === 'active' && oldValue !== 'active') {
      // Якщо статус змінено на активний, завантажуємо доступні тарифи
      if (loadingTariffs.value === false && tariffOptions.value.length === 0) {
        loadTariffs()
      }

      // Автоматично встановлюємо дату тарифу такою ж, як дата операції
      form.value.tariff_effective_from = form.value.operation_date
    }
  },
)

// Lifecycle
onMounted(() => {
  loadClients()
  if (form.value.status === 'active') {
    loadTariffs()
  }
})
</script>
