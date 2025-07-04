<template>
  <q-dialog
    v-model="show"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? t('products.edit') : t('products.create') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="isEdit" class="bg-yellow-1 q-pa-sm">
        <div class="text-subtitle2 text-warning">
          {{ t('products.editLimitedFields') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Ліва колонка - основна інформація -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">{{ t('products.mainInfo') }}</div>
                </q-card-section>

                <q-card-section class="q-gutter-md">
                  <!-- SKU -->
                  <q-input
                    v-model="form.sku"
                    :label="t('products.sku')"
                    :rules="[
                      (val) => !!val || t('validation.required'),
                      (val) => /^[A-Z0-9-]+$/.test(val) || t('validation.skuFormat'),
                    ]"
                    :hint="t('products.skuHint')"
                    outlined
                    :disable="isEdit"
                    uppercase
                    @keydown="handleSkuKeydown"
                    ref="skuInput"
                    autofocus
                  />

                  <!-- Виробник -->
                  <q-select
                    v-model="form.manufacturer_id"
                    :options="manufacturerSearch.filteredOptions.value"
                    :label="t('products.manufacturer')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingManufacturers"
                    outlined
                    emit-value
                    map-options
                    use-input
                    input-debounce="300"
                    @filter="(val, update) => manufacturerSearch.filterOptions(val, update)"
                    @popup-show="manufacturerSearch.resetFilter"
                    :disable="isEdit"
                  />

                  <!-- Модель -->
                  <q-select
                    v-model="form.model_id"
                    :options="modelSearch.filteredOptions.value"
                    :label="t('products.model')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingModels"
                    outlined
                    emit-value
                    map-options
                    use-input
                    input-debounce="300"
                    @filter="(val, update) => modelSearch.filterOptions(val, update)"
                    @popup-show="modelSearch.resetFilter"
                    :disable="isEdit || !form.manufacturer_id"
                  />
                  <div v-if="productTypeName" class="text-caption q-ml-sm q-mb-md">
                    {{ t('products.productType') }}:
                    <span class="text-weight-bold">{{ productTypeName }}</span>
                  </div>
                  <!-- Постачальник -->
                  <q-select
                    v-model="form.supplier_id"
                    :options="supplierSearch.filteredOptions.value"
                    :label="t('products.supplier')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingSuppliers"
                    outlined
                    emit-value
                    map-options
                    use-input
                    input-debounce="300"
                    @filter="(val, update) => supplierSearch.filterOptions(val, update)"
                    @popup-show="supplierSearch.resetFilter"
                    :disable="isEdit"
                  />

                  <q-select
                    v-model="form.warehouse_id"
                    :options="warehouseSearch.filteredOptions.value"
                    :label="t('products.warehouse')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingWarehouses"
                    outlined
                    emit-value
                    map-options
                    use-input
                    input-debounce="300"
                    @filter="(val, update) => warehouseSearch.filterOptions(val, update)"
                    @popup-show="warehouseSearch.resetFilter"
                    :disable="isEdit"
                  />
                  <q-toggle v-model="form.is_own" :label="t('products.isOwn')" />
                </q-card-section>
              </q-card>
            </div>

            <!-- Права колонка - характеристики -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">{{ t('products.characteristics') }}</div>
                </q-card-section>

                <q-card-section>
                  <div v-if="!characteristics.length" class="text-grey text-center q-pa-md">
                    {{ t('products.noCharacteristics') }}
                  </div>

                  <div v-else class="q-gutter-md">
                    <template v-for="char in characteristics" :key="char.id">
                      <!-- String характеристика -->
                      <q-input
                        v-if="char.type === 'string'"
                        v-model="form.characteristics[char.code]"
                        :label="char.name"
                        :rules="getCharacteristicRules(char)"
                        outlined
                      />

                      <!-- Number характеристика -->
                      <q-input
                        v-else-if="char.type === 'number'"
                        v-model.number="form.characteristics[char.code]"
                        type="number"
                        :label="char.name"
                        :rules="getCharacteristicRules(char)"
                        :min="char.validation_rules?.min"
                        :max="char.validation_rules?.max"
                        outlined
                      />

                      <!-- Date характеристика -->
                      <q-field
                        v-else-if="char.type === 'date'"
                        v-model="form.characteristics[char.code]"
                        :label="char.name"
                        :rules="getCharacteristicRules(char)"
                        outlined
                        stack-label
                      >
                        <template v-slot:control>
                          <div class="self-center full-width no-outline" tabindex="0">
                            {{ formatDate(form.characteristics[char.code]) }}
                          </div>
                        </template>
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.characteristics[char.code]"
                                mask="YYYY-MM-DD"
                                :min="char.validation_rules?.min"
                                :max="char.validation_rules?.max"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="OK" color="primary" flat />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-field>

                      <!-- Boolean характеристика -->
                      <q-toggle
                        v-else-if="char.type === 'boolean'"
                        v-model="form.characteristics[char.code]"
                        :label="char.name"
                      />

                      <!-- Select характеристика -->
                      <q-select
                        v-else-if="char.type === 'select'"
                        v-model="form.characteristics[char.code]"
                        :options="char.options"
                        :label="char.name"
                        :rules="getCharacteristicRules(char)"
                        outlined
                        emit-value
                        map-options
                      />
                    </template>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

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
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { ProductsApi } from 'src/api/products'
import { ModelsApi } from 'src/api/models'
import { SuppliersApi } from 'src/api/suppliers'
import { ProductTypesApi } from 'src/api/product-types'
import { WarehousesApi } from 'src/api/warehouses'
import { useAuthStore } from 'src/stores/auth'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const $q = useQuasar()
const { t } = useI18n()
const emit = defineEmits(['update:modelValue', 'saved'])
const skuInput = ref(null)
const authStore = useAuthStore()

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

const STORAGE_KEY = 'lastProductFormData'

// State
const loading = ref(false)
const loadingManufacturers = ref(false)
const loadingModels = ref(false)
const loadingSuppliers = ref(false)
const loadingCharacteristics = ref(false)
const manufacturerOptions = ref([])
const modelOptions = ref([])
const supplierOptions = ref([])
const characteristics = ref([])
const warehouseOptions = ref([])
const loadingWarehouses = ref(false)
// Searchable selects
const manufacturerSearch = useSearchableSelect(manufacturerOptions)
const modelSearch = useSearchableSelect(modelOptions)
const supplierSearch = useSearchableSelect(supplierOptions)
const warehouseSearch = useSearchableSelect(warehouseOptions)

// Default form
const defaultForm = {
  sku: '',
  manufacturer_id: null,
  model_id: null,
  supplier_id: null,
  warehouse_id: null,
  is_own: true,
  characteristics: {},
}

// Функції форматування дат
const formatDate = (dateString) => {
  return dateString ? date.formatDate(dateString, 'DD.MM.YYYY') : ''
}

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  try {
    return date.formatDate(new Date(dateString), 'YYYY-MM-DD')
  } catch {
    return ''
  }
}

