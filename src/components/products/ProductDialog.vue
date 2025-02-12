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

const defaultForm = {
  sku: '',
  manufacturer_id: null,
  model_id: null,
  supplier_id: null,
  is_own: true,
  purchase_date: null,
  supplier_warranty_end: null,
  warranty_end: null,
}

const form = ref({ ...defaultForm })

// Методи
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

  if (props.editData) {
    form.value = { ...props.editData }
    loadModels()
  }
})

watch(
  () => props.editData,
  (newValue) => {
    if (newValue) {
      form.value = { ...newValue }
      loadModels()
    } else {
      form.value = { ...defaultForm }
    }
  },
)
</script>
