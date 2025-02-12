<template>
  <q-page padding>
    <!-- Заголовок і кнопка додавання -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-md">{{ $t('products.title') }}</h5>
      <q-btn color="primary" :label="$t('products.add')" icon="add" @click="openCreateDialog" />
    </div>

    <!-- Фільтри -->
    <div class="row q-col-gutter-sm q-mb-md">
      <!-- Пошук -->
      <div class="col-12 col-sm-3">
        <q-input
          v-model="filters.search"
          :label="$t('common.search')"
          dense
          outlined
          clearable
          @update:model-value="onFiltersChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Фільтр по виробнику -->
      <div class="col-12 col-sm-3">
        <q-select
          v-model="filters.manufacturer"
          :options="manufacturerOptions"
          :label="$t('products.manufacturer')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>

      <!-- Фільтр по статусу -->
      <div class="col-12 col-sm-3">
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          :label="$t('products.status')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>

      <!-- Фільтр власності -->
      <div class="col-12 col-sm-3">
        <q-select
          v-model="filters.isOwn"
          :options="ownOptions"
          :label="$t('products.ownership')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>
    </div>

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
    >
      <!-- Слот для статусу -->
      <template v-slot:body-cell-current_status="props">
        <q-td :props="props">
          <q-chip :color="getStatusColor(props.row.current_status)" text-color="white" dense>
            {{ $t(`products.statuses.${props.row.current_status}`) }}
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
  </q-page>
  <ProductDialog v-model="showDialog" :edit-data="editProduct" @saved="loadProducts" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ProductsApi } from 'src/api/products'
import ProductDialog from 'components/products/ProductDialog.vue'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

const showDialog = ref(false)
const editProduct = ref(null)

// Стани
const loading = ref(false)
const products = ref([])
const deleteDialog = ref(false)
const productToDelete = ref(null)

// Фільтри
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
})

// Опції для селектів
const statusOptions = [
  { label: t('products.statuses.in_stock'), value: 'in_stock' },
  { label: t('products.statuses.installed'), value: 'installed' },
  { label: t('products.statuses.in_repair'), value: 'in_repair' },
  { label: t('products.statuses.written_off'), value: 'written_off' },
]

const ownOptions = [
  { label: t('products.own'), value: true },
  { label: t('products.notOwn'), value: false },
]

const manufacturerOptions = ref([])

// Колонки таблиці
const columns = [
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
    name: 'warranty_end',
    field: 'warranty_end',
    label: t('products.warrantyEnd'),
    align: 'left',
    sortable: true,
    format: (val) => (val ? new Date(val).toLocaleDateString() : '-'),
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    sortable: false,
  },
]

// Методи
const loadProducts = async () => {
  loading.value = true
  try {
    const response = await ProductsApi.getProducts({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      search: filters.value.search,
      manufacturer: filters.value.manufacturer,
      status: filters.value.status,
      isOwn: filters.value.isOwn,
    })
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
  } catch (error) {
    console.error('Error loading manufacturers:', error)
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadProducts()
}

const onFiltersChange = () => {
  pagination.value.page = 1
  loadProducts()
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

// Оновлюємо методи
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
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

onMounted(() => {
  loadProducts()
  loadManufacturers()
})
</script>
