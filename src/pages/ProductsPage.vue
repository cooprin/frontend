<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('products.title') }}</div>
          <q-space />
          <q-btn color="primary" icon="add" :label="$t('products.add')" @click="openCreateDialog">
            <q-tooltip>{{ $t('products.add') }} (F7)</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('products.filters.title') }}</div>
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
              <!-- Пошук -->
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="filters.search"
                  :label="$t('products.filters.search')"
                  outlined
                  dense
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <!-- Виробник -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.manufacturer"
                  :options="manufacturerOptions"
                  :label="$t('products.manufacturer')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
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

        <!-- Таблиця -->
        <q-table
          :rows="products"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :selected-rows-label="$t('common.selectedRows')"
          :pagination-label="paginationLabel"
        >
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

// Pagination (як в AuditLogsPage)
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Filters
const filters = ref({
  search: '',
  manufacturer: null,
  status: null,
  isOwn: null,
})

// Options
const statusOptions = computed(() => [
  { label: t('products.statuses.in_stock'), value: 'in_stock' },
  { label: t('products.statuses.installed'), value: 'installed' },
  { label: t('products.statuses.in_repair'), value: 'in_repair' },
  { label: t('products.statuses.written_off'), value: 'written_off' },
])

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
      perPage: pagination.value.rowsPerPage === 0 ? 'All' : pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sort_desc: pagination.value.descending ? 1 : 0,
      ...filters.value,
    }

    const response = await ProductsApi.getProducts(params)
    if (response.data.success) {
      products.value = response.data.products
      pagination.value.rowsNumber = response.data.total
    }
  } catch (error) {
    console.error('Error loading products:', error)
    $q.notify({
      type: 'negative',
      message: t('common.errors.loading'),
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
  } catch (error) {
    console.error('Error loading manufacturers:', error)
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
    status: null,
    isOwn: null,
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
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
  } catch (error) {
    console.error('Error deleting product:', error)
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
      ...filters.value,
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

// Lifecycle
onMounted(() => {
  loadProducts()
  loadManufacturers()
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
</style>

<style scoped>
/* Стилі таблиці */
.groups-table {
  max-height: 400px;
  overflow-y: auto;
}

/* Стилі заголовків таблиці */
:deep(.q-table) thead tr {
  background: var(--q-primary);
}

:deep(.q-table) thead tr th {
  color: white !important;
  font-weight: 600 !important;
  padding: 8px 16px;
}

/* Стилі для темної теми */
.body--dark :deep(.q-table) thead tr {
  background: var(--q-dark);
}

.body--dark :deep(.q-table) thead tr th {
  color: white !important;
}

/* Стилі для рядків при наведенні */
:deep(.q-table) tbody tr:hover {
  background: rgba(var(--q-primary), 0.1);
}

/* Стилі для парних рядків */
:deep(.q-table) tbody tr:nth-child(even) {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark :deep(.q-table) tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.03);
}

/* Стилі для границь таблиці */
:deep(.q-table) {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark :deep(.q-table) {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Додаткові стилі з AuditLogsPage */
:deep(.q-chip) {
  transition: all 0.3s ease;
}

:deep(.q-chip):hover {
  opacity: 0.9;
}

:deep(.q-btn) {
  transition: transform 0.2s ease;
}

:deep(.q-btn):hover {
  transform: scale(1.1);
}

/* Адаптивність */
@media (max-width: 600px) {
  :deep(.q-table) td,
  :deep(.q-table) th {
    padding: 6px 8px;
  }
}
</style>
