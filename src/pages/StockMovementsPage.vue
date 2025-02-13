<template>
  <q-page padding>
    <!-- Заголовок -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-md">{{ $t('stock.movements') }}</h5>
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

      <!-- Фільтр по типу операції -->
      <div class="col-12 col-sm-3">
        <q-select
          v-model="filters.type"
          :options="typeOptions"
          :label="$t('stock.filters.type')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>

      <!-- Фільтр по складу відправника -->
      <div class="col-12 col-sm-3">
        <q-select
          v-model="filters.fromWarehouse"
          :options="warehouseOptions"
          :label="$t('stock.filters.fromWarehouse')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>

      <!-- Фільтр по складу отримувача -->
      <div class="col-12 col-sm-3">
        <q-select
          v-model="filters.toWarehouse"
          :options="warehouseOptions"
          :label="$t('stock.filters.toWarehouse')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>

      <!-- Дата з -->
      <div class="col-12 col-sm-3">
        <q-input
          v-model="filters.dateFrom"
          :label="$t('stock.filters.dateFrom')"
          dense
          outlined
          clearable
          type="date"
          @update:model-value="onFiltersChange"
        />
      </div>

      <!-- Дата по -->
      <div class="col-12 col-sm-3">
        <q-input
          v-model="filters.dateTo"
          :label="$t('stock.filters.dateTo')"
          dense
          outlined
          clearable
          type="date"
          @update:model-value="onFiltersChange"
        />
      </div>
    </div>

    <!-- Таблиця -->
    <q-table
      v-model:pagination="pagination"
      :rows="movements"
      :columns="columns"
      :loading="loading"
      :rows-per-page-options="[10, 20, 50, 100]"
      row-key="id"
      flat
      bordered
      @request="onRequest"
    >
      <!-- Слот для продукту -->
      <template v-slot:body-cell-product="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.sku }}</div>
          <div class="text-caption">{{ props.row.model_name }}</div>
        </q-td>
      </template>

      <!-- Слот для типу операції -->
      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-chip :color="getTypeColor(props.row.type)" text-color="white" dense>
            {{ $t(`stock.types.${props.row.type}`) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Слот для коментаря -->
      <template v-slot:body-cell-comment="props">
        <q-td :props="props">
          <q-tooltip v-if="props.row.comment">
            {{ props.row.comment }}
          </q-tooltip>
          <div class="ellipsis" style="max-width: 150px">
            {{ props.row.comment || '-' }}
          </div>
        </q-td>
      </template>

      <!-- Слот для дати -->
      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          {{ formatDateTime(props.row.created_at) }}
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { StockApi } from 'src/api/stock'
import { WarehousesApi } from 'src/api/warehouses'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const movements = ref([])
const warehouseOptions = ref([])

// Фільтри
const filters = ref({
  search: '',
  type: null,
  fromWarehouse: null,
  toWarehouse: null,
  dateFrom: null,
  dateTo: null,
})

// Пагінація
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'created_at',
  descending: true,
})

// Опції для селектів
const typeOptions = [
  { label: t('stock.types.transfer'), value: 'transfer' },
  { label: t('stock.types.install'), value: 'install' },
  { label: t('stock.types.uninstall'), value: 'uninstall' },
  { label: t('stock.types.repair_send'), value: 'repair_send' },
  { label: t('stock.types.repair_return'), value: 'repair_return' },
  { label: t('stock.types.write_off'), value: 'write_off' },
  { label: t('stock.types.stock_in'), value: 'stock_in' },
  { label: t('stock.types.stock_out'), value: 'stock_out' },
]

// Колонки таблиці
const columns = [
  {
    name: 'product',
    field: (row) => row,
    label: t('stock.product'),
    align: 'left',
    sortable: false,
  },
  {
    name: 'type',
    field: 'type',
    label: t('stock.type'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'quantity',
    field: 'quantity',
    label: t('stock.quantity'),
    align: 'right',
    sortable: true,
  },
  {
    name: 'from_warehouse_name',
    field: 'from_warehouse_name',
    label: t('stock.fromWarehouse'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'to_warehouse_name',
    field: 'to_warehouse_name',
    label: t('stock.toWarehouse'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'comment',
    field: 'comment',
    label: t('stock.comment'),
    align: 'left',
    sortable: false,
  },
  {
    name: 'created_by_name',
    field: 'created_by_name',
    label: t('stock.createdBy'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'created_at',
    field: 'created_at',
    label: t('stock.createdAt'),
    align: 'left',
    sortable: true,
  },
]

// Methods
const loadMovements = async () => {
  loading.value = true
  try {
    const response = await StockApi.getMovements({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value,
    })
    movements.value = response.data.movements
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

const loadWarehouses = async () => {
  try {
    const response = await WarehousesApi.getWarehouses({
      isActive: true,
      perPage: 'All',
    })
    warehouseOptions.value = response.data.warehouses.map((w) => ({
      label: w.name,
      value: w.id,
    }))
  } catch (error) {
    console.error('Error loading warehouses:', error)
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadMovements()
}

const onFiltersChange = () => {
  pagination.value.page = 1
  loadMovements()
}

const getTypeColor = (type) => {
  const colors = {
    transfer: 'blue',
    install: 'green',
    uninstall: 'orange',
    repair_send: 'red',
    repair_return: 'purple',
    write_off: 'grey',
    stock_in: 'positive',
    stock_out: 'negative',
  }
  return colors[type] || 'grey'
}

const formatDateTime = (dateTime) => {
  return date.formatDate(dateTime, 'DD.MM.YYYY HH:mm:ss')
}

onMounted(() => {
  loadMovements()
  loadWarehouses()
})
</script>
