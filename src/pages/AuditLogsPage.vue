<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('pages.auditLogs.title') }}</div>
      </q-card-section>

      <q-card-section>
        <!-- Фільтри -->
        <div class="row q-col-gutter-sm q-mb-md">
          <!-- Пошук -->
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filters.search"
              :label="$t('pages.auditLogs.search')"
              outlined
              dense
              clearable
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Тип дії -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.actionType"
              :options="actionTypeOptions"
              :label="$t('pages.auditLogs.actionType')"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- Тип сутності -->
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.entityType"
              :options="entityTypeOptions"
              :label="$t('pages.auditLogs.entityType')"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- Діапазон дат -->
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filters.dateFrom"
              :label="$t('pages.auditLogs.dateFrom')"
              outlined
              dense
              type="date"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filters.dateTo"
              :label="$t('pages.auditLogs.dateTo')"
              outlined
              dense
              type="date"
            />
          </div>

          <!-- Кнопка очистки фільтрів -->
          <div class="col-12 col-sm-3 q-gutter-x-sm">
            <q-btn
              color="primary"
              :label="$t('pages.auditLogs.clearFilters')"
              @click="clearFilters"
            />
          </div>
        </div>

        <!-- Таблиця -->
        <q-table
          :rows="logs"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :selected-rows-label="$t('common.selectedRows')"
          :pagination-label="paginationLabel"
          @update:pagination="onRequest"
        >
          <!-- Форматування дати -->
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.value) }}
            </q-td>
          </template>

          <!-- Форматування типу дії -->
          <template v-slot:body-cell-action_type="props">
            <q-td :props="props">
              <q-chip :color="getActionColor(props.value)" text-color="white" dense>
                {{ formatActionType(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Кнопка перегляду змін -->
          <template v-slot:body-cell-changes="props">
            <q-td :props="props" class="text-center">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                @click="showChanges(props.row)"
              >
                <q-tooltip>{{ $t('pages.auditLogs.viewChanges') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Діалог для перегляду змін -->
    <q-dialog v-model="changesDialog" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('pages.auditLogs.changes') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-gutter-md">
            <!-- Інформація про дію -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">{{ $t('pages.auditLogs.actionInfo') }}</div>
              <q-list bordered class="rounded-borders">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('pages.auditLogs.date') }}</q-item-label>
                    <q-item-label>{{ formatDate(selectedLog?.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('pages.auditLogs.user') }}</q-item-label>
                    <q-item-label>{{ selectedLog?.user_email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('pages.auditLogs.action') }}</q-item-label>
                    <q-item-label>{{ formatActionType(selectedLog?.action_type) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Старі значення -->
            <div class="col-12 col-md-6" v-if="selectedLog?.old_values">
              <div class="text-subtitle1 q-mb-sm">{{ $t('pages.auditLogs.oldValues') }}</div>
              <pre class="changes-pre">{{ formatValues(selectedLog.old_values) }}</pre>
            </div>

            <!-- Нові значення -->
            <div class="col-12 col-md-6" v-if="selectedLog?.new_values">
              <div class="text-subtitle1 q-mb-sm">{{ $t('pages.auditLogs.newValues') }}</div>
              <pre class="changes-pre">{{ formatValues(selectedLog.new_values) }}</pre>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'
import { date } from 'quasar'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const logs = ref([])
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

const filters = ref({
  search: '',
  actionType: null,
  entityType: null,
  dateFrom: null,
  dateTo: null,
})

// Діалог змін
const changesDialog = ref(false)
const selectedLog = ref(null)

const actionTypeOptions = ref([])
const entityTypeOptions = ref([])

// Функція форматування лейблу пагінації
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

// Функція для отримання типів логів
const fetchLogTypes = async () => {
  try {
    const response = await api.get('/audit-logs/types')
    if (response.data.success) {
      actionTypeOptions.value = response.data.actionTypes.map((type) => ({
        label: t(`pages.auditLogs.actions.${type.toLowerCase()}`),
        value: type,
      }))
      entityTypeOptions.value = response.data.entityTypes.map((type) => ({
        label: t(`pages.auditLogs.entities.${type.toLowerCase()}`),
        value: type,
      }))
    }
  } catch (error) {
    console.error('Error fetching log types:', error)
    $q.notify({
      type: 'negative',
      message: t('pages.auditLogs.fetchTypesError'),
    })
  }
}

// Викликаємо функцію при монтуванні компонента
onMounted(async () => {
  await fetchLogTypes()
  await fetchLogs()
})

// Helper functions
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'DD.MM.YYYY HH:mm:ss')
}

const formatActionType = (actionType) => {
  if (!actionType) return '-'
  return t(`pages.auditLogs.actions.${actionType.toLowerCase()}`)
}

const getActionColor = (actionType) => {
  const colors = {
    LOGIN: 'info',
    CREATE: 'positive',
    UPDATE: 'warning',
    DELETE: 'negative',
  }
  return colors[actionType] || 'grey'
}

const formatValues = (values) => {
  if (!values) return ''

  try {
    let formattedValues = values

    if (typeof values === 'string') {
      try {
        formattedValues = JSON.parse(values)
      } catch {
        return values
      }
    }

    return JSON.stringify(formattedValues, null, 2)
  } catch (error) {
    console.error('Error formatting values:', error)
    return String(values)
  }
}

// Columns
const columns = computed(() => [
  {
    name: 'created_at',
    required: true,
    label: t('pages.auditLogs.date'),
    align: 'left',
    field: 'created_at',
    sortable: true,
  },
  {
    name: 'user_email',
    required: true,
    label: t('pages.auditLogs.user'),
    align: 'left',
    field: 'user_email',
    sortable: true,
  },
  {
    name: 'action_type',
    required: true,
    label: t('pages.auditLogs.action'),
    align: 'left',
    field: 'action_type',
    sortable: true,
  },
  {
    name: 'entity_type',
    label: t('pages.auditLogs.entityType'),
    align: 'left',
    field: 'entity_type',
    sortable: true,
  },
  {
    name: 'ip_address',
    label: 'IP',
    align: 'left',
    field: 'ip_address',
    sortable: true,
  },
  {
    name: 'changes',
    label: t('pages.auditLogs.changes'),
    align: 'center',
    field: 'changes',
  },
])

// Methods
const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage === 0 ? 'All' : pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      search: filters.value.search,
      actionType: filters.value.actionType,
      entityType: filters.value.entityType,
    }

    if (filters.value.dateFrom) {
      params.dateFrom = filters.value.dateFrom
    }
    if (filters.value.dateTo) {
      params.dateTo = filters.value.dateTo
    }

    const response = await api.get('/audit-logs', { params })

    if (response.data.success) {
      logs.value = response.data.logs
      pagination.value.rowsNumber = response.data.total
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
    $q.notify({
      type: 'negative',
      message: t('pages.auditLogs.fetchError'),
    })
  } finally {
    loading.value = false
  }
}

const showChanges = (log) => {
  selectedLog.value = log
  changesDialog.value = true
}

const clearFilters = () => {
  filters.value = {
    search: '',
    actionType: null,
    entityType: null,
    dateFrom: null,
    dateTo: null,
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
  await fetchLogs()
}

// Watch filters
watch(
  filters,
  () => {
    pagination.value.page = 1
    fetchLogs()
  },
  { deep: true },
)
</script>

<style>
.changes-pre {
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.body--light .changes-pre {
  background-color: #f5f5f5;
  color: #000;
}

.body--dark .changes-pre {
  background-color: #1d1d1d;
  color: #fff;
}

.body--dark .q-card {
  background: #1d1d1d;
  color: #fff;
}

.body--dark .q-item {
  color: #fff;
}

.body--dark .q-item__label--caption {
  color: #9e9e9e;
}

.body--dark .text-subtitle1 {
  color: #fff;
  opacity: 0.9;
}
</style>
