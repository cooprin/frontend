<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('stock.movements') }}</div>
          <q-space />
          <q-btn
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
            flat
            color="primary"
            @click="showFilters = !showFilters"
          />
        </div>

        <!-- Фільтри -->
        <q-slide-transition>
          <div v-show="showFilters">
            <div class="row q-col-gutter-sm q-mb-md">
              <!-- Фільтр по типу операції -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.type"
                  :options="typeOptions"
                  :label="$t('stock.filters.type')"
                  dense
                  outlined
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Фільтр по складу відправника -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.fromWarehouse"
                  :options="fromWarehouseSearch.filteredOptions.value"
                  :label="$t('stock.filters.fromWarehouse')"
                  dense
                  outlined
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => fromWarehouseSearch.filterOptions(val, update)"
                  @popup-show="fromWarehouseSearch.resetFilter"
                />
              </div>

              <!-- Фільтр по складу отримувача -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.toWarehouse"
                  :options="toWarehouseSearch.filteredOptions.value"
                  :label="$t('stock.filters.toWarehouse')"
                  dense
                  outlined
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => toWarehouseSearch.filterOptions(val, update)"
                  @popup-show="toWarehouseSearch.resetFilter"
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
        <!-- Таблиця -->
        <q-table
          v-model:pagination="pagination"
          :rows="movements"
          :columns="columns"
          :loading="loading"
          binary-state-sort
          @request="onRequest"
          row-key="id"
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :pagination-label="paginationLabel"
        >
          <!-- Пошук -->
          <template v-slot:top-right>
            <q-input
              v-model="filters.search"
              :label="$t('common.search')"
              dense
              outlined
              debounce="300"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
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
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { debounce } from 'lodash'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { StockApi } from 'src/api/stock'
import { WarehousesApi } from 'src/api/warehouses'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const exporting = ref(false)
const movements = ref([])
const warehouseOptions = ref([])
// Searchable selects
const fromWarehouseSearch = useSearchableSelect(warehouseOptions)
const toWarehouseSearch = useSearchableSelect(warehouseOptions)

const showFilters = ref(false)

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
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
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

const exportProducts = async () => {
  exporting.value = true
  try {
    const params = {
      search: filters.value.search || undefined,
      type: filters.value.type || undefined,
      fromWarehouse: filters.value.fromWarehouse || undefined,
      toWarehouse: filters.value.toWarehouse || undefined,
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
      export: true,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await StockApi.exportMovements(params)

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `stock-movements-${date.formatDate(Date.now(), 'YYYY-MM-DD')}.xlsx`,
    )
    document.body.appendChild(link)
    link.click()
    link.remove()

    $q.notify({
      type: 'positive',
      message: t('stock.exportSuccess'),
    })
  } catch (error) {
    console.error('Error exporting stock movements:', error)
    $q.notify({
      type: 'negative',
      message: t('stock.exportError'),
    })
  } finally {
    exporting.value = false
  }
}

// Колонки таблиці
const columns = computed(() => [
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
])

// Methods
const loadMovements = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      type: filters.value.type || undefined,
      fromWarehouse: filters.value.fromWarehouse || undefined,
      toWarehouse: filters.value.toWarehouse || undefined,
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await StockApi.getMovements(params)
    movements.value = response.data.movements
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading movements:', error)
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
    fromWarehouseSearch.initializeOptions(warehouseOptions.value)
    toWarehouseSearch.initializeOptions(warehouseOptions.value)
  } catch (error) {
    console.error('Error loading warehouses:', error)
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
  await loadMovements()
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
const clearFilters = () => {
  filters.value = {
    search: '',
    type: null,
    fromWarehouse: null,
    toWarehouse: null,
    dateFrom: null,
    dateTo: null,
  }
}

watch(
  () => ({
    ...filters.value,
    page: pagination.value.page,
    rowsPerPage: pagination.value.rowsPerPage,
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
  }),
  debounce(() => {
    loadMovements()
  }, 300),
  { deep: true },
)

onMounted(() => {
  loadMovements()
  loadWarehouses()
})
</script>
