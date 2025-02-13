<template>
  <q-page padding>
    <!-- Заголовок і кнопки -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-md">{{ $t('stock.title') }}</h5>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          :label="$t('stock.transfer')"
          icon="swap_horiz"
          @click="openTransferDialog"
        />
        <q-btn color="primary" :label="$t('stock.adjust')" icon="edit" @click="openAdjustDialog" />
      </div>
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

      <!-- Фільтр по складу -->
      <div class="col-12 col-sm-3">
        <q-select
          v-model="filters.warehouse"
          :options="warehouseOptions"
          :label="$t('stock.warehouse')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
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

      <!-- Фільтр по мінімальній кількості -->
      <div class="col-12 col-sm-3">
        <q-input
          v-model.number="filters.minQuantity"
          type="number"
          :label="$t('stock.filters.minQuantity')"
          dense
          outlined
          clearable
          @update:model-value="onFiltersChange"
        />
      </div>
    </div>

    <!-- Таблиця -->
    <q-table
      v-model:pagination="pagination"
      :rows="stock"
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
          <div class="text-caption">{{ props.row.manufacturer_name }}</div>
        </q-td>
      </template>

      <!-- Слот для кількості -->
      <template v-slot:body-cell-quantity="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.quantity }}</div>
        </q-td>
      </template>

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
            icon="swap_horiz"
            size="sm"
            flat
            dense
            @click="openTransferDialog(props.row)"
          >
            <q-tooltip>{{ $t('stock.transfer') }}</q-tooltip>
          </q-btn>
          <q-btn
            color="warning"
            icon="edit"
            size="sm"
            flat
            dense
            @click="openAdjustDialog(props.row)"
          >
            <q-tooltip>{{ $t('stock.adjust') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Діалог переміщення -->
    <q-dialog v-model="showTransferDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.transfer') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onTransfer" class="q-gutter-md">
            <!-- Продукт -->
            <div v-if="!selectedStock">
              <q-select
                v-model="transferForm.product_id"
                :options="productOptions"
                :label="$t('stock.product')"
                :rules="[(val) => !!val || $t('common.validation.required')]"
                outlined
                emit-value
                map-options
                @update:model-value="loadProductStock"
              />
            </div>
            <div v-else class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock.sku }}</div>
              <div class="text-caption">{{ selectedStock.model_name }}</div>
              <div class="text-caption">{{ selectedStock.manufacturer_name }}</div>
            </div>

            <!-- Склад відправник -->
            <q-select
              v-model="transferForm.from_warehouse_id"
              :options="warehouseOptions"
              :label="$t('stock.fromWarehouse')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Склад отримувач -->
            <q-select
              v-model="transferForm.to_warehouse_id"
              :options="warehouseOptions"
              :label="$t('stock.toWarehouse')"
              :rules="[
                (val) => !!val || $t('common.validation.required'),
                (val) => val !== transferForm.from_warehouse_id || $t('stock.sameWarehouse'),
              ]"
              outlined
              emit-value
              map-options
            />

            <!-- Кількість -->
            <q-input
              v-model.number="transferForm.quantity"
              type="number"
              :label="$t('stock.quantity')"
              :rules="[
                (val) => !!val || $t('common.validation.required'),
                (val) => val > 0 || $t('stock.positiveQuantity'),
              ]"
              outlined
            />

            <!-- Коментар -->
            <q-input
              v-model="transferForm.comment"
              :label="$t('stock.comment')"
              type="textarea"
              outlined
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог коригування -->
    <q-dialog v-model="showAdjustDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.adjust') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onAdjust" class="q-gutter-md">
            <!-- Продукт -->
            <div v-if="!selectedStock">
              <q-select
                v-model="adjustForm.product_id"
                :options="productOptions"
                :label="$t('stock.product')"
                :rules="[(val) => !!val || $t('common.validation.required')]"
                outlined
                emit-value
                map-options
              />
            </div>
            <div v-else class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock.sku }}</div>
              <div class="text-caption">{{ selectedStock.model_name }}</div>
              <div class="text-caption">{{ selectedStock.manufacturer_name }}</div>
            </div>

            <!-- Склад -->
            <q-select
              v-model="adjustForm.warehouse_id"
              :options="warehouseOptions"
              :label="$t('stock.warehouse')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Тип операції -->
            <q-select
              v-model="adjustForm.type"
              :options="adjustmentTypes"
              :label="$t('stock.type')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Кількість -->
            <q-input
              v-model.number="adjustForm.quantity"
              type="number"
              :label="$t('stock.quantity')"
              :rules="[
                (val) => !!val || $t('common.validation.required'),
                (val) => val > 0 || $t('stock.positiveQuantity'),
              ]"
              outlined
            />

            <!-- Коментар -->
            <q-input
              v-model="adjustForm.comment"
              :label="$t('stock.comment')"
              type="textarea"
              outlined
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { StockApi } from 'src/api/stock'
import { ProductsApi } from 'src/api/products'
import { WarehousesApi } from 'src/api/warehouses'
import { ManufacturersApi } from 'src/api/manufacturers'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const stock = ref([])
const showTransferDialog = ref(false)
const showAdjustDialog = ref(false)
const selectedStock = ref(null)
const warehouseOptions = ref([])
const manufacturerOptions = ref([])
const productOptions = ref([])

