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
                  />

                  <!-- Виробник -->
                  <q-select
                    v-model="form.manufacturer_id"
                    :options="manufacturerOptions"
                    :label="t('products.manufacturer')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingManufacturers"
                    outlined
                    emit-value
                    map-options
                    @update:model-value="loadModels"
                  />

                  <!-- Модель -->
                  <q-select
                    v-model="form.model_id"
                    :options="modelOptions"
                    :label="t('products.model')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingModels"
                    outlined
                    emit-value
                    map-options
                    :disable="!form.manufacturer_id"
                  />

                  <!-- Постачальник -->
                  <q-select
                    v-model="form.supplier_id"
                    :options="supplierOptions"
                    :label="t('products.supplier')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingSuppliers"
                    outlined
                    emit-value
                    map-options
                  />

                  <!-- Тип продукту -->
                  <q-select
                    v-model="form.product_type_id"
                    :options="productTypeOptions"
                    :label="t('products.type')"
                    :rules="[(val) => !!val || t('validation.required')]"
                    :loading="loadingProductTypes"
                    outlined
                    emit-value
                    map-options
                    @update:model-value="loadCharacteristics"
                  />

                  <!-- Власний/Невласний -->
                  <q-toggle v-model="form.is_own" :label="t('products.isOwn')" />

                  <!-- Дати -->
                  <div class="row q-col-gutter-sm">
                    <!-- Дата покупки -->
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="form.purchase_date"
                        :label="t('products.purchaseDate')"
                        :rules="[(val) => !!val || t('validation.required'), validatePurchaseDate]"
                        outlined
                        type="date"
                        :max="today"
                      />
                    </div>

                    <!-- Дата закінчення гарантії від постачальника -->
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="form.supplier_warranty_end"
                        :label="t('products.supplierWarrantyEnd')"
                        :rules="[validateSupplierWarrantyDate]"
                        outlined
                        type="date"
                        :min="form.purchase_date"
                      />
                    </div>

                    <!-- Дата закінчення гарантії -->
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="form.warranty_end"
                        :label="t('products.warrantyEnd')"
                        :rules="[validateWarrantyDate]"
                        outlined
                        type="date"
                        :min="form.purchase_date"
                      />
                    </div>
                  </div>
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
                      <q-input
                        v-else-if="char.type === 'date'"
                        v-model="form.characteristics[char.code]"
                        type="date"
                        :label="char.name"
                        :rules="getCharacteristicRules(char)"
                        :min="char.validation_rules?.min"
                        :max="char.validation_rules?.max"
                        outlined
                      />

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
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ProductsApi } from 'src/api/products'
import { ModelsApi } from 'src/api/models'
import { SuppliersApi } from 'src/api/suppliers'
import { ProductTypesApi } from 'src/api/product-types'

const $q = useQuasar()
const { t } = useI18n()
const emit = defineEmits(['update:modelValue', 'saved'])

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

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)
const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

// State
const loading = ref(false)
const loadingManufacturers = ref(false)
const loadingModels = ref(false)
const loadingSuppliers = ref(false)
const loadingProductTypes = ref(false)
const loadingCharacteristics = ref(false)
const manufacturerOptions = ref([])
const modelOptions = ref([])
const supplierOptions = ref([])
const productTypeOptions = ref([])
const characteristics = ref([])

// Default form
const defaultForm = {
  sku: '',
  manufacturer_id: null,
  model_id: null,
  supplier_id: null,
  product_type_id: null,
  is_own: true,
  purchase_date: null,
  supplier_warranty_end: null,
  warranty_end: null,
  characteristics: {},
}

const form = ref({ ...defaultForm })

// Lifecycle hooks
onMounted(async () => {
  // Спочатку завантажуємо всі довідники
  await Promise.all([loadManufacturers(), loadSuppliers(), loadProductTypes()])

  // Якщо це редагування, заповнюємо форму даними
  if (props.editData) {
    form.value = {
      ...defaultForm,
      ...props.editData,
      characteristics: props.editData.characteristics || {},
    }

    // Завантажуємо залежні дані
    if (form.value.manufacturer_id) {
      await loadModels()
    }
    if (form.value.product_type_id) {
      await loadCharacteristics()
    }
  }
})

// Validation Methods
const validatePurchaseDate = (val) => {
  if (!val) return true
  const date = new Date(val)
  return date <= new Date() || t('validation.futureDateNotAllowed')
}

const validateSupplierWarrantyDate = (val) => {
  if (!val || !form.value.purchase_date) return true
  const date = new Date(val)
  const purchaseDate = new Date(form.value.purchase_date)
  return date >= purchaseDate || t('validation.warrantyBeforePurchase')
}

