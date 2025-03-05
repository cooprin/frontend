<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('stock.title') }}</div>
      </q-card-section>
      <q-card-section>
        <!-- Таблиця -->
        <q-table
          v-model:pagination="pagination"
          :rows="stock"
          :columns="columns"
          :loading="loading"
          binary-state-sort
          @request="onRequest"
          row-key="id"
          :rows-per-page-options="pagination.rowsPerPageOptions"
        >
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
              <div class="text-caption">{{ props.row.manufacturer_name }}</div>
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
              <!-- Кнопки для товарів на складі -->
              <template v-if="props.row.current_status === 'in_stock'">
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
                  color="primary"
                  icon="engineering"
                  size="sm"
                  flat
                  dense
                  @click="openInstallDialog(props.row)"
                >
                  <q-tooltip>{{ $t('stock.install') }}</q-tooltip>
                </q-btn>
                <q-btn
                  color="warning"
                  icon="build"
                  size="sm"
                  flat
                  dense
                  @click="openRepairDialog(props.row)"
                >
                  <q-tooltip>{{ $t('stock.sendToRepair') }}</q-tooltip>
                </q-btn>
                <q-btn
                  color="negative"
                  icon="delete"
                  size="sm"
                  flat
                  dense
                  @click="openWriteOffDialog(props.row)"
                >
                  <q-tooltip>{{ $t('stock.writeOff') }}</q-tooltip>
                </q-btn>
              </template>

              <!-- Кнопки для встановлених товарів -->
              <template v-if="props.row.current_status === 'installed'">
                <q-btn
                  color="primary"
                  icon="undo"
                  size="sm"
                  flat
                  dense
                  @click="openUninstallDialog(props.row)"
                >
                  <q-tooltip>{{ $t('stock.uninstall') }}</q-tooltip>
                </q-btn>
              </template>

              <!-- Кнопки для товарів в ремонті -->
              <template v-if="props.row.current_status === 'in_repair'">
                <q-btn
                  color="positive"
                  icon="check"
                  size="sm"
                  flat
                  dense
                  @click="openReturnFromRepairDialog(props.row)"
                >
                  <q-tooltip>{{ $t('stock.returnFromRepair') }}</q-tooltip>
                </q-btn>
              </template>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Діалог переміщення -->
    <q-dialog v-model="showTransferDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.transfer') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onTransfer" class="q-gutter-md">
            <!-- Інформація про продукт -->
            <div class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock?.sku }}</div>
              <div class="text-caption">{{ selectedStock?.model_name }}</div>
              <div class="text-caption">{{ selectedStock?.manufacturer_name }}</div>
            </div>

            <!-- Склад призначення -->
            <q-select
              v-model="transferForm.to_warehouse_id"
              :options="warehouseOptions.filter((w) => w.value !== selectedStock?.warehouse_id)"
              :label="$t('stock.toWarehouse')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
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

    <!-- Діалог встановлення -->
    <q-dialog v-model="showInstallDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.install') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onInstall" class="q-gutter-md">
            <!-- Інформація про продукт -->
            <div class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock?.sku }}</div>
              <div class="text-caption">{{ selectedStock?.model_name }}</div>
              <div class="text-caption">{{ selectedStock?.manufacturer_name }}</div>
            </div>

            <!-- Вибір об'єкту -->
            <q-select
              v-model="installForm.object_id"
              :options="objectOptions"
              :label="$t('stock.object')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Коментар -->
            <q-input
              v-model="installForm.comment"
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

    <!-- Діалог демонтажу -->
    <q-dialog v-model="showUninstallDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.uninstall') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onUninstall" class="q-gutter-md">
            <!-- Інформація про продукт -->
            <div class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock?.sku }}</div>
              <div class="text-caption">{{ selectedStock?.model_name }}</div>
              <div class="text-caption">{{ selectedStock?.manufacturer_name }}</div>
            </div>

            <!-- Вибір складу -->
            <q-select
              v-model="uninstallForm.warehouse_id"
              :options="warehouseOptions"
              :label="$t('stock.warehouse')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Коментар -->
            <q-input
              v-model="uninstallForm.comment"
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

    <!-- Діалог відправки в ремонт -->
    <q-dialog v-model="showRepairDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.sendToRepair') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSendToRepair" class="q-gutter-md">
            <!-- Інформація про продукт -->
            <div class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock?.sku }}</div>
              <div class="text-caption">{{ selectedStock?.model_name }}</div>
              <div class="text-caption">{{ selectedStock?.manufacturer_name }}</div>
            </div>

            <!-- Коментар -->
            <q-input
              v-model="repairForm.comment"
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

    <!-- Діалог повернення з ремонту -->
    <q-dialog v-model="showReturnFromRepairDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.returnFromRepair') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onReturnFromRepair" class="q-gutter-md">
            <!-- Інформація про продукт -->
            <div class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock?.sku }}</div>
              <div class="text-caption">{{ selectedStock?.model_name }}</div>
              <div class="text-caption">{{ selectedStock?.manufacturer_name }}</div>
            </div>

            <!-- Вибір складу -->
            <q-select
              v-model="returnFromRepairForm.warehouse_id"
              :options="warehouseOptions"
              :label="$t('stock.warehouse')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Коментар -->
            <q-input
              v-model="returnFromRepairForm.comment"
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

    <!-- Діалог списання -->
    <q-dialog v-model="showWriteOffDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('stock.writeOff') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onWriteOff" class="q-gutter-md">
            <!-- Інформація про продукт -->
            <div class="q-pa-sm bg-grey-2 rounded-borders">
              <div class="text-weight-medium">{{ selectedStock?.sku }}</div>
              <div class="text-caption">{{ selectedStock?.model_name }}</div>
              <div class="text-caption">{{ selectedStock?.manufacturer_name }}</div>
            </div>

            <!-- Коментар -->
            <q-input
              v-model="writeOffForm.comment"
              :label="$t('stock.comment')"
              type="textarea"
              outlined
              :rules="[(val) => !!val || $t('common.validation.required')]"
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
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { StockApi } from 'src/api/stock'
import { WialonApi } from 'src/api/wialon'
import { WarehousesApi } from 'src/api/warehouses' // API для об'єктів Wialon

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const stock = ref([])
const selectedStock = ref(null)
const warehouseOptions = ref([])
const objectOptions = ref([])

