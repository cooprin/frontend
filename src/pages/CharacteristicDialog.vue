<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{
            isEdit ? $t('productTypes.editCharacteristic') : $t('productTypes.addCharacteristic')
          }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Назва -->
          <q-input
            v-model="form.name"
            :label="$t('productTypes.characteristicName')"
            :rules="[
              (val) => !!val || $t('common.validation.required'),
              (val) => val.length <= 255 || $t('common.validation.maxLength', { max: 255 }),
            ]"
            outlined
          />

          <!-- Код -->
          <q-input
            v-model="form.code"
            :label="$t('productTypes.characteristicCode')"
            :rules="[
              (val) => !!val || $t('common.validation.required'),
              (val) => /^[a-z0-9_]+$/.test(val) || $t('common.validation.codeFormat'),
            ]"
            :disable="isEdit"
            hint="Only lowercase letters, numbers and underscore"
            outlined
          />

          <!-- Тип -->
          <q-select
            v-model="form.type"
            :options="characteristicTypes"
            :label="$t('productTypes.characteristicType')"
            :rules="[(val) => !!val || $t('common.validation.required')]"
            :disable="isEdit"
            outlined
            emit-value
            map-options
          >
            <template v-slot:option="{ opt, selected }">
              <q-item v-bind="opt.props" :active="selected">
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                  <q-item-label caption>{{ opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Валідація для числових характеристик -->
          <template v-if="form.type === 'number'">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model.number="form.validation.min"
                  type="number"
                  :label="$t('productTypes.minValue')"
                  outlined
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="form.validation.max"
                  type="number"
                  :label="$t('productTypes.maxValue')"
                  outlined
                />
              </div>
            </div>
            <q-select
              v-model="form.validation.decimals"
              :options="[0, 1, 2, 3, 4]"
              :label="$t('productTypes.decimals')"
              outlined
            />
          </template>

          <!-- Валідація для текстових характеристик -->
          <template v-if="form.type === 'string'">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model.number="form.validation.minLength"
                  type="number"
                  :label="$t('productTypes.minLength')"
                  outlined
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="form.validation.maxLength"
                  type="number"
                  :label="$t('productTypes.maxLength')"
                  outlined
                />
              </div>
            </div>
            <q-input
              v-model="form.validation.pattern"
              :label="$t('productTypes.pattern')"
              hint="Regular expression pattern"
              outlined
            />
          </template>

          <!-- Валідація для дат -->
          <template v-if="form.type === 'date'">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="form.validation.min"
                  type="date"
                  :label="$t('productTypes.minDate')"
                  outlined
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.validation.max"
                  type="date"
                  :label="$t('productTypes.maxDate')"
                  outlined
                />
              </div>
            </div>
          </template>

          <!-- Опції для типу select -->
          <template v-if="form.type === 'select'">
            <div class="text-caption q-mb-sm">{{ $t('productTypes.options') }}</div>
            <div
              v-for="(option, index) in form.options"
              :key="index"
              class="row q-gutter-sm q-mb-sm"
            >
              <q-input
                v-model="form.options[index]"
                dense
                outlined
                class="col"
                :rules="[(val) => !!val || $t('common.validation.required')]"
              />
              <q-btn icon="close" flat round dense color="negative" @click="removeOption(index)" />
            </div>
            <q-btn :label="$t('productTypes.addOption')" color="primary" flat @click="addOption" />
          </template>

          <!-- Обов'язкове поле -->
          <q-toggle v-model="form.is_required" :label="$t('productTypes.required')" />

          <!-- Значення за замовчуванням -->
          <template v-if="form.type !== 'select'">
            <q-input
              v-model="form.default_value"
              :label="$t('productTypes.defaultValue')"
              outlined
            />
          </template>
          <template v-else>
            <q-select
              v-model="form.default_value"
              :options="form.options"
              :label="$t('productTypes.defaultValue')"
              outlined
              emit-value
              map-options
            />
          </template>

          <div class="row justify-end q-gutter-sm">
            <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
            <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
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
import { ProductTypesApi } from 'src/api/product-types'
import { CHARACTERISTIC_TYPES, DEFAULT_CHARACTERISTIC_VALIDATION } from 'src/constants/productTypes'

const props = defineProps({
  modelValue: Boolean,
  productTypeId: {
    type: String,
    required: true,
  },
  characteristic: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const $q = useQuasar()
const { t } = useI18n()

// State
const saving = ref(false)
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.characteristic)

// Form
const getDefaultForm = () => ({
  name: '',
  code: '',
  type: 'string',
  is_required: false,
  default_value: '',
  options: [],
  validation: { ...DEFAULT_CHARACTERISTIC_VALIDATION.string },
  ordering: 0,
})

const form = ref(getDefaultForm())

// Options
const characteristicTypes = CHARACTERISTIC_TYPES.map((type) => ({
  label: t(`productTypes.characteristicTypes.${type.value}`),
  value: type.value,
  description: type.description,
}))

// Methods
const resetValidation = () => {
  form.value.validation = {
    ...DEFAULT_CHARACTERISTIC_VALIDATION[form.value.type],
  }
}

const addOption = () => {
  if (!form.value.options) {
    form.value.options = []
  }
  form.value.options.push('')
}

const removeOption = (index) => {
  form.value.options.splice(index, 1)
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await ProductTypesApi.updateCharacteristic(
        props.productTypeId,
        props.characteristic.id,
        form.value,
      )
      $q.notify({
        color: 'positive',
        message: t('productTypes.characteristicUpdateSuccess'),
        icon: 'check',
      })
    } else {
      await ProductTypesApi.addCharacteristic(props.productTypeId, form.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.characteristicCreateSuccess'),
        icon: 'check',
      })
    }
    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error saving characteristic:', error)
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

// Watchers
watch(
  () => props.characteristic,
  (newVal) => {
    if (newVal) {
      form.value = { ...newVal }
    } else {
      form.value = getDefaultForm()
    }
  },
  { immediate: true },
)

watch(
  () => form.value.type,
  () => {
    resetValidation()
  },
)
</script>
