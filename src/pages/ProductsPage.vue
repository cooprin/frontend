<template>
  <q-page padding>
    <!-- Заголовок і кнопка додавання -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-none">{{ $t('products.title') }}</h5>
      <q-btn color="primary" :label="$t('products.add')" icon="add" @click="openCreateDialog">
        <q-tooltip> {{ $t('products.add') }} (F7) </q-tooltip>
      </q-btn>
    </div>

    <!-- Фільтри -->
    <ProductFilters
      v-model:filters="filters"
      :manufacturer-options="manufacturerOptions"
      :exporting="exporting"
      @export="exportProducts"
      class="q-mb-md"
    />

    <!-- Таблиця -->
    <q-table
      v-model:pagination="pagination"
      :rows="products"
      :columns="columns"
      :loading="loading"
      :rows-per-page-options="[10, 20, 50, 100]"
      row-key="id"
      flat
      bordered
      @request="onRequest"
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
        <q-td :props="props" class="q-gutter-sm">
          <q-btn
            color="primary"
            icon="visibility"
            size="sm"
            flat
            dense
            @click="openDetails(props.row)"
          >
            <q-tooltip>{{ $t('common.view') }}</q-tooltip>
          </q-btn>
          <q-btn
            color="warning"
            icon="edit"
            size="sm"
            flat
            dense
            @click="openEditDialog(props.row)"
          >
            <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
          </q-btn>
          <q-btn
            color="negative"
            icon="delete"
            size="sm"
            flat
            dense
            @click="confirmDelete(props.row)"
          >
            <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Діалог підтвердження видалення -->
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

    <!-- Діалог створення/редагування -->
    <ProductDialog v-model="showDialog" :edit-data="editProduct" @saved="loadProducts" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ProductsApi } from 'src/api/products'
import { debounce } from 'lodash'
import ProductDialog from 'components/products/ProductDialog.vue'
import ProductFilters from 'components/products/ProductFilters.vue'
import { date } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const { t, locale } = useI18n()
const exporting = ref(false)
const showDialog = ref(false)
const editProduct = ref(null)

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

const handleKeydown = (e) => {
  if (e.key === 'F7') {
    openCreateDialog()
  }
}

// Стани
const loading = ref(false)
const products = ref([])
const deleteDialog = ref(false)
const productToDelete = ref(null)
const manufacturerOptions = ref([])

// Фільтри
const formatFiltersForApi = (filters) => {
  return {
    search: filters.search || undefined,
    manufacturer_id: filters.manufacturer || undefined,
    current_status: filters.status || undefined,
    is_own: filters.isOwn,
  }
}

const filters = ref({
  search: '',
  manufacturer: null,
  status: null,
  isOwn: null,
})

// Пагінація
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'sku',
  descending: false,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Computed
const columns = computed(() => [
  {
    name: 'sku',
    field: 'sku',
    label: t('products.sku'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'model_name',
    field: 'model_name',
    label: t('products.model'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'manufacturer_name',
    field: 'manufacturer_name',
    label: t('products.manufacturer'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'current_status',
    field: 'current_status',
    label: t('products.status'),
    align: 'left',
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
      per_page: pagination.value.rowsPerPage,
      sort_by: pagination.value.sortBy || 'sku', // додаємо дефолтне значення
      sort_desc: pagination.value.descending || false, // додаємо дефолтне значення
      ...formatFiltersForApi(filters.value),
    }

    // Видаляємо undefined значення
    Object.keys(params).forEach(
      (key) => (params[key] === undefined || params[key] === null) && delete params[key],
    )

    const response = await ProductsApi.getProducts(params)
    products.value = response.data.products
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading products:', error)
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
  } catch (error) {
    console.error('Error loading manufacturers:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
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
      color: 'positive',
      message: t('products.deleteSuccess'),
      icon: 'check',
    })
    loadProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

// Watchers
watch(locale, () => {
  loadProducts()
})

watch(
  filters,
  debounce(() => {
    pagination.value.page = 1
    loadProducts()
  }, 300),
  { deep: true },
)
watch(
  pagination,
  () => {
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

<style scoped>
/* Стилі для світлої теми */
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

/* Стилі для ховера рядків */
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

/* Стилі для клітинок таблиці */
:deep(.q-table) td {
  padding: 8px 16px;
}

/* Стилі для границь таблиці */
:deep(.q-table) {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark :deep(.q-table) {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Стилі для розділових ліній */
:deep(.q-table) th,
:deep(.q-table) td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark :deep(.q-table) th,
.body--dark :deep(.q-table) td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