const saveFormToStorage = (formData) => {
  const dataToSave = {
    ...formData,
    sku: undefined,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
}

const loadFormFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsedData = JSON.parse(saved)
      const formData = { ...defaultForm, ...parsedData }
      const savedCharacteristics = formData.characteristics || {}
      nextTick(async () => {
        if (formData.model_id && formData.product_type_id) {
          await loadCharacteristics()
          form.value.characteristics = { ...savedCharacteristics }

          // Форматуємо дати
          characteristics.value.forEach((char) => {
            if (char.type === 'date' && form.value.characteristics[char.code]) {
              form.value.characteristics[char.code] = formatDateForInput(
                form.value.characteristics[char.code],
              )
            }
          })
        }
      })
      return formData
    } catch {
      return { ...defaultForm }
    }
  }
  return { ...defaultForm }
}

const loadWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const response = await WarehousesApi.getWarehouses({
      is_active: true,
      per_page: 'All',
    })
    warehouseOptions.value = response.data.warehouses.map((w) => ({
      label: w.name,
      value: w.id,
    }))
    warehouseSearch.initializeOptions(warehouseOptions.value)
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingWarehouses.value = false
  }
}

const form = ref(loadFormFromStorage())

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)

const selectedModelInfo = computed(() => {
  if (!form.value.model_id) return null
  const model = modelOptions.value.find((m) => m.value === form.value.model_id)
  return model
})

const productTypeName = computed(() => {
  if (!selectedModelInfo.value) return ''
  return selectedModelInfo.value.product_type_name || ''
})