// Dialog visibility
const showTransferDialog = ref(false)
const showInstallDialog = ref(false)
const showUninstallDialog = ref(false)
const showRepairDialog = ref(false)
const showReturnFromRepairDialog = ref(false)
const showWriteOffDialog = ref(false)

// Transfer form
const transferForm = ref({
  to_warehouse_id: null,
  comment: '',
})

// Forms
const installForm = ref({
  object_id: null,
  comment: '',
})

const uninstallForm = ref({
  warehouse_id: null,
  comment: '',
})

const repairForm = ref({
  comment: '',
})

const returnFromRepairForm = ref({
  warehouse_id: null,
  comment: '',
})

const writeOffForm = ref({
  comment: '',
})

// Filters
const filters = ref({
  search: '',
})

// Pagination
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'sku',
  descending: false,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

// Table columns
const columns = computed(() => [
  {
    name: 'product',
    field: (row) => row,
    label: t('stock.product'),
    align: 'left',
    sortable: false,
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
])

// Methods
const loadStock = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
    }

    const response = await StockApi.getStock(params)
    stock.value = response.data.stock
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading data:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadObjects = async () => {
  try {
    const response = await WialonApi.getObjects({
      perPage: 'All',
      status: 'active',
    })
    objectOptions.value = response.data.objects.map((obj) => ({
      label: obj.name,
      value: obj.id,
    }))
  } catch (error) {
    console.error('Error loading objects:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
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
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
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

const openInstallDialog = (stockItem) => {
  selectedStock.value = stockItem
  installForm.value = {
    object_id: null,
    comment: '',
  }
  showInstallDialog.value = true
}

const onInstall = async () => {
  saving.value = true
  try {
    await StockApi.installProduct({
      product_id: selectedStock.value.product_id,
      warehouse_id: selectedStock.value.warehouse_id, // Додайте це поле
      object_id: installForm.value.object_id,
      comment: installForm.value.comment,
    })

    $q.notify({
      color: 'positive',
      message: t('stock.installSuccess'),
      icon: 'check',
    })
    showInstallDialog.value = false
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

// Відкриття діалогів
const openTransferDialog = (stockItem) => {
  selectedStock.value = stockItem
  transferForm.value = {
    to_warehouse_id: null,
    comment: '',
  }
  showTransferDialog.value = true
}

const onTransfer = async () => {
  saving.value = true
  try {
    await StockApi.transferStock({
      product_id: selectedStock.value.product_id,
      from_warehouse_id: selectedStock.value.warehouse_id,
      to_warehouse_id: transferForm.value.to_warehouse_id,
      comment: transferForm.value.comment,
    })

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

const openUninstallDialog = (stockItem) => {
  selectedStock.value = stockItem
  uninstallForm.value = {
    warehouse_id: null,
    comment: '',
  }
  showUninstallDialog.value = true
}

const openRepairDialog = (stockItem) => {
  selectedStock.value = stockItem
  repairForm.value = {
    comment: '',
  }
  showRepairDialog.value = true
}

const openReturnFromRepairDialog = (stockItem) => {
  selectedStock.value = stockItem
  returnFromRepairForm.value = {
    warehouse_id: null,
    comment: '',
  }
  showReturnFromRepairDialog.value = true
}

const openWriteOffDialog = (stockItem) => {
  selectedStock.value = stockItem
  writeOffForm.value = {
    comment: '',
  }
  showWriteOffDialog.value = true
}

// Обробники подій
const onUninstall = async () => {
  saving.value = true
  try {
    await StockApi.uninstallProduct({
      product_id: selectedStock.value.product_id,
      warehouse_id: uninstallForm.value.warehouse_id,
      comment: uninstallForm.value.comment,
    })

    $q.notify({
      color: 'positive',
      message: t('stock.uninstallSuccess'),
      icon: 'check',
    })
    showUninstallDialog.value = false
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

const onSendToRepair = async () => {
  saving.value = true
  try {
    await StockApi.sendToRepair({
      product_id: selectedStock.value.product_id,
      comment: repairForm.value.comment,
      from_warehouse_id: selectedStock.value.warehouse_id,
    })

    $q.notify({
      color: 'positive',
      message: t('stock.sendToRepairSuccess'),
      icon: 'check',
    })
    showRepairDialog.value = false
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

const onReturnFromRepair = async () => {
  saving.value = true
  try {
    await StockApi.returnFromRepair({
      product_id: selectedStock.value.product_id,
      warehouse_id: returnFromRepairForm.value.warehouse_id,
      comment: returnFromRepairForm.value.comment,
    })

    $q.notify({
      color: 'positive',
      message: t('stock.returnFromRepairSuccess'),
      icon: 'check',
    })
    showReturnFromRepairDialog.value = false
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

const onWriteOff = async () => {
  saving.value = true
  try {
    await StockApi.writeOffProduct({
      product_id: selectedStock.value.product_id,
      warehouse_id: selectedStock.value.warehouse_id,
      comment: writeOffForm.value.comment,
    })

    $q.notify({
      color: 'positive',
      message: t('stock.writeOffSuccess'),
      icon: 'check',
    })
    showWriteOffDialog.value = false
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
  loadObjects()
  loadWarehouses()
})
</script>
