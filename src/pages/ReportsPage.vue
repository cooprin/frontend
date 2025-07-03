<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('reports.title') }}</div>
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
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.isActive"
                  :options="statusOptions"
                  :label="$t('reports.filters.status')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>

              <!-- Формат виводу -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.outputFormat"
                  :options="outputFormatOptions"
                  :label="$t('reports.filters.outputFormat')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
                <q-btn
                  color="secondary"
                  :label="$t('reports.clearCache')"
                  @click="clearCache"
                  :loading="clearingCache"
                />
                <q-btn
                  color="info"
                  :label="$t('reports.loadFromFiles')"
                  @click="loadFromFiles"
                  :loading="loadingFromFiles"
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="reports"
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
          <!-- Поиск и создание -->
          <template v-slot:top-right>
            <q-input
              v-model="filters.search"
              :label="$t('reports.filters.search')"
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
              :label="$t('reports.create')"
              @click="openCreateDialog"
            >
              <q-tooltip>{{ $t('reports.create') }}</q-tooltip>
            </q-btn>
          </template>

          <!-- Слот для статуса -->
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-chip :color="props.row.is_active ? 'positive' : 'grey'" text-color="white" dense>
                {{ props.row.is_active ? $t('common.active') : $t('common.inactive') }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для формата вывода -->
          <template v-slot:body-cell-output_format="props">
            <q-td :props="props">
              <q-chip :color="getFormatColor(props.row.output_format)" text-color="white" dense>
                <q-icon :name="getFormatIcon(props.row.output_format)" class="q-mr-xs" />
                {{ getFormatLabel(props.row.output_format) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для страниц -->
          <template v-slot:body-cell-pages_assigned="props">
            <q-td :props="props">
              <q-chip v-if="props.row.pages_assigned > 0" color="blue" text-color="white" dense>
                {{ props.row.pages_assigned }}
              </q-chip>
              <span v-else class="text-grey-6">{{ $t('reports.notAssigned') }}</span>
            </q-td>
          </template>

          <!-- Слот для статистики -->
          <template v-slot:body-cell-execution_count="props">
            <q-td :props="props">
              <div class="column q-gutter-xs">
                <q-chip color="info" text-color="white" dense size="sm">
                  <q-icon name="play_arrow" class="q-mr-xs" />
                  {{ props.row.execution_count || 0 }}
                </q-chip>
                <div v-if="props.row.last_execution" class="text-caption text-grey-6">
                  {{ formatDate(props.row.last_execution) }}
                </div>
              </div>
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
                  color="secondary"
                  icon="play_arrow"
                  @click="executeReport(props.row)"
                >
                  <q-tooltip>{{ $t('reports.execute') }}</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="info" icon="history" @click="viewHistory(props.row)">
                  <q-tooltip>{{ $t('reports.history') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="viewReport(props.row)"
                >
                  <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="warning" icon="edit" @click="editReport(props.row)">
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="positive"
                  icon="content_copy"
                  @click="cloneReport(props.row)"
                >
                  <q-tooltip>{{ $t('reports.clone') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="info"
                  icon="download"
                  @click="exportResultsFromTable(props.row)"
                >
                  <q-tooltip>{{ $t('reports.export') }}</q-tooltip>
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

    <!-- Диалог удаления -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('reports.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteReport"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог выполнения звіта -->
    <q-dialog v-model="executeDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ $t('reports.execute') }}: {{ selectedReport?.name }}</div>
          <div v-if="selectedReport?.description" class="text-caption text-grey-6">
            {{ selectedReport.description }}
          </div>
        </q-card-section>

        <q-card-section v-if="reportParameters.length > 0">
          <div class="text-subtitle2 q-mb-md">{{ $t('reports.parameters') }}</div>

          <div v-for="param in reportParameters" :key="param.parameter_name" class="q-mb-md">
            <q-input
              v-if="param.parameter_type === 'text'"
              v-model="parameterValues[param.parameter_name]"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              outlined
              dense
            />
            <!-- Другие типы параметров аналогично FAB компоненту -->
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="executeDialog = false" />
          <q-btn
            color="primary"
            :label="$t('reports.execute')"
            @click="runSelectedReport"
            :loading="executing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог результатов -->
    <q-dialog v-model="resultsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('reports.results') }}: {{ selectedReport?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="resultsDialog = false" />
        </q-card-section>

        <q-card-section>
          <div v-if="reportResults">
            <!-- Статистика выполнения -->
            <div class="row q-gutter-md q-mb-md">
              <q-chip color="positive" text-color="white" icon="schedule">
                {{ $t('reports.executionTime') }}: {{ reportResults.executionTime }}s
              </q-chip>
              <q-chip color="info" text-color="white" icon="table_rows">
                {{ $t('reports.rowsCount') }}: {{ reportResults.rowsCount }}
              </q-chip>
              <q-chip
                v-if="reportResults.fromCache"
                color="orange"
                text-color="white"
                icon="cached"
              >
                {{ $t('reports.fromCache') }}
              </q-chip>
            </div>

            <!-- Таблица результатов -->
            <q-table
              v-if="reportResults.data && reportResults.data.length > 0"
              :rows="reportResults.data"
              :columns="resultColumns"
              row-key="id"
              flat
              bordered
              :rows-per-page-options="[10, 25, 50, 100]"
            />

            <div v-else class="text-center text-grey-6 q-py-xl">
              {{ $t('reports.noData') }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ReportsApi } from 'src/api/reports'
import { date } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
// State
const loading = ref(false)
const executing = ref(false)
const clearingCache = ref(false)
const loadingFromFiles = ref(false)
const showFilters = ref(false)
const deleteDialog = ref(false)
const executeDialog = ref(false)
const resultsDialog = ref(false)
const reports = ref([])
const selectedReport = ref(null)
const reportToDelete = ref(null)
const reportParameters = ref([])
const parameterValues = ref({})
const reportResults = ref(null)

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 10, 15, 20, 25, 50, 100],
})

// Filters
const filters = ref({
  search: '',
  isActive: null,
  outputFormat: null,
})

// Options
const statusOptions = computed(() => [
  { label: t('common.all'), value: null },
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false },
])

const outputFormatOptions = computed(() => [
  { label: t('reports.formats.table'), value: 'table' },
  { label: t('reports.formats.chart'), value: 'chart' },
  { label: t('reports.formats.export'), value: 'export' },
  { label: t('reports.formats.both'), value: 'both' },
])

// Columns
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('reports.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'code',
    label: t('reports.code'),
    align: 'left',
    field: 'code',
    sortable: true,
  },
  {
    name: 'output_format',
    label: t('reports.outputFormat'),
    align: 'center',
    field: 'output_format',
    sortable: true,
  },
  {
    name: 'pages_assigned',
    label: t('reports.pagesAssigned'),
    align: 'center',
    field: 'pages_assigned',
    sortable: true,
  },
  {
    name: 'execution_count',
    label: t('reports.executions'),
    align: 'center',
    field: 'execution_count',
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

const resultColumns = computed(() => {
  if (!reportResults.value?.data?.length) return []

  const firstRow = reportResults.value.data[0]
  return Object.keys(firstRow).map((key) => ({
    name: key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    field: key,
    align: 'left',
    sortable: true,
  }))
})

// Methods
const loadReports = async () => {
  // Перевіряємо дозволи на читання звітів
  if (!authStore.hasAnyPermission(['reports.read'])) {
    $q.notify({
      color: 'negative',
      message: t('common.errors.noPermission'),
      icon: 'error',
    })
    router.push({ name: 'dashboard' })
    return
  }
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      is_active: filters.value.isActive,
      output_format: filters.value.outputFormat || undefined,
    }

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await ReportsApi.getReports(params)
    reports.value = response.data.reports
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading reports:', error)
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
    isActive: null,
    outputFormat: null,
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

  await loadReports()
}

const openCreateDialog = () => {
  router.push({ name: 'report-create' })
}

const viewReport = (report) => {
  router.push({ name: 'report-edit', params: { id: report.id } })
}

const editReport = (report) => {
  router.push({ name: 'report-edit', params: { id: report.id } })
}

const viewHistory = (report) => {
  router.push({ name: 'report-history', params: { id: report.id } })
}

const executeReport = async (report) => {
  selectedReport.value = report

  try {
    const response = await ReportsApi.getReport(report.id)
    reportParameters.value = response.data.report.parameters || []

    parameterValues.value = {}
    reportParameters.value.forEach((param) => {
      parameterValues.value[param.parameter_name] = param.default_value || null
    })

    if (reportParameters.value.length > 0) {
      executeDialog.value = true
    } else {
      await runSelectedReport()
    }
  } catch (error) {
    console.error('Error loading report:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.errorLoadingReport'),
    })
  }
}

const runSelectedReport = async () => {
  executing.value = true
  try {
    const response = await ReportsApi.executeReport(selectedReport.value.id, {
      parameters: parameterValues.value,
    })

    reportResults.value = response.data
    executeDialog.value = false
    resultsDialog.value = true

    $q.notify({
      type: 'positive',
      message: t('reports.executionSuccess'),
    })
  } catch (error) {
    console.error('Error executing report:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('reports.executionError'),
    })
  } finally {
    executing.value = false
  }
}

const cloneReport = async (report) => {
  try {
    await ReportsApi.cloneReport(report.id)
    $q.notify({
      type: 'positive',
      message: t('reports.cloneSuccess'),
    })
    loadReports()
  } catch (error) {
    console.error('Error cloning report:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.cloneError'),
    })
  }
}

