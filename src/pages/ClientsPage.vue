<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('clients.title') }}</div>
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
              <!-- Статус -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.isActive"
                  :options="statusSearch.filteredOptions.value"
                  :label="$t('clients.filters.status')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="300"
                  @filter="
                    (val, update) => statusSearch.filterOptions(val, update, statusOptions.value)
                  "
                  @popup-show="() => statusSearch.resetFilter(statusOptions.value)"
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
                <q-btn
                  color="secondary"
                  :label="$t('common.export')"
                  @click="exportClients"
                  :loading="exporting"
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="clients"
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
              :label="$t('clients.filters.search')"
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
              :label="$t('clients.add')"
              @click="openCreateDialog"
            >
              <q-tooltip>{{ $t('clients.add') }}</q-tooltip>
            </q-btn>
          </template>

          <!-- Слот для статусу -->
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-chip :color="props.row.is_active ? 'positive' : 'grey'" text-color="white" dense>
                {{ props.row.is_active ? $t('common.active') : $t('common.inactive') }}
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
          <span class="q-ml-sm">{{ $t('clients.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteClient"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <client-dialog v-model="showDialog" :edit-data="editClient" @saved="loadClients" />
  </q-page>
  <!-- Reports FAB -->
  <ReportsFAB page-identifier="clients" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ClientsApi } from 'src/api/clients'
import ClientDialog from 'components/clients/ClientDialog.vue'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'
import ReportsFAB from 'src/components/reports/ReportsFAB.vue'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

// State
const loading = ref(false)
const exporting = ref(false)
const showDialog = ref(false)
const showFilters = ref(false)
const editClient = ref(null)
const clients = ref([])
const deleteDialog = ref(false)
const clientToDelete = ref(null)
// Searchable selects
const statusSearch = useSearchableSelect(ref([]))

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
  isActive: null,
})

// Options
const statusOptions = computed(() => [
  { label: t('common.all'), value: null },
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false },
])

// Columns
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('clients.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'contact_person',
    label: t('clients.contactPerson'),
    align: 'left',
    field: 'contact_person',
    sortable: true,
  },
  {
    name: 'email',
    label: t('clients.email'),
    align: 'left',
    field: 'email',
    sortable: true,
  },
  {
    name: 'phone',
    label: t('clients.phone'),
    align: 'left',
    field: 'phone',
    sortable: true,
  },
  {
    name: 'objects_count',
    label: t('clients.objectsCount'),
    align: 'center',
    field: 'objects_count',
    sortable: true,
  },
  {
    name: 'is_active',
    label: t('common.status'),
    align: 'center',
    field: 'is_active',
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
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      is_active: filters.value.isActive,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await ClientsApi.getClients(params)
    clients.value = response.data.clients
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading clients:', error)
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
    isActive: undefined,
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

  await loadClients()
}

const openDetails = (client) => {
  router.push({ name: 'client-details', params: { id: client.id } })
}

const openCreateDialog = () => {
  editClient.value = null
  showDialog.value = true
}

const openEditDialog = (client) => {
  editClient.value = client
  showDialog.value = true
}

const confirmDelete = (client) => {
  clientToDelete.value = client
  deleteDialog.value = true
}

const deleteClient = async () => {
  try {
    await ClientsApi.deleteClient(clientToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: t('clients.deleteSuccess'),
    })
    loadClients()
  } catch (error) {
    console.error('Error deleting client:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
    })
  }
}

const exportClients = async () => {
  exporting.value = true
  try {
    // Майбутня реалізація експорту
    $q.notify({
      type: 'positive',
      message: 'Export functionality will be implemented soon',
    })
  } catch (error) {
    console.error('Error exporting clients:', error)
    $q.notify({
      type: 'negative',
      message: 'Export error',
    })
  } finally {
    exporting.value = false
  }
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadClients()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadClients()
  statusSearch.initializeOptions(statusOptions.value)
})
</script>
