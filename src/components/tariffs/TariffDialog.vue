<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? t('tariffs.edit') : t('tariffs.create') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Назва -->
          <q-input
            v-model="form.name"
            :label="t('tariffs.name')"
            :rules="[(val) => !!val || t('common.validation.required')]"
            outlined
            autofocus
          />

          <!-- Ціна -->
          <q-input
            v-model.number="form.price"
            :label="t('tariffs.price')"
            :rules="[
              (val) =>
                (val !== null && val !== undefined && val !== '') ||
                t('common.validation.required'),
              (val) => val >= 0 || t('common.validation.minValue', { min: 0 }),
            ]"
            type="number"
            outlined
            :prefix="$t('common.currency')"
            :readonly="isEdit"
            :hint="isEdit ? t('tariffs.priceEditDisabled') : ''"
          />

          <!-- Опис -->
          <q-input
            v-model="form.description"
            :label="t('tariffs.description')"
            type="textarea"
            outlined
            autogrow
          />

          <!-- Активність -->
          <q-toggle v-model="form.is_active" :label="t('tariffs.isActive')" />

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

// Default form
const defaultForm = {
  name: '',
  description: '',
  price: null,
  is_active: true,
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)

// Methods
const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await TariffsApi.updateTariff(props.editData.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('tariffs.updateSuccess'),
        icon: 'check',
      })
    } else {
      await TariffsApi.createTariff(form.value)
      $q.notify({
        color: 'positive',
        message: t('tariffs.createSuccess'),
        icon: 'check',
      })
    }
    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error saving tariff:', error)
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