// Methods
const handleSkuKeydown = async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    const requiredFields = [
      'manufacturer_id',
      'model_id',
      'supplier_id',
      'product_type_id',
      'warehouse_id',
    ]
    const allFieldsFilled = requiredFields.every((field) => form.value[field])

    if (allFieldsFilled) {
      await onSubmit()
      show.value = false
    } else {
      $q.notify({
        color: 'warning',
        message: t('products.fillRequiredFields'),
        icon: 'warning',
      })
    }
  }
}

const loadManufacturers = async () => {
  loadingManufacturers.value = true
  try {
    const response = await ProductsApi.getManufacturers({
      is_active: true,
      per_page: 'All',
    })
    manufacturerOptions.value = response.data.manufacturers.map((m) => ({
      label: m.name,
      value: m.id,
    }))
    manufacturerSearch.initializeOptions(manufacturerOptions.value)
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingManufacturers.value = false
  }
}

const loadModels = async (manufacturerId = null) => {
  const selectedManufacturer = manufacturerId || form.value.manufacturer_id
  loadingModels.value = true

  try {
    form.value.model_id = null
    form.value.product_type_id = null
    modelOptions.value = []

    if (!selectedManufacturer) {
      modelSearch.initializeOptions([])
      return
    }

    const response = await ModelsApi.getModels({
      manufacturer: selectedManufacturer,
      isActive: true,
      perPage: 'All',
    })

    if (response.data && Array.isArray(response.data.models)) {
      const filteredModels = response.data.models.filter(
        (m) => m.manufacturer_id == selectedManufacturer,
      )

      modelOptions.value = filteredModels.map((m) => ({
        label: `${m.name} (${m.product_type_name || 'Тип не вказано'})`,
        value: m.id,
        product_type_id: m.product_type_id,
        product_type_name: m.product_type_name,
      }))
      modelSearch.initializeOptions(modelOptions.value)
    }
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingModels.value = false
  }
}

const loadSuppliers = async () => {
  loadingSuppliers.value = true
  try {
    const response = await SuppliersApi.getSuppliers({
      is_active: true,
      per_page: 'All',
    })
    supplierOptions.value = response.data.suppliers.map((s) => ({
      label: s.name,
      value: s.id,
    }))
    supplierSearch.initializeOptions(supplierOptions.value)
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingSuppliers.value = false
  }
}

const loadCharacteristics = async () => {
  loadingCharacteristics.value = true
  try {
    const currentValues = { ...form.value.characteristics }

    if (!form.value.product_type_id) {
      characteristics.value = []
      return
    }

    const response = await ProductTypesApi.getCharacteristics(form.value.product_type_id)

    if (response.data && Array.isArray(response.data.characteristics)) {
      characteristics.value = response.data.characteristics

      if (!isEdit.value) {
        const newCharacteristics = {}
        characteristics.value.forEach((char) => {
          if (char.default_value !== undefined) {
            let value = char.default_value
            if (char.type === 'date' && value) {
              value = formatDateForInput(value)
            }
            newCharacteristics[char.code] = value
          }
        })
        form.value.characteristics = newCharacteristics
      } else {
        characteristics.value.forEach((char) => {
          if (currentValues[char.code] === undefined && char.default_value !== undefined) {
            let value = char.default_value
            if (char.type === 'date' && value) {
              value = formatDateForInput(value)
            }
            form.value.characteristics[char.code] = value
          } else if (char.type === 'date' && currentValues[char.code]) {
            form.value.characteristics[char.code] = formatDateForInput(currentValues[char.code])
          }
        })
      }
    }
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingCharacteristics.value = false
  }
}

const getCharacteristicRules = (char) => {
  const rules = []

  if (char.is_required) {
    rules.push((val) => !!val || t('validation.required'))
  }

  if (char.type === 'string' && char.validation_rules?.maxLength) {
    rules.push(
      (val) =>
        !val ||
        val.length <= char.validation_rules.maxLength ||
        t('validation.maxLength', { max: char.validation_rules.maxLength }),
    )
  }

  if (char.type === 'number') {
    if (char.validation_rules?.min !== undefined) {
      rules.push(
        (val) =>
          !val ||
          val >= char.validation_rules.min ||
          t('validation.minValue', { min: char.validation_rules.min }),
      )
    }
    if (char.validation_rules?.max !== undefined) {
      rules.push(
        (val) =>
          !val ||
          val <= char.validation_rules.max ||
          t('validation.maxValue', { max: char.validation_rules.max }),
      )
    }
  }

  return rules
}