const confirmDelete = (report) => {
  reportToDelete.value = report
  deleteDialog.value = true
}

const deleteReport = async () => {
  try {
    await ReportsApi.deleteReport(reportToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: t('reports.deleteSuccess'),
    })
    loadReports()
  } catch (error) {
    console.error('Error deleting report:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
    })
  }
}

const exportResultsFromTable = async (report) => {
  try {
    const response = await ReportsApi.exportReportResults(report.id, {}, 'csv')

    // Створюємо посилання для завантаження
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${report.code}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    $q.notify({
      type: 'positive',
      message: t('reports.exportSuccess'),
    })
  } catch (error) {
    console.error('Error exporting report:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.exportError'),
    })
  }
}

const clearCache = async () => {
  clearingCache.value = true
  try {
    const response = await ReportsApi.clearExpiredCache()
    $q.notify({
      type: 'positive',
      message: response.data.message || t('reports.cacheCleared'),
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.cacheClearError'),
    })
  } finally {
    clearingCache.value = false
  }
}

// Замінити існуючий метод loadFromFiles
const loadFromFiles = () => {
  // Створюємо invisible input для вибору файлів
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = '.json,.yaml,.yml'

  input.onchange = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    loadingFromFiles.value = true
    try {
      const formData = new FormData()

      // Додаємо всі файли до FormData
      for (const file of files) {
        formData.append('reports', file)
      }

      const response = await ReportsApi.loadReportsFromFiles(formData)

      // Показуємо детальні результати
      const result = response.data.result
      let message = result.message

      if (result.errors && result.errors.length > 0) {
        message += `\nПомилки: ${result.errors.length}`
        console.log('Upload errors:', result.errors)
      }

      $q.notify({
        type: result.loaded > 0 ? 'positive' : 'warning',
        message: message,
        timeout: 5000,
      })

      loadReports()
    } catch (error) {
      console.error('Error loading from files:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || t('reports.loadFromFilesError'),
      })
    } finally {
      loadingFromFiles.value = false
    }
  }

  input.click()
}

const getFormatIcon = (format) => {
  switch (format) {
    case 'table':
      return 'table_view'
    case 'chart':
      return 'bar_chart'
    case 'export':
      return 'download'
    case 'both':
      return 'dashboard'
    default:
      return 'assessment'
  }
}

const getFormatColor = (format) => {
  switch (format) {
    case 'table':
      return 'blue'
    case 'chart':
      return 'green'
    case 'export':
      return 'orange'
    case 'both':
      return 'purple'
    default:
      return 'grey'
  }
}

const getFormatLabel = (format) => {
  return t(`reports.formats.${format}`)
}

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD/MM/YYYY HH:mm')
}

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadReports()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadReports()
})
</script>
