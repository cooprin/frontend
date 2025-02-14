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
                    :rules="[(val) => !!val || t('validation.required')]"
                    outlined
                    :disable="isEdit"
                  />

                  <!-- Виробник -->
                  <q-select
                    v-model="form.manufacturer_id"
                    :options="manufacturerOptions"
                    :label="t('products.manufacturer')"
                    :rules="[(val) => !!val || t('validation.required')]"
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
                    outlined
                    emit-value
                    map-options
                    @update:model-value="loadCharacteristics"
                  />

                  <!-- Власний/Невласний -->
                  <q-toggle v-model="form.is_own" :label="t('products.isOwn')" />

                  <!-- Дата покупки -->
                  <q-input
                    v-model="form.purchase_date"
                    :label="t('products.purchaseDate')"
                    outlined
                    type="date"
                  />

                  <!-- Дата закінчення гарантії від постачальника -->
                  <q-input
                    v-model="form.supplier_warranty_end"
                    :label="t('products.supplierWarrantyEnd')"
                    outlined
                    type="date"
                  />

                  <!-- Дата закінчення гарантії -->
                  <q-input
                    v-model="form.warranty_end"
                    :label="t('products.warrantyEnd')"
                    outlined
                    type="date"
                  />
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
                        :rules="
                          char.is_required ? [(val) => !!val || t('validation.required')] : []
                        "
                        outlined
                      />

                      <!-- Number характеристика -->
                      <q-input
                        v-else-if="char.type === 'number'"
                        v-model.number="form.characteristics[char.code]"
                        type="number"
                        :label="char.name"
                        :rules="
                          char.is_required ? [(val) => !!val || t('validation.required')] : []
                        "
                        outlined
                      />

                      <!-- Date характеристика -->
                      <q-input
                        v-else-if="char.type === 'date'"
                        v-model="form.characteristics[char.code]"
                        type="date"
                        :label="char.name"
                        :rules="
                          char.is_required ? [(val) => !!val || t('validation.required')] : []
                        "
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
                        :rules="
                          char.is_required ? [(val) => !!val || t('validation.required')] : []
                        "
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
import { ProductTypesApi } from 'src/api/product-types'

const $q = useQuasar()
const { t } = useI18n()
const emit = defineEmits(['close', 'saved'])

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

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)
const loading = ref(false)
const manufacturerOptions = ref([])
const modelOptions = ref([])
const supplierOptions = ref([])
const productTypeOptions = ref([])
const characteristics = ref([])

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

// Methods
const loadManufacturers = async () => {
  try {
    const response = await ProductsApi.getManufacturers()
    manufacturerOptions.value = response.data.manufacturers.map((m) => ({
      label: m.name,
      value: m.id,
    }))
  } catch (error) {
    console.error('Error loading manufacturers:', error)
  }
}

const loadSuppliers = async () => {
  try {
    const response = await ProductsApi.getSuppliers()
    supplierOptions.value = response.data.suppliers.map((s) => ({
      label: s.name,
      value: s.id,
    }))
  } catch (error) {
    console.error('Error loading suppliers:', error)
  }
}

const loadModels = async () => {
  try {
    form.value.model_id = null
    if (!form.value.manufacturer_id) {
      modelOptions.value = []
      return
    }
    const response = await ProductsApi.getModels(form.value.manufacturer_id)
    modelOptions.value = response.data.models.map((m) => ({
      label: m.name,
      value: m.id,
    }))
  } catch (error) {
    console.error('Error loading models:', error)
  }
}

const loadProductTypes = async () => {
  try {
    const response = await ProductTypesApi.getProductTypes({
      isActive: true,
      perPage: 'All',
    })
    productTypeOptions.value = response.data.productTypes.map((t) => ({
      label: t.name,
      value: t.id,
    }))
  } catch (error) {
    console.error('Error loading product types:', error)
  }
}

const loadCharacteristics = async () => {
  try {
    form.value.characteristics = {}
    if (!form.value.product_type_id) {
      characteristics.value = []
      return
    }
    const response = await ProductTypesApi.getCharacteristics(form.value.product_type_id)
    characteristics.value = response.data.characteristics

    // Встановлюємо значення за замовчуванням
    characteristics.value.forEach((char) => {
      if (char.default_value) {
        form.value.characteristics[char.code] = char.default_value
      }
    })
  } catch (error) {
    console.error('Error loading characteristics:', error)
  }
}

const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await ProductsApi.updateProduct(props.editData.id, form.value)
    } else {
      await ProductsApi.createProduct(form.value)
    }

    $q.notify({
      color: 'positive',
      message: t(`products.${isEdit.value ? 'updateSuccess' : 'createSuccess'}`),
      icon: 'check',
    })

    emit('saved')
    show.value = false
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

// Життєвий цикл
onMounted(() => {
  loadManufacturers()
  loadSuppliers()
  loadProductTypes()

  if (props.editData) {
    form.value = { ...props.editData }
    loadModels()
    loadCharacteristics()
  }
})

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
</script>
