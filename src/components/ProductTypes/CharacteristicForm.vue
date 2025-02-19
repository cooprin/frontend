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
      option-label="label"
      option-value="value"
      emit-value
      map-options
      @update:model-value="updateType"
    >
      <template v-slot:option="{ opt }">
        <q-item v-bind="opt.props">
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
            <q-item-label caption>{{ opt.description }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Валідація для текстових характеристик -->
    <template v-if="form.type === 'string'">
      <q-input
        v-model.number="form.validation_rules.maxLength"
        type="number"
        :label="$t('productTypes.maxLength')"
        outlined
      />
    </template>

    <!-- Валідація для числових характеристик -->
    <template v-if="form.type === 'number'">
      <q-input
        v-model.number="form.validation_rules.max"
        type="number"
        :min="0"
        :max="999999"
        :label="$t('productTypes.maxValue')"
        outlined
      />
    </template>

    <!-- Опції для типу select -->
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { CharacteristicTypesApi } from 'src/api/characteristic-types'

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

// State
const characteristicTypes = ref([])

const loadCharacteristicTypes = async () => {
  try {
    const response = await CharacteristicTypesApi.getCharacteristicTypes()
    characteristicTypes.value = response.data.types
  } catch (error) {
    console.error('Error loading characteristic types:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

// Default validation rules for each type
const defaultValidationRules = {
  string: {
    maxLength: 255,
  },
  number: {
    max: 999999,
  },
  date: {},
  boolean: {},
  select: {},
}

// Form
const form = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Update type and reset validation
const updateType = (type) => {
  emit('update:modelValue', {
    ...form.value,
    type,
    validation_rules: { ...defaultValidationRules[type] },
    options: type === 'select' ? [''] : null,
    default_value: null,
  })
}

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

onMounted(() => {
  loadCharacteristicTypes()
})
</script>
