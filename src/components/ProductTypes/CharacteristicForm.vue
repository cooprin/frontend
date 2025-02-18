<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <!-- Назва -->
    <q-input
      v-model="form.name"
      :label="$t('productTypes.characteristicName')"
      :rules="[(val) => !!val || $t('common.validation.required')]"
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

    <!-- Валідація в залежності від типу -->
    <template v-if="form.type === 'string'">
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-input
            v-model.number="form.validation_rules.minLength"
            type="number"
            :label="$t('productTypes.minLength')"
            outlined
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="form.validation_rules.maxLength"
            type="number"
            :label="$t('productTypes.maxLength')"
            outlined
          />
        </div>
      </div>
      <q-input
        v-model="form.validation_rules.pattern"
        :label="$t('productTypes.pattern')"
        hint="Regular expression pattern"
        outlined
      />
    </template>

    <template v-if="form.type === 'number'">
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-input
            v-model.number="form.validation_rules.min"
            type="number"
            :min="0"
            :max="999999"
            :label="$t('productTypes.minValue')"
            outlined
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="form.validation_rules.max"
            type="number"
            :min="0"
            :max="999999"
            :label="$t('productTypes.maxValue')"
            outlined
          />
        </div>
      </div>
    </template>

    <template v-if="form.type === 'date'">
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-input
            v-model="form.validation_rules.min"
            type="date"
            :label="$t('productTypes.minDate')"
            outlined
          />
        </div>
        <div class="col-6">
          <q-input
            v-model="form.validation_rules.max"
            type="date"
            :label="$t('productTypes.maxDate')"
            outlined
          />
        </div>
      </div>
    </template>

    <template v-if="form.type === 'select'">
      <div class="text-caption q-mb-sm">
        {{ $t('productTypes.options') }}
        <span class="text-grey-6"> ({{ $t('productTypes.maxOptionsLimit', { max: 50 }) }}) </span>
      </div>
      <div v-for="(option, index) in form.options" :key="index" class="row q-gutter-sm q-mb-sm">
        <q-input
          v-model="form.options[index]"
          dense
          outlined
          class="col"
          :rules="[(val) => !!val || $t('common.validation.required')]"
        />
        <q-btn icon="close" flat round dense color="negative" @click="removeOption(index)" />
      </div>
      <q-btn
        :label="$t('productTypes.addOption')"
        color="primary"
        flat
        @click="addOption"
        :disable="form.options?.length >= 50"
      />
    </template>

    <!-- Обов'язкове поле -->
    <q-toggle v-model="form.is_required" :label="$t('productTypes.required')" />

    <!-- Значення за замовчуванням -->
    <q-input v-model="form.default_value" :label="$t('productTypes.defaultValue')" outlined />

    <div class="row justify-end q-gutter-sm">
      <q-btn :label="$t('common.cancel')" color="grey" @click="$emit('cancel')" />
      <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
    </div>
  </q-form>
</template>
<script setup>
import { computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ProductTypesApi } from 'src/api/product-types'
import { CHARACTERISTIC_TYPES } from 'src/constants/productTypes'

const characteristicTypes = computed(() =>
  CHARACTERISTIC_TYPES.map((type) => ({
    label: t(`productTypes.characteristicTypes.${type.value}`),
    value: type.value,
    description: type.description,
  })),
)

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  productTypeId: {
    type: String,
    required: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const $q = useQuasar()
const { t } = useI18n()

// Default validation rules for each type
const defaultValidationRules = {
  string: {
    minLength: null,
    maxLength: 255,
    pattern: null,
  },
  number: {
    min: null,
    max: null,
    decimals: 0,
  },
  date: {
    min: null,
    max: null,
  },
  boolean: {
    default: false,
  },
  select: {
    multiple: false,
    min: null,
    max: null,
  },
}

// Form
const form = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Add option to select type
const addOption = () => {
  if (!form.value.options) {
    form.value.options = []
  }
  form.value.options.push('')
}

// Remove option from select type
const removeOption = (index) => {
  form.value.options.splice(index, 1)
}

// Watch type changes to reset validation rules
watch(
  () => form.value.type,
  (newType) => {
    if (newType && !props.isEdit) {
      form.value.validation_rules = { ...defaultValidationRules[newType] }
      form.value.options = newType === 'select' ? [''] : null
      form.value.default_value = null
    }
  },
  { deep: true },
)

// Submit handler
const onSubmit = async () => {
  try {
    // Перевірка опцій для типу select
    if (form.value.type === 'select') {
      if (!form.value.options?.length) {
        $q.notify({
          color: 'negative',
          message: t('productTypes.selectRequiresOptions'),
          icon: 'error',
        })
        return
      }

      if (form.value.options.some((opt) => !opt.trim())) {
        $q.notify({
          color: 'negative',
          message: t('productTypes.emptyOptionsNotAllowed'),
          icon: 'error',
        })
        return
      }
    }
    // Validate default value if present
    if (form.value.default_value) {
      const validation = await ProductTypesApi.validateCharacteristic({
        type: form.value.type,
        value: form.value.default_value,
        validation_rules: form.value.validation_rules,
      })

      if (!validation.data.isValid) {
        $q.notify({
          color: 'negative',
          message: t('productTypes.defaultValueInvalid'),
          caption: validation.data.errors.join(', '),
          icon: 'error',
        })
        return
      }
    }

    emit('submit')
  } catch (error) {
    console.error('Validation error:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.validation'),
      icon: 'error',
    })
  }
}
</script>

<style scoped>
.option-input {
  flex: 1;
}
</style>