// Form
const defaultTransferForm = {
  product_id: null,
  from_warehouse_id: null,
  to_warehouse_id: null,
  quantity: null,
  comment: '',
}

const defaultAdjustForm = {
  product_id: null,
  warehouse_id: null,
  type: null,
  quantity: null,
  comment: '',
}

const transferForm = ref({ ...defaultTransferForm })
const adjustForm = ref({ ...defaultAdjustForm })

// Фільтри
const filters = ref({
  search: '',
  warehouse: null,
  manufacturer: null,
  minQuantity: null,
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
const adjustmentTypes = [
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
    name: 'quantity',
    field: 'quantity',
    label: t('stock.quantity'),
    align: 'right',
    sortable: true,
  },
  {
    name: 'warehouse_name',
    field: 'warehouse_name',
    label: t('stock.warehouse'),
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
]

// Methods
const loadStock = async () => {
  loading.value = true
  try {
    const response = await StockApi.getStock({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value,
    })
    stock.value = response.data.stock
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

const loadManufacturers = async () => {
  try {
    const response = await ManufacturersApi.getManufacturers({
      isActive: true,
      perPage: 'All',
    })
    manufacturerOptions.value = response.data.manufacturers.map((m) => ({
      label: m.name,
      value: m.id,
    }))
  } catch (error) {
    console.error('Error loading manufacturers:', error)
  }
}

const loadProducts = async () => {
  try {
    const response = await ProductsApi.getProducts({
      isActive: true,
      perPage: 'All',
    })
    productOptions.value = response.data.products.map((p) => ({
      label: `${p.sku} - ${p.model_name}`,
      value: p.id,
    }))
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadStock()
}

const onFiltersChange = () => {
  pagination.value.page = 1
  loadStock()
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

const openTransferDialog = (stockItem = null) => {
  selectedStock.value = stockItem
  if (stockItem) {
    transferForm.value = {
      ...defaultTransferForm,
      product_id: stockItem.product_id,
      from_warehouse_id: stockItem.warehouse_id,
    }
  } else {
    transferForm.value = { ...defaultTransferForm }
  }
  showTransferDialog.value = true
}

const openAdjustDialog = (stockItem = null) => {
  selectedStock.value = stockItem
  if (stockItem) {
    adjustForm.value = {
      ...defaultAdjustForm,
      product_id: stockItem.product_id,
      warehouse_id: stockItem.warehouse_id,
    }
  } else {
    adjustForm.value = { ...defaultAdjustForm }
  }
  showAdjustDialog.value = true
}

const onTransfer = async () => {
  saving.value = true
  try {
    await StockApi.transferStock(transferForm.value)
    $q.notify({
      color: 'positive',
      message: t('stock.transferSuccess'),
      icon: 'check',
    })
    showTransferDialog.value = false
    loadStock()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const onAdjust = async () => {
  saving.value = true
  try {
    await StockApi.adjustStock(adjustForm.value)
    $q.notify({
      color: 'positive',
      message: t('stock.adjustSuccess'),
      icon: 'check',
    })
    showAdjustDialog.value = false
    loadStock()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadStock()
  loadWarehouses()
  loadManufacturers()
  loadProducts()
})
</script>