const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      const editableData = {
        is_own: form.value.is_own,
        characteristics: form.value.characteristics,
        product_type_id: form.value.product_type_id,
      }

      await ProductsApi.updateProduct(props.editData.id, editableData)
      $q.notify({
        color: 'positive',
        message: t('products.updateSuccess'),
        icon: 'check',
      })
      show.value = false
    } else {
      await ProductsApi.createProduct({
        ...form.value,
        created_by: authStore.user.id,
      })
      saveFormToStorage(form.value)
      $q.notify({
        color: 'positive',
        message: t('products.createSuccess'),
        icon: 'check',
      })
      form.value.sku = ''
      nextTick(() => {
        if (skuInput.value) {
          skuInput.value.focus()
        }
      })
      show.value = false
    }
    emit('saved')
  } catch {
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// При створенні нового продукту
const loadNewProductForm = () => {
  const savedForm = loadFormFromStorage()
  form.value = {
    ...defaultForm,
    ...savedForm,
    sku: '',
  }
}

// При редагуванні існуючого продукту
const loadEditProductForm = async (editData) => {
  if (!editData || !editData.id) return

  try {
    const response = await ProductsApi.getProduct(editData.id)

    if (response.data && response.data.product) {
      const productData = response.data.product

      const processedCharacteristics = {}
      if (productData.characteristics) {
        Object.keys(productData.characteristics).forEach((key) => {
          const char = productData.characteristics[key]
          let value = char.value !== undefined ? char.value : null

          // Форматуємо дати для інпуту
          if (char.type === 'date' && value) {
            value = formatDateForInput(value)
          }

          processedCharacteristics[key] = value
        })
      }

      await loadModels(productData.manufacturer_id)
      let selectedModel = modelOptions.value.find((m) => m.value === productData.model_id)

      try {
        const locationResponse = await ProductsApi.getCurrentLocation(productData.id)
        if (locationResponse.data) {
          productData.warehouse_id = locationResponse.data.warehouse_id
        }
      } catch {
        // Помилка обробляється тихо
      }

      form.value = {
        ...defaultForm,
        ...productData,
        characteristics: processedCharacteristics,
      }

      if (selectedModel && selectedModel.product_type_id) {
        form.value.product_type_id = selectedModel.product_type_id
        await loadCharacteristics()

        // Додаткова перевірка форматів дат
        characteristics.value.forEach((char) => {
          if (char.type === 'date' && form.value.characteristics[char.code]) {
            form.value.characteristics[char.code] = formatDateForInput(
              form.value.characteristics[char.code],
            )
          }
        })
      }
    } else {
      form.value = {
        ...defaultForm,
        ...editData,
      }
    }
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })

    form.value = {
      ...defaultForm,
      ...editData,
    }
  }
}

// Відстеження змін
watch(
  () => show.value,
  (newValue) => {
    if (newValue && !isEdit.value) {
      nextTick(() => {
        if (skuInput.value) {
          skuInput.value.focus()
        }
      })
    }
  },
)

watch(
  () => props.editData,
  (newValue) => {
    if (newValue) {
      loadEditProductForm(newValue)
    } else {
      loadNewProductForm()
    }
  },
)

watch(
  () => form.value.manufacturer_id,
  async (newManufacturerId) => {
    if (isEdit.value) return

    form.value.model_id = null
    form.value.product_type_id = null

    if (newManufacturerId) {
      await loadModels(newManufacturerId)
    } else {
      modelOptions.value = []
    }
  },
)

watch(
  () => form.value.model_id,
  async (newModelId) => {
    if (isEdit.value) return

    if (newModelId) {
      const selectedModel = modelOptions.value.find((m) => m.value === newModelId)
      if (selectedModel) {
        if (selectedModel.product_type_id) {
          form.value.product_type_id = selectedModel.product_type_id
          await loadCharacteristics()

          // Перевіряємо формати дат після завантаження характеристик
          characteristics.value.forEach((char) => {
            if (char.type === 'date' && form.value.characteristics[char.code]) {
              form.value.characteristics[char.code] = formatDateForInput(
                form.value.characteristics[char.code],
              )
            }
          })
        }
      }
    }
  },
)

// Завантаження даних при монтуванні компонента
onMounted(() => {
  loadManufacturers()
  loadSuppliers()
  loadWarehouses()

  if (props.editData) {
    loadEditProductForm(props.editData)
  } else {
    loadNewProductForm()
  }
})
</script>
