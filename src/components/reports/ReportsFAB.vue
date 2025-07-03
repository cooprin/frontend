<template>
  <q-page-sticky position="bottom-left" :offset="[20, 20]" v-if="hasReports">
    <q-fab v-model="fabOpen" icon="assessment" direction="up" color="secondary" :disable="loading">
      <q-fab-action
        v-for="report in pageReports"
        :key="report.report_id"
        :icon="getReportIcon(report.output_format)"
        :color="getReportColor(report.output_format)"
        @click="executeReport(report)"
        :disable="!report.has_execute_permission || executing"
      >
        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
          {{ report.report_name }}
          <div v-if="report.description" class="text-caption">
            {{ report.description }}
          </div>
        </q-tooltip>
      </q-fab-action>

      <!-- Кнопка управления звітами (только для персонала) -->
      <q-fab-action
        v-if="authStore.userType === 'staff' && authStore.hasAnyPermission(['reports.read'])"
        icon="settings"
        color="primary"
        @click="openReportsManagement"
      >
        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
          {{ $t('reports.manage') }}
        </q-tooltip>
      </q-fab-action>
    </q-fab>

    <!-- Диалог выполнения звіта -->
    <q-dialog v-model="reportDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ selectedReport?.report_name }}</div>
          <div v-if="selectedReport?.description" class="text-caption text-grey-6">
            {{ selectedReport.description }}
          </div>
        </q-card-section>

        <q-card-section v-if="reportParameters.length > 0">
          <div class="text-subtitle2 q-mb-md">{{ $t('reports.parameters') }}</div>

          <div v-for="param in reportParameters" :key="param.parameter_name" class="q-mb-md">
            <!-- Текстовый параметр -->
            <q-input
              v-if="param.parameter_type === 'text'"
              v-model="parameterValues[param.parameter_name]"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              outlined
              dense
            />

            <!-- Числовой параметр -->
            <q-input
              v-else-if="param.parameter_type === 'number'"
              v-model.number="parameterValues[param.parameter_name]"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              type="number"
              outlined
              dense
            />

            <!-- Дата -->
            <q-input
              v-else-if="param.parameter_type === 'date'"
              v-model="parameterValues[param.parameter_name]"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              type="date"
              outlined
              dense
            />

            <!-- Дата и время -->
            <q-input
              v-else-if="param.parameter_type === 'datetime'"
              v-model="parameterValues[param.parameter_name]"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              type="datetime-local"
              outlined
              dense
            />

            <!-- Логический параметр -->
            <q-checkbox
              v-else-if="param.parameter_type === 'boolean'"
              v-model="parameterValues[param.parameter_name]"
              :label="param.display_name"
              :hint="param.description"
            />

            <!-- Выбор из списка -->
            <q-select
              v-else-if="param.parameter_type === 'select'"
              v-model="parameterValues[param.parameter_name]"
              :options="param.options || []"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              outlined
              dense
              emit-value
              map-options
            />

            <!-- Множественный выбор -->
            <q-select
              v-else-if="param.parameter_type === 'multiselect'"
              v-model="parameterValues[param.parameter_name]"
              :options="param.options || []"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              multiple
              outlined
              dense
              emit-value
              map-options
            />

            <!-- Выбор клиента -->
            <q-select
              v-else-if="param.parameter_type === 'client_id'"
              v-model="parameterValues[param.parameter_name]"
              :options="clientOptions"
              :label="param.display_name"
              :hint="param.description"
              :required="param.is_required"
              outlined
              dense
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="searchClients"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="closeReportDialog" />
          <q-btn
            color="primary"
            :label="$t('reports.execute')"
            @click="runReport"
            :loading="executing"
            :disable="!canExecuteReport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог результатов звіта -->
    <q-dialog v-model="resultsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('reports.results') }}: {{ selectedReport?.report_name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="resultsDialog = false" />
        </q-card-section>

        <q-card-section>
          <div v-if="reportResults" class="q-mb-md">
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
              :pagination-label="paginationLabel"
            />

            <div v-else class="text-center text-grey-6 q-py-xl">
              {{ $t('reports.noData') }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="secondary"
            :label="$t('reports.export')"
            icon="download"
            @click="exportResults"
            :disable="!reportResults?.data?.length"
          />
          <q-btn flat :label="$t('common.close')" @click="resultsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page-sticky>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { ReportsApi } from 'src/api/reports'
import { ClientsApi } from 'src/api/clients'

const props = defineProps({
  pageIdentifier: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// State
const loading = ref(false)
const executing = ref(false)
const fabOpen = ref(false)
const reportDialog = ref(false)
const resultsDialog = ref(false)
const pageReports = ref([])
const selectedReport = ref(null)
const reportParameters = ref([])
const parameterValues = ref({})
const reportResults = ref(null)
const clientOptions = ref([])

// Computed
const hasReports = computed(() => pageReports.value.length > 0)

const canExecuteReport = computed(() => {
  if (!selectedReport.value || executing.value) return false

  // Проверяем обязательные параметры
  for (const param of reportParameters.value) {
    if (param.is_required && !parameterValues.value[param.parameter_name]) {
      return false
    }
  }

  return true
})

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
const loadPageReports = async () => {
  loading.value = true
  try {
    const response = await ReportsApi.getPageReports(props.pageIdentifier)
    pageReports.value = response.data.reports || []
  } catch (error) {
    console.error('Error loading page reports:', error)
  } finally {
    loading.value = false
  }
}

const getReportIcon = (outputFormat) => {
  switch (outputFormat) {
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

const getReportColor = (outputFormat) => {
  switch (outputFormat) {
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

const executeReport = async (report) => {
  selectedReport.value = report

  // Загружаем параметры звіта
  try {
    if (report.parameters_count > 0) {
      const response = await ReportsApi.getReport(report.report_id)
      reportParameters.value = response.data.report.parameters || []

      // Инициализируем значения параметров
      parameterValues.value = {}
      reportParameters.value.forEach((param) => {
        parameterValues.value[param.parameter_name] = param.default_value || null
      })

      reportDialog.value = true
    } else {
      // Выполняем звіт без параметров
      await runReport()
    }
  } catch (error) {
    console.error('Error loading report parameters:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.errorLoadingParameters'),
    })
  }
}

const runReport = async () => {
  executing.value = true
  try {
    const response = await ReportsApi.executeReport(selectedReport.value.report_id, {
      parameters: parameterValues.value,
      pageIdentifier: props.pageIdentifier,
    })

    reportResults.value = response.data
    reportDialog.value = false
    resultsDialog.value = true

    $q.notify({
      type: 'positive',
      message: t('reports.executionSuccess'),
      caption: `${response.data.rowsCount} ${t('reports.rowsReturned')}`,
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

const closeReportDialog = () => {
  reportDialog.value = false
  selectedReport.value = null
  reportParameters.value = []
  parameterValues.value = {}
}

const searchClients = async (val, update) => {
  if (val.length < 2) {
    update(() => {
      clientOptions.value = []
    })
    return
  }

  try {
    const response = await ClientsApi.searchClients(val)
    update(() => {
      clientOptions.value = response.data.clients.map((client) => ({
        label: client.name,
        value: client.id,
      }))
    })
  } catch (error) {
    console.error('Error searching clients:', error)
    update(() => {
      clientOptions.value = []
    })
  }
}

const exportResults = async () => {
  try {
    const response = await ReportsApi.exportReportResults(
      selectedReport.value.report_id,
      {
        parameters: parameterValues.value,
        pageIdentifier: props.pageIdentifier,
      },
      'xlsx',
    )

    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${selectedReport.value.report_code}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    $q.notify({
      type: 'positive',
      message: t('reports.exportSuccess'),
    })
  } catch (error) {
    console.error('Error exporting results:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.exportError'),
    })
  }
}

const openReportsManagement = () => {
  router.push({ name: 'reports' })
}

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

// Watchers
watch(() => props.pageIdentifier, loadPageReports, { immediate: true })

// Lifecycle
onMounted(() => {
  loadPageReports()
})
</script>

<style scoped>
.q-fab {
  z-index: 2000;
}
</style>