const validateWarrantyDate = (val) => {
  if (!val || !form.value.purchase_date) return true
  if (!form.value.supplier_warranty_end) return true
  const date = new Date(val)
  const purchaseDate = new Date(form.value.purchase_date)
  const supplierWarrantyDate = new Date(form.value.supplier_warranty_end)
  if (date < purchaseDate) return t('validation.warrantyBeforePurchase')
  if (date < supplierWarrantyDate) return t('validation.warrantyBeforeSupplierWarranty')
  return true
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

// Data Loading Methods
const loadManufacturers = async () => {
  loadingManufacturers.value = true
  try {
    const response = await ProductsApi.getManufacturers({
      isActive: true,
      perPage: 'All',
    })
    manufacturerOptions.value = response.data.manufacturers.map((m) => ({
      label: m.name,
      value: m.id,
    }))
  } catch (error) {
    console.error('Error loading manufacturers:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingManufacturers.value = false
  }
}

const loadSuppliers = async () => {
  loadingSuppliers.value = true
  try {
    const response = await SuppliersApi.getSuppliers({
      is_active: true, // Змінено з isActive на is_active
      per_page: 'All', // Змінено з perPage на per_page
    })

    // Перевіряємо повну структуру відповіді
    console.log('Suppliers response:', response)

    if (response.data && Array.isArray(response.data.suppliers)) {
      supplierOptions.value = response.data.suppliers.map((s) => ({
        label: s.name,
        value: s.id,
      }))
      console.log('Supplier options:', supplierOptions.value)
    } else {
      console.error('Unexpected suppliers response format:', response.data)
    }
  } catch (error) {
    console.error('Error loading suppliers:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingSuppliers.value = false
  }
}

const loadModels = async () => {
  loadingModels.value = true
  try {
    form.value.model_id = null
    modelOptions.value = []

    if (!form.value.manufacturer_id) {
      return
    }

    const response = await ModelsApi.getModels({
      manufacturer_id: form.value.manufacturer_id, // Змінено з manufacturerId на manufacturer_id
      is_active: true, // Змінено з isActive на is_active
      per_page: 'All', // Змінено з perPage на per_page
    })

    if (response.data && Array.isArray(response.data.models)) {
      modelOptions.value = response.data.models.map((m) => ({
        label: m.name,
        value: m.id,
      }))
    } else {
      console.error('Unexpected response format:', response.data)
    }
  } catch (error) {
    console.error('Error loading models:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingModels.value = false
  }
}
const loadProductTypes = async () => {
  loadingProductTypes.value = true
  try {
    const response = await ProductTypesApi.getProductTypes({
      is_active: true, // Змінено з isActive на is_active
      per_page: 'All', // Змінено з perPage на per_page
    })

    // Перевіряємо повну структуру відповіді
    console.log('Product types response:', response)

    if (response.data && Array.isArray(response.data.productTypes)) {
      productTypeOptions.value = response.data.productTypes.map((t) => ({
        label: t.name,
        value: t.id,
      }))
      console.log('Product type options:', productTypeOptions.value)
    } else {
      console.error('Unexpected product types response format:', response.data)
    }
  } catch (error) {
    console.error('Error loading product types:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingProductTypes.value = false
  }
}

const loadCharacteristics = async () => {
  loadingCharacteristics.value = true
  try {
    form.value.characteristics = {}
    if (!form.value.product_type_id) {
      characteristics.value = []
      return
    }

    const response = await ProductTypesApi.getCharacteristics(form.value.product_type_id)

    // Перевіряємо структуру відповіді
    if (response.data && Array.isArray(response.data.characteristics)) {
      characteristics.value = response.data.characteristics

      // Set default values
      characteristics.value.forEach((char) => {
        if (char.default_value !== undefined) {
          form.value.characteristics[char.code] = char.default_value
        }
      })
    } else {
      console.error('Unexpected response format:', response.data)
    }
  } catch (error) {
    console.error('Error loading characteristics:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingCharacteristics.value = false
  }
}

// Form Submission
const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await ProductsApi.updateProduct(props.editData.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('products.updateSuccess'),
        icon: 'check',
      })
    } else {
      await ProductsApi.createProduct(form.value)
      $q.notify({
        color: 'positive',
        message: t('products.createSuccess'),
        icon: 'check',
      })
    }

    emit('saved')
    show.value = false
  } catch (error) {
    console.error('Error saving product:', error)
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}
// Watchers
watch(
  () => props.editData,
  (newValue) => {
    if (newValue) {
      form.value = { ...newValue }
      loadModels()
      loadCharacteristics()
    } else {
      form.value = { ...defaultForm }
    }
  },
)

// Lifecycle
onMounted(() => {
  loadManufacturers()
  loadSuppliers()
  loadProductTypes()

  if (props.editData) {
    form.value = { ...props.editData }
    // Завантажуємо моделі та характеристики тільки якщо є необхідні ID
    if (form.value.manufacturer_id) {
      loadModels()
    }
    if (form.value.product_type_id) {
      loadCharacteristics()
    }
  }
})

watch(
  () => props.editData,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...defaultForm,
        ...newValue,
        characteristics: newValue.characteristics || {},
      }
      if (form.value.manufacturer_id) {
        loadModels()
      }
      if (form.value.product_type_id) {
        loadCharacteristics()
      }
    } else {
      form.value = { ...defaultForm }
    }
  },
)

// watcher for manufacturer_id changes
watch(
  () => form.value.manufacturer_id,
  (newValue) => {
    if (newValue) {
      loadModels()
    } else {
      modelOptions.value = []
    }
  },
)

// watcher for product_type_id changes
watch(
  () => form.value.product_type_id,
  (newValue) => {
    if (newValue) {
      loadCharacteristics()
    } else {
      characteristics.value = []
    }
  },
)
</script>
