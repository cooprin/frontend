<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">
            {{ $t('reports.executionHistory') }}
            <span v-if="reportName" class="text-grey-6">: {{ reportName }}</span>
          </div>
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
              <!-- Статус выполнения -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('reports.filters.executionStatus')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>

              <!-- Выполнено пользователем -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.executed_by"
                  :options="userOptions"
                  :label="$t('reports.filters.executedBy')"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="searchUsers"
                  clearable
                />
              </div>

              <!-- Период -->
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="filters.dateFrom"
                  :label="$t('reports.filters.dateFrom')"
                  type="date"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-sm-3">
                <q-input
                  v-model="filters.dateTo"
                  :label="$t('reports.filters.dateTo')"
                  type="date"
                  outlined
                  dense
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
                <q-btn
                  color="secondary"
                  :label="$t('reports.exportHistory')"
                  @click="exportHistory"
                  :loading="exporting"
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="history"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :pagination-label="paginationLabel"
        >
          <!-- Кнопки действий в заголовке -->
          <template v-slot:top-right>
            <div class="q-gutter-sm">
              <q-btn
                color="info"
                icon="refresh"
                :label="$t('common.refresh')"
                @click="loadHistory"
                :loading="loading"
              />
              <q-btn
                color="primary"
                icon="arrow_back"
                :label="$t('common.back')"
                @click="$router.push({ name: 'reports' })"
              />
            </div>
          </template>

          <!-- Слот для статуса -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                dense
                :icon="getStatusIcon(props.row.status)"
              >
                {{ getStatusLabel(props.row.status) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для времени выполнения -->
          <template v-slot:body-cell-execution_time="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-xs">
                <q-icon
                  :name="props.row.cache_hit ? 'cached' : 'schedule'"
                  :color="props.row.cache_hit ? 'orange' : 'blue'"
                  size="sm"
                />
                <span>{{ formatExecutionTime(props.row.execution_time) }}</span>
                <q-tooltip v-if="props.row.cache_hit">
                  {{ $t('reports.servedFromCache') }}
                </q-tooltip>
              </div>
            </q-td>
          </template>

          <!-- Слот для количества строк -->
          <template v-slot:body-cell-rows_returned="props">
            <q-td :props="props">
              <q-chip color="info" text-color="white" dense>
                <q-icon name="table_rows" class="q-mr-xs" />
                {{ formatNumber(props.row.rows_returned) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для пользователя -->
          <template v-slot:body-cell-executed_by="props">
            <q-td :props="props">
              <div v-if="props.row.executed_by_email">
                <div class="text-weight-medium">{{ props.row.executed_by_name }}</div>
                <div class="text-caption text-grey-6">{{ props.row.executed_by_email }}</div>
              </div>
              <div v-else class="text-grey-6">
                {{ $t('reports.systemExecution') }}
              </div>
            </q-td>
          </template>

          <!-- Слот для даты -->
          <template v-slot:body-cell-executed_at="props">
            <q-td :props="props">
              <div>{{ formatDate(props.row.executed_at) }}</div>
              <div class="text-caption text-grey-6">{{ formatTime(props.row.executed_at) }}</div>
            </q-td>
          </template>

          <!-- Слот для действий -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn-group flat>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="viewExecution(props.row)"
                >
                  <q-tooltip>{{ $t('reports.viewDetails') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.status === 'success'"
                  flat
                  round
                  dense
                  color="secondary"
                  icon="refresh"
                  @click="rerunExecution(props.row)"
                >
                  <q-tooltip>{{ $t('reports.rerunWithSameParameters') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.status === 'success'"
                  flat
                  round
                  dense
                  color="positive"
                  icon="download"
                  @click="downloadResults(props.row)"
                >
                  <q-tooltip>{{ $t('reports.downloadResults') }}</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Диалог деталей выполнения -->
    <q-dialog v-model="detailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('reports.executionDetails') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="detailsDialog = false" />
        </q-card-section>

        <q-card-section>
          <div v-if="selectedExecution" class="q-gutter-md">
            <!-- Основная информация -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('reports.executionInfo') }}</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-field :label="$t('reports.status')" stack-label outlined readonly>
                      <template v-slot:control>
                        <q-chip
                          :color="getStatusColor(selectedExecution.status)"
                          text-color="white"
                          :icon="getStatusIcon(selectedExecution.status)"
                        >
                          {{ getStatusLabel(selectedExecution.status) }}
                        </q-chip>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      :model-value="formatExecutionTime(selectedExecution.execution_time)"
                      :label="$t('reports.executionTime')"
                      outlined
                      readonly
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      :model-value="formatNumber(selectedExecution.rows_returned)"
                      :label="$t('reports.rowsReturned')"
                      outlined
                      readonly
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      :model-value="formatDateTime(selectedExecution.executed_at)"
                      :label="$t('reports.executedAt')"
                      outlined
                      readonly
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Параметры -->
            <q-card
              v-if="
                selectedExecution.parameters && Object.keys(selectedExecution.parameters).length > 0
              "
              flat
              bordered
            >
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('reports.parameters') }}</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="(value, key) in selectedExecution.parameters"
                    :key="key"
                    class="col-12 col-sm-6 col-md-4"
                  >
                    <q-input
                      :model-value="formatParameterValue(value)"
                      :label="key"
                      outlined
                      readonly
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Ошибки -->
            <q-card v-if="selectedExecution.error_message" flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-negative q-mb-md">
                  {{ $t('reports.errorMessage') }}
                </div>
                <q-input
                  :model-value="selectedExecution.error_message"
                  type="textarea"
                  outlined
                  readonly
                  rows="4"
                />
              </q-card-section>
            </q-card>

            <!-- Технические детали -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('reports.technicalDetails') }}</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      :model-value="selectedExecution.executed_by_type"
                      :label="$t('reports.executedByType')"
                      outlined
                      readonly
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      :model-value="selectedExecution.page_identifier || $t('common.notSpecified')"
                      :label="$t('reports.pageIdentifier')"
                      outlined
                      readonly
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      :model-value="selectedExecution.ip_address || $t('common.notAvailable')"
                      :label="$t('reports.ipAddress')"
                      outlined
                      readonly
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      :model-value="selectedExecution.user_agent || $t('common.notAvailable')"
                      :label="$t('reports.userAgent')"
                      outlined
                      readonly
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="selectedExecution?.status === 'success'"
            color="secondary"
            :label="$t('reports.rerunWithSameParameters')"
            @click="rerunExecution(selectedExecution)"
          />
          <q-btn flat :label="$t('common.close')" @click="detailsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ReportsApi } from 'src/api/reports'
import { date } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// State
const loading = ref(false)
const exporting = ref(false)
const showFilters = ref(false)
const detailsDialog = ref(false)
const history = ref([])
const selectedExecution = ref(null)
const reportName = ref('')
const userOptions = ref([])

const pagination = ref({
  sortBy: 'executed_at',
  descending: true,
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0,
  rowsPerPageOptions: [10, 15, 25, 50, 100],
})

// Filters
const filters = ref({
  status: null,
  executed_by: null,
  dateFrom: null,
  dateTo: null,
})

// Options
const statusOptions = computed(() => [
  { label: t('reports.statuses.success'), value: 'success' },
  { label: t('reports.statuses.error'), value: 'error' },
  { label: t('reports.statuses.timeout'), value: 'timeout' },
  { label: t('reports.statuses.cancelled'), value: 'cancelled' },
])

// Columns
const columns = computed(() => [
  {
    name: 'executed_at',
    required: true,
    label: t('reports.executedAt'),
    align: 'left',
    field: 'executed_at',
    sortable: true,
  },
  {
    name: 'status',
    label: t('reports.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'executed_by',
    label: t('reports.executedBy'),
    align: 'left',
    field: 'executed_by_name',
    sortable: true,
  },
  {
    name: 'execution_time',
    label: t('reports.executionTime'),
    align: 'center',
    field: 'execution_time',
    sortable: true,
  },
  {
    name: 'rows_returned',
    label: t('reports.rowsReturned'),
    align: 'center',
    field: 'rows_returned',
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
const loadHistory = async () => {
  // Перевіряємо дозволи на читання звітів
  if (!authStore.hasAnyPermission(['reports.read'])) {
    $q.notify({
      color: 'negative',
      message: t('common.errors.noPermission'),
      icon: 'error',
    })
    router.push({ name: 'reports' })
    return
  }

  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      status: filters.value.status || undefined,
      executed_by: filters.value.executed_by || undefined,
      date_from: filters.value.dateFrom || undefined,
      date_to: filters.value.dateTo || undefined,
    }

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await ReportsApi.getExecutionHistory(route.params.id, params)
    history.value = response.data.history
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading execution history:', error)
    $q.notify({
      color: 'negative',
      message: t('reports.errorLoadingHistory'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadReportName = async () => {
  // Перевіряємо дозволи
  if (!authStore.hasAnyPermission(['reports.read'])) {
    return
  }

  try {
    const response = await ReportsApi.getReport(route.params.id)
    reportName.value = response.data.report.name
  } catch (error) {
    console.error('Error loading report name:', error)
  }
}

const clearFilters = () => {
  filters.value = {
    status: null,
    executed_by: null,
    dateFrom: null,
    dateTo: null,
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

  await loadHistory()
}

const viewExecution = (execution) => {
  selectedExecution.value = execution
  detailsDialog.value = true
}

const rerunExecution = async (execution) => {
  try {
    const response = await ReportsApi.executeReport(route.params.id, {
      parameters: execution.parameters || {},
      pageIdentifier: execution.page_identifier,
    })

    $q.notify({
      type: 'positive',
      message: t('reports.rerunSuccess'),
      caption: `${response.data.rowsCount} ${t('reports.rowsReturned')}`,
    })

    // Обновляем историю
    loadHistory()
  } catch (error) {
    console.error('Error rerunning execution:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('reports.rerunError'),
    })
  }
}

const downloadResults = async (execution) => {
  try {
    const response = await ReportsApi.exportReportResults(
      route.params.id,
      {
        parameters: execution.parameters || {},
        pageIdentifier: execution.page_identifier,
      },
      'csv',
    )

    // Створюємо посилання для завантаження
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `report_results_${execution.id}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    $q.notify({
      type: 'positive',
      message: t('reports.downloadSuccess'),
    })
  } catch (error) {
    console.error('Error downloading results:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.downloadError'),
    })
  }
}

const exportHistory = async () => {
  exporting.value = true
  try {
    // TODO: Implement history export
    $q.notify({
      type: 'info',
      message: t('reports.exportHistoryNotImplemented'),
    })
  } catch (error) {
    console.error('Error exporting history:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.exportHistoryError'),
    })
  } finally {
    exporting.value = false
  }
}

const searchUsers = async (val, update) => {
  if (val.length < 2) {
    update(() => {
      userOptions.value = []
    })
    return
  }

  try {
    // TODO: Implement user search
    update(() => {
      userOptions.value = []
    })
  } catch (error) {
    console.error('Error searching users:', error)
    update(() => {
      userOptions.value = []
    })
  }
}

// Helper methods
const getStatusColor = (status) => {
  switch (status) {
    case 'success':
      return 'positive'
    case 'error':
      return 'negative'
    case 'timeout':
      return 'warning'
    case 'cancelled':
      return 'grey'
    default:
      return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'timeout':
      return 'schedule'
    case 'cancelled':
      return 'cancel'
    default:
      return 'help'
  }
}

const getStatusLabel = (status) => {
  return t(`reports.statuses.${status}`)
}

const formatExecutionTime = (time) => {
  if (!time) return '-'
  return `${Number(time).toFixed(3)}s`
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat().format(num)
}

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD/MM/YYYY')
}

const formatTime = (dateString) => {
  return date.formatDate(dateString, 'HH:mm:ss')
}

const formatDateTime = (dateString) => {
  return date.formatDate(dateString, 'DD/MM/YYYY HH:mm:ss')
}

const formatParameterValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadHistory()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadReportName()
  loadHistory()
})
</script>

<style scoped>
.q-chip .q-icon {
  font-size: 16px;
}
</style>
