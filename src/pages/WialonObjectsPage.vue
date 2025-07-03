<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('wialonObjects.title') }}</div>
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
              <!-- Клієнт -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.client"
                  :options="clientSearch.filteredOptions.value"
                  :label="$t('wialonObjects.filters.client')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => clientSearch.filterOptions(val, update)"
                  @popup-show="clientSearch.resetFilter"
                  :loading="loadingClients"
                />
              </div>

              <!-- Статус -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('wialonObjects.filters.status')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="objects"
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
              :label="$t('wialonObjects.filters.search')"
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
              :label="$t('wialonObjects.add')"
              @click="openCreateDialog"
            >
              <q-tooltip>{{ $t('wialonObjects.add') }}</q-tooltip>
            </q-btn>
          </template>

          <!-- Слот для статусу -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="getStatusColor(props.row.status)" text-color="white" dense>
                {{ $t(`wialonObjects.statuses.${props.row.status}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для тарифу і ціни -->
          <template v-slot:body-cell-tariff="props">
            <q-td :props="props">
              <div>{{ props.row.tariff_name || '-' }}</div>
              <div class="text-caption">{{ formatCurrency(props.row.tariff_price) }}</div>
            </q-td>
          </template>

          <!-- Слот для кількості продуктів -->
          <template v-slot:body-cell-products_count="props">
            <q-td :props="props" class="text-center">
              <q-badge color="primary" :label="props.row.products_count || 0" />
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
                  color="info"
                  icon="swap_horiz"
                  @click="openChangeOwnerDialog(props.row)"
                >
                  <q-tooltip>{{ $t('wialonObjects.ownership.changeOwner') }}</q-tooltip>
                </q-btn>
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
          <span class="q-ml-sm">{{ $t('wialonObjects.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteObject"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <wialon-object-dialog v-model="showDialog" :edit-data="editObject" @saved="loadObjects" />
    <wialon-object-change-owner-dialog
      v-model="showChangeOwnerDialog"
      :object="objectToChangeOwner"
      @saved="loadObjects"
    />
  </q-page>
  <!-- Reports FAB -->
  <ReportsFAB page-identifier="wialon-objects" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { WialonApi } from 'src/api/wialon'
import { ClientsApi } from 'src/api/clients'
import WialonObjectDialog from 'components/wialon/WialonObjectDialog.vue'
import WialonObjectChangeOwnerDialog from 'components/wialon/WialonObjectChangeOwnerDialog.vue'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'
import ReportsFAB from 'src/components/reports/ReportsFAB.vue'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingClients = ref(false)
const showDialog = ref(false)
const showChangeOwnerDialog = ref(false)
const showFilters = ref(false)
const editObject = ref(null)
const objectToChangeOwner = ref(null)
const objects = ref([])
const deleteDialog = ref(false)
const objectToDelete = ref(null)
const clientOptions = ref([])
// Searchable selects
const clientSearch = useSearchableSelect(clientOptions)

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

// Filters
const filters = ref({
  search: '',
  client: null,
  status: null,
})

// Options
const statusOptions = computed(() => [
  { label: t('wialonObjects.statuses.active'), value: 'active' },
  { label: t('wialonObjects.statuses.suspended'), value: 'suspended' },
  { label: t('wialonObjects.statuses.inactive'), value: 'inactive' },
])

// Columns
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('wialonObjects.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'wialon_id',
    label: t('wialonObjects.wialonId'),
    align: 'left',
    field: 'wialon_id',
    sortable: true,
  },
  {
    name: 'client_name',
    label: t('wialonObjects.clientName'),
    align: 'left',
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'status',
    label: t('common.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'tariff',
    label: t('wialonObjects.tariff'),
    align: 'left',
    field: (row) => row.tariff_name,
    sortable: true,
  },
  {
    name: 'products_count',
    label: t('wialonObjects.productsCount'),
    align: 'center',
    field: 'products_count',
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

const loadClients = async () => {
  loadingClients.value = true
  try {
    const response = await ClientsApi.getClients({
      is_active: true,
      perPage: 'All',
    })

    clientOptions.value = response.data.clients.map((client) => ({
      label: client.name,
      value: client.id,
    }))
    clientSearch.initializeOptions(clientOptions.value)
  } catch (error) {
    console.error('Error loading clients:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingClients.value = false
  }
}

const loadObjects = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      client_id: filters.value.client,
      status: filters.value.status,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await WialonApi.getObjects(params)
    objects.value = response.data.objects
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading objects:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    client: null,
    status: null,
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

  await loadObjects()
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    suspended: 'warning',
    inactive: 'grey',
  }
  return colors[status] || 'grey'
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const openDetails = (obj) => {
  router.push({ name: 'wialon-object-details', params: { id: obj.id } })
}

const openCreateDialog = () => {
  editObject.value = null
  showDialog.value = true
}

const openEditDialog = (obj) => {
  editObject.value = obj
  showDialog.value = true
}

const openChangeOwnerDialog = (obj) => {
  objectToChangeOwner.value = obj
  showChangeOwnerDialog.value = true
}

const confirmDelete = (obj) => {
  objectToDelete.value = obj
  deleteDialog.value = true
}

const deleteObject = async () => {
  try {
    await WialonApi.deleteObject(objectToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: t('wialonObjects.deleteSuccess'),
    })
    loadObjects()
  } catch (error) {
    console.error('Error deleting object:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
    })
  }
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadObjects()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadClients()
  loadObjects()
})
</script>

<style scoped>
/* Тут можна додати специфічні стилі для цієї сторінки */
</style>
