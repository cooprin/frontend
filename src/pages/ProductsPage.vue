<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('products.title') }}</div>
          <q-space />
          <q-btn
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
            flat
            color="primary"
            @click="showFilters = !showFilters"
          />
        </div>

        <q-slide-transition>
          <div v-show="showFilters">
            <div class="row q-col-gutter-sm q-mb-md">
              <!-- Виробник -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.manufacturer"
                  :options="manufacturerSearch.filteredOptions.value"
                  :label="$t('products.manufacturer')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => manufacturerSearch.filterOptions(val, update)"
                  @popup-show="manufacturerSearch.resetFilter"
                />
              </div>
              <!-- Модель -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.model"
                  :options="modelSearch.filteredOptions.value"
                  :label="$t('products.model')"
                  :disable="!filters.manufacturer"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => modelSearch.filterOptions(val, update)"
                  @popup-show="modelSearch.resetFilter"
                />
              </div>

              <!-- Статус -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('products.status')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Власність -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.isOwn"
                  :options="ownershipOptions"
                  :label="$t('products.ownership')"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
                <q-btn
                  color="secondary"
                  :label="$t('common.export')"
                  @click="exportProducts"
                  :loading="exporting"
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="products"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :selected-rows-label="$t('common.selectedRows')"
          :pagination-label="paginationLabel"
        >
          <!-- Пошук -->
          <template v-slot:top-right>
            <q-input
              v-model="filters.search"
              :label="$t('products.filters.search')"
              outlined
              dense
              debounce="300"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="primary"
              icon="add"
              class="q-ml-md"
              :label="$t('products.add')"
              @click="openCreateDialog"
            >
              <q-tooltip>{{ $t('products.add') }} (F7)</q-tooltip>
            </q-btn>
          </template>
          <!-- Слот для статусу -->
          <template v-slot:body-cell-current_status="props">
            <q-td :props="props">
              <q-chip :color="getStatusColor(props.row.current_status)" text-color="white" dense>
                {{ $t(`products.statuses.${props.row.current_status}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для власності -->
          <template v-slot:body-cell-is_own="props">
            <q-td :props="props">
              <q-chip :color="props.row.is_own ? 'positive' : 'grey'" text-color="white" dense>
                {{ props.row.is_own ? $t('products.own') : $t('products.notOwn') }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для дій -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn-group flat>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="openDetails(props.row)"
                >
                  <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="warning"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Діалоги -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('products.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteProduct"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ProductDialog v-model="showDialog" :edit-data="editProduct" @saved="loadProducts" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ProductsApi } from 'src/api/products'
import ProductDialog from 'components/products/ProductDialog.vue'
import { date } from 'quasar'
import { ModelsApi } from 'src/api/models'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

// State
const loading = ref(false)
const exporting = ref(false)
const showDialog = ref(false)
const showFilters = ref(false)
const editProduct = ref(null)
const products = ref([])
const deleteDialog = ref(false)
const productToDelete = ref(null)
const manufacturerOptions = ref([])
const modelOptions = ref([])
// Searchable selects
const manufacturerSearch = useSearchableSelect(manufacturerOptions)
const modelSearch = useSearchableSelect(modelOptions)

const pagination = ref({
  sortBy: 'sku',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

// Filters
const filters = ref({
  search: '',
  manufacturer: null,
  model: null,
  status: null,
  isOwn: null,
})

const loadModels = async (manufacturerId = null) => {
  try {
    const response = await ModelsApi.getModels({
      manufacturer: manufacturerId,
      isActive: true,
      perPage: 'All',
    })

    if (response.data && Array.isArray(response.data.models)) {
      const filteredModels = manufacturerId
        ? response.data.models.filter((m) => m.manufacturer_id == manufacturerId)
        : response.data.models

      modelOptions.value = filteredModels.map((m) => ({
        label: `${m.name} (${m.product_type_name || 'Тип не вказано'})`,
        value: m.id,
        product_type_id: m.product_type_id,
        product_type_name: m.product_type_name,
        manufacturer_id: m.manufacturer_id,
        manufacturer_name: m.manufacturer_name,
      }))
      modelSearch.initializeOptions(modelOptions.value)
    } else {
      modelOptions.value = []
      modelSearch.initializeOptions([])
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: t('common.errors.loading'),
    })
    modelOptions.value = []
    modelSearch.initializeOptions([])
  }
}

// Options
const statusOptions = computed(() => [
  { label: t('products.statuses.in_stock'), value: 'in_stock' },
  { label: t('products.statuses.installed'), value: 'installed' },
  { label: t('products.statuses.in_repair'), value: 'in_repair' },
  { label: t('products.statuses.written_off'), value: 'written_off' },
])

const formatFiltersForApi = (filters) => {
  return {
    search: filters.search || undefined,
    manufacturer_id: filters.manufacturer || undefined,
    model_id: filters.model || undefined,
    current_status: filters.status || undefined,
    is_own: filters.isOwn === null ? undefined : filters.isOwn,
  }
}

const ownershipOptions = computed(() => [
  { label: t('products.all'), value: null },
  { label: t('products.own'), value: true },
  { label: t('products.notOwn'), value: false },
])

// Columns
const columns = computed(() => [
  {
    name: 'sku',
    required: true,
    label: t('products.sku'),
    align: 'left',
    field: 'sku',
    sortable: true,
  },
  {
    name: 'model_name',
    required: true,
    label: t('products.model'),
    align: 'left',
    field: 'model_name',
    sortable: true,
  },
  {
    name: 'manufacturer_name',
    label: t('products.manufacturer'),
    align: 'left',
    field: 'manufacturer_name',
    sortable: true,
  },
  {
    name: 'current_status',
    label: t('products.status'),
    align: 'left',
    field: 'current_status',
    sortable: true,
  },
  {
    name: 'is_own',
    label: t('products.ownership'),
    align: 'left',
    field: 'is_own',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    sortable: false,
  },
])

// Methods
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      sort_desc: pagination.value.descending ? 1 : 0,
      ...formatFiltersForApi(filters.value),
    }

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await ProductsApi.getProducts(params)
    products.value = response.data.products
    pagination.value.rowsNumber = response.data.total
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadManufacturers = async () => {
  try {
    const response = await ProductsApi.getManufacturers()
    manufacturerOptions.value = response.data.manufacturers.map((m) => ({
      label: m.name,
      value: m.id,
    }))
    manufacturerSearch.initializeOptions(manufacturerOptions.value)
  } catch {
    $q.notify({
      type: 'negative',
      message: t('common.errors.loading'),
    })
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    manufacturer: null,
    model: null,
    status: null,
    isOwn: null,
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value = {
    ...pagination.value,
    page,
    rowsPerPage,
    sortBy,
    descending,
  }

  await loadProducts()
}

const getStatusColor = (status) => {
  const colors = {
    in_stock: 'positive',
    installed: 'info',
    in_repair: 'warning',
    written_off: 'negative',
  }
  return colors[status] || 'grey'
}

const openDetails = (product) => {
  router.push({ name: 'product-details', params: { id: product.id } })
}

const openCreateDialog = () => {
  editProduct.value = null
  showDialog.value = true
}

const openEditDialog = (product) => {
  editProduct.value = product
  showDialog.value = true
}

const confirmDelete = (product) => {
  productToDelete.value = product
  deleteDialog.value = true
}

const deleteProduct = async () => {
  try {
    await ProductsApi.deleteProduct(productToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: t('products.deleteSuccess'),
    })
    loadProducts()
  } catch {
    $q.notify({
      type: 'negative',
      message: t('common.errors.deleting'),
    })
  }
}

const exportProducts = async () => {
  exporting.value = true
  try {
    const response = await ProductsApi.exportProducts({
      ...formatFiltersForApi(filters.value),
      export: true,
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `products-${date.formatDate(Date.now(), 'YYYY-MM-DD')}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    $q.notify({
      type: 'positive',
      message: t('products.exportSuccess'),
    })
  } catch (error) {
    console.error('Error exporting products:', error)
    $q.notify({
      type: 'negative',
      message: t('products.exportError'),
    })
  } finally {
    exporting.value = false
  }
}

// Keyboard shortcuts
const handleKeydown = (e) => {
  if (e.key === 'F7') {
    openCreateDialog()
  }
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadProducts()
  },
  { deep: true },
)

watch(
  () => filters.value.manufacturer,
  async (newManufacturer) => {
    filters.value.model = null

    if (newManufacturer) {
      await loadModels(newManufacturer)
    } else {
      await loadModels()
    }
  },
)

// Lifecycle
onMounted(() => {
  loadProducts()
  loadManufacturers()
  loadModels()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* Загальні стилі для pre блоків з змінами */
.changes-pre {
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.4;
}

/* Стилі для світлої теми */
.body--light .changes-pre {
  background-color: #f5f5f5;
  color: #000;
  border: 1px solid #e0e0e0;
}

/* Стилі для темної теми */
.body--dark .changes-pre {
  background-color: #1d1d1d;
  color: #fff;
  border: 1px solid #333;
}

.body--dark .q-card {
  background: #1d1d1d;
  color: #fff;
}

/* Стилі таблиці */
.groups-table {
  max-height: 400px;
  overflow-y: auto;
}
</style>
