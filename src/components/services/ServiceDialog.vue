<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? t('services.edit') : t('services.create') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Назва -->
          <q-input
            v-model="form.name"
            :label="t('services.name')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            autofocus
          />

          <!-- Тип послуги -->
          <q-select
            v-model="form.service_type"
            :options="serviceTypeOptions"
            :label="t('services.serviceType')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            emit-value
            map-options
          />

          <!-- Фіксована ціна (якщо тип послуги - фіксована) -->
          <q-input
            v-if="form.service_type === 'fixed'"
            v-model.number="form.fixed_price"
            :label="t('services.fixedPrice')"
            :rules="[
              (val) =>
                (val !== null && val !== undefined && val !== '') ||
                t('common.validation.required'),
              (val) => val >= 0 || t('common.validation.minValue', { min: 0 }),
            ]"
            type="number"
            outlined
            :prefix="$t('common.currency')"
          />

          <!-- Опис -->
          <q-input
            v-model="form.description"
            :label="t('services.description')"
            type="textarea"
            outlined
            autogrow
          />

          <!-- Активність -->
          <q-toggle v-model="form.is_active" :label="t('services.isActive')" />

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
import { ServicesApi } from 'src/api/services'

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

// Default form
const defaultForm = {
  name: '',
  description: '',
  service_type: null,
  fixed_price: null,
  is_active: true,
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)

const serviceTypeOptions = computed(() => [
  { label: t('services.types.fixed'), value: 'fixed' },
  { label: t('services.types.object_based'), value: 'object_based' },
])

// Methods
const onSubmit = async () => {
  loading.value = true
  try {
    // Перевіряємо, чи для послуги з фіксованою ціною встановлена ціна
    if (
      form.value.service_type === 'fixed' &&
      (form.value.fixed_price === null || form.value.fixed_price === undefined)
    ) {
      throw new Error(t('common.validation.required'))
    }

    // Якщо це не послуга з фіксованою ціною, встановлюємо fixed_price на null
    if (form.value.service_type !== 'fixed') {
      form.value.fixed_price = null
    }

    if (isEdit.value) {
      await ServicesApi.updateService(props.editData.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('services.updateSuccess'),
        icon: 'check',
      })
    } else {
      await ServicesApi.createService(form.value)
      $q.notify({
        color: 'positive',
        message: t('services.createSuccess'),
        icon: 'check',
      })
    }
    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error saving service:', error)
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

// Відстеження змін типу послуги
watch(
  () => form.value.service_type,
  (newType) => {
    if (newType !== 'fixed') {
      form.value.fixed_price = null
    }
  },
)

// Відстеження змін editData
watch(
  () => props.editData,
  (newValue) => {
    if (newValue) {
      form.value = { ...defaultForm, ...newValue }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)
</script>
