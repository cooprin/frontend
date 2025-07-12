<template>
  <div>
    <!-- Панель управління -->
    <div class="row q-gutter-md q-mb-lg items-center">
      <q-btn
        :label="$t('wialonSync.common.refresh')"
        color="secondary"
        icon="refresh"
        :loading="loading"
        @click="loadLogs"
        outline
      />

      <q-btn
        :label="$t('wialonSync.logs.actions.clear')"
        color="negative"
        icon="clear_all"
        @click="clearLogs"
        outline
      />

      <q-space />

      <!-- Фільтри -->
      <q-select
        v-model="filters.sessionId"
        :options="sessionOptions"
        :label="$t('wialonSync.logs.filters.session')"
        dense
        outlined
        clearable
        style="min-width: 200px"
        option-value="value"
        option-label="label"
        emit-value
        map-options
      />

      <q-select
        v-model="filters.level"
        :options="levelOptions"
        :label="$t('wialonSync.logs.columns.level')"
        dense
        outlined
        clearable
        style="min-width: 150px"
        emit-value
        map-options
      />

      <q-input
        v-model="filters.dateFrom"
        :label="$t('wialonSync.logs.filters.dateFrom')"
        type="date"
        dense
        outlined
        style="min-width: 150px"
      />

      <q-input
        v-model="filters.dateTo"
        :label="$t('wialonSync.logs.filters.dateTo')"
        type="date"
        dense
        outlined
        style="min-width: 150px"
      />
    </div>

    <!-- Пошук окремо -->
    <div class="row justify-end q-mb-md">
      <q-input
        v-model="filters.search"
        :placeholder="$t('wialonSync.common.search')"
        dense
        outlined
        style="min-width: 250px"
        debounce="300"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Статистика -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-primary">{{ globalStats.total }}</div>
          <div class="text-caption">{{ $t('wialonSync.logs.stats.total') }}</div>
          <!-- 🆕 Підказка про локальні дані -->
          <div class="text-caption text-grey-6" v-if="stats.total !== globalStats.total">
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.total }})
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-blue">{{ globalStats.info }}</div>
          <div class="text-caption">{{ $t('wialonSync.logs.levels.info') }}</div>
          <div class="text-caption text-grey-6" v-if="stats.info !== globalStats.info">
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.info }})
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-orange">{{ globalStats.warning }}</div>
          <div class="text-caption">{{ $t('wialonSync.logs.levels.warning') }}</div>
          <div class="text-caption text-grey-6" v-if="stats.warning !== globalStats.warning">
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.warning }})
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-negative">{{ globalStats.error }}</div>
          <div class="text-caption">{{ $t('wialonSync.logs.levels.error') }}</div>
          <div class="text-caption text-grey-6" v-if="stats.error !== globalStats.error">
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.error }})
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Таблиця логів -->
    <q-table
      :rows="logs"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
      flat
      bordered
      dense
      :rows-per-page-options="pagination.rowsPerPageOptions"
      :rows-per-page-label="$t('common.rowsPerPage')"
      :pagination-label="paginationLabel"
    >
      <!-- Рівень логу -->
      <template v-slot:body-cell-log_level="props">
        <q-td :props="props">
          <q-chip
            :color="getLogColor(props.value)"
            text-color="white"
            :icon="getLogIcon(props.value)"
            size="sm"
          >
            {{ $t(`wialonSync.logs.levels.${props.value}`) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Повідомлення -->
      <template v-slot:body-cell-message="props">
        <q-td :props="props" style="max-width: 400px">
          <div class="text-body2 ellipsis-2-lines">
            {{ props.value }}
          </div>
        </q-td>
      </template>

      <!-- Час -->
      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          <div class="text-caption">
            {{ formatDateTime(props.value) }}
          </div>
        </q-td>
      </template>

      <!-- Дії -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="props.row.details"
            flat
            round
            dense
            icon="code"
            @click="showLogDetails(props.row)"
          >
            <q-tooltip>{{ $t('wialonSync.common.showDetails') }}</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="content_copy" @click="copyLogMessage(props.row)">
            <q-tooltip>{{ $t('wialonSync.common.copyMessage') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Розширений рядок для довгих повідомлень -->
      <template v-slot:body="props">
        <q-tr :props="props" @click="props.expand = !props.expand">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'log_level'">
              <q-chip
                :color="getLogColor(col.value)"
                text-color="white"
                :icon="getLogIcon(col.value)"
                size="sm"
              >
                {{ $t(`wialonSync.logs.levels.${col.value}`) }}
              </q-chip>
            </template>

            <template v-else-if="col.name === 'message'">
              <div class="text-body2" style="max-width: 400px">
                <div class="ellipsis-2-lines">{{ col.value }}</div>
                <q-btn
                  v-if="col.value.length > 100"
                  flat
                  dense
                  size="sm"
                  :icon="props.expand ? 'expand_less' : 'expand_more'"
                  @click.stop="props.expand = !props.expand"
                />
              </div>
            </template>

            <template v-else-if="col.name === 'created_at'">
              <div class="text-caption">{{ formatDateTime(col.value) }}</div>
            </template>

            <template v-else-if="col.name === 'actions'">
              <q-btn
                v-if="props.row.details"
                flat
                round
                dense
                icon="code"
                @click.stop="showLogDetails(props.row)"
              >
                <q-tooltip>{{ $t('wialonSync.common.showDetails') }}</q-tooltip>
              </q-btn>

              <q-btn flat round dense icon="content_copy" @click.stop="copyLogMessage(props.row)">
                <q-tooltip>{{ $t('wialonSync.common.copyMessage') }}</q-tooltip>
              </q-btn>
            </template>

            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>

        <!-- Розширений контент -->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="q-pa-md bg-grey-1">
              <div class="text-weight-bold q-mb-sm">{{ $t('wialonSync.common.fullMessage') }}:</div>
              <div class="text-body2 q-mb-md">{{ props.row.message }}</div>

              <div v-if="props.row.details" class="text-weight-bold q-mb-sm">
                {{ $t('wialonSync.logs.columns.details') }}:
              </div>
              <pre v-if="props.row.details" class="log-details">{{
                JSON.stringify(props.row.details, null, 2)
              }}</pre>
            </div>
          </q-td>
        </q-tr>
      </template>

      <!-- Порожня таблиця -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm">
          <q-icon size="2em" name="article" />
          <span>{{ $t('wialonSync.logs.noLogs') }}</span>
        </div>
      </template>
    </q-table>

    <!-- Діалог деталей логу -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('wialonSync.common.logDetails') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedLog">
          <div class="row q-gutter-md">
            <!-- Основна інформація -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('wialonSync.common.generalInfo') }}</div>

                <div class="q-gutter-sm">
                  <div>
                    <strong>{{ $t('wialonSync.logs.columns.time') }}:</strong>
                    {{ formatDateTime(selectedLog.created_at) }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.logs.columns.level') }}:</strong>
                    <q-chip
                      :color="getLogColor(selectedLog.log_level)"
                      text-color="white"
                      size="sm"
                    >
                      {{ $t(`wialonSync.logs.levels.${selectedLog.log_level}`) }}
                    </q-chip>
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.logs.filters.session') }}:</strong>
                    {{ selectedLog.session_id }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Повідомлення -->
            <q-card flat bordered class="col-12">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  {{ $t('wialonSync.logs.columns.message') }}
                </div>
                <div class="text-body1">{{ selectedLog.message }}</div>
              </q-card-section>
            </q-card>

            <!-- JSON деталі -->
            <q-card flat bordered class="col-12" v-if="selectedLog.details">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  {{ $t('wialonSync.logs.columns.details') }} (JSON)
                </div>
                <pre class="log-details">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :label="$t('wialonSync.common.copyJson')"
            v-if="selectedLog?.details"
            color="primary"
            @click="copyJson(selectedLog.details)"
            outline
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar, date, copyToClipboard } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WialonSyncApi } from 'src/api/wialon-sync'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const logs = ref([])
const sessions = ref([])
const showDetailsDialog = ref(false)
const selectedLog = ref(null)

// Фільтри
const filters = ref({
  sessionId: null,
  level: null,
  dateFrom: null,
  dateTo: null,
  search: '',
})

// Статистика
const stats = ref({
  total: 0,
  info: 0,
  warning: 0,
  error: 0,
})

// 🆕 Глобальна статистика
const globalStats = ref({
  total: 0,
  info: 0,
  warning: 0,
  error: 0,
  debug: 0,
})

// Пагінація
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
  rowsPerPageOptions: [10, 15, 20, 25, 50],
})

// Опції для фільтрів
const levelOptions = computed(() => [
  { label: t('wialonSync.logs.levels.info'), value: 'info' },
  { label: t('wialonSync.logs.levels.warning'), value: 'warning' },
  { label: t('wialonSync.logs.levels.error'), value: 'error' },
  { label: t('wialonSync.logs.levels.debug'), value: 'debug' },
])

const sessionOptions = computed(() => {
  return sessions.value.map((session) => ({
    label: `${session.id.substring(0, 8)} - ${formatDateTime(session.start_time)}`,
    value: session.id,
  }))
})

// Колонки таблиці
const columns = computed(() => [
  {
    name: 'created_at',
    required: true,
    label: t('wialonSync.logs.columns.time'),
    align: 'center',
    field: 'created_at',
    sortable: true,
    style: 'width: 150px',
  },
  {
    name: 'log_level',
    label: t('wialonSync.logs.columns.level'),
    align: 'center',
    field: 'log_level',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'message',
    required: true,
    label: t('wialonSync.logs.columns.message'),
    align: 'left',
    field: 'message',
    sortable: false,
  },
  {
    name: 'actions',
    label: t('wialonSync.common.actions'),
    align: 'center',
    style: 'width: 100px',
  },
])

// Methods
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const loadLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      sessionId: filters.value.sessionId,
      level: filters.value.level,
      dateFrom: filters.value.dateFrom,
      dateTo: filters.value.dateTo,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await WialonSyncApi.getLogs(params)
    logs.value = response.data.logs || []
    pagination.value.rowsNumber = response.data.total || 0

    // 🆕 Оновити глобальну статистику з API
    if (response.data.globalStats) {
      globalStats.value = response.data.globalStats
    }

    updateStats() // Локальна статистика
  } catch (error) {
    console.error('Error loading logs:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorLoadingLogs'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadSessions = async () => {
  try {
    const response = await WialonSyncApi.getSessions({ perPage: 50 })
    sessions.value = response.data.sessions || []
  } catch (error) {
    console.error('Error loading sessions:', error)
  }
}

const clearLogs = async () => {
  $q.dialog({
    title: t('wialonSync.common.confirm'),
    message: t('wialonSync.common.clearLogsConfirm'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await WialonSyncApi.clearLogs()

      $q.notify({
        color: 'positive',
        message: t('wialonSync.common.logsCleared'),
        icon: 'clear_all',
      })

      // 🆕 Оновити як локальні дані так і глобальну статистику
      await loadLogs()
      await loadGlobalStats()
    } catch (error) {
      console.error('Error clearing logs:', error)
      $q.notify({
        color: 'negative',
        message: t('wialonSync.common.errorClearingLogs'),
        icon: 'error',
      })
    }
  })
}

const showLogDetails = (log) => {
  selectedLog.value = log
  showDetailsDialog.value = true
}

const copyLogMessage = async (log) => {
  try {
    await copyToClipboard(log.message)
    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.messageCopied'),
      icon: 'content_copy',
    })
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorCopying'),
      icon: 'error',
    })
  }
}

const copyJson = async (details) => {
  try {
    await copyToClipboard(JSON.stringify(details, null, 2))
    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.jsonCopied'),
      icon: 'content_copy',
    })
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorCopying'),
      icon: 'error',
    })
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

  await loadLogs()
}

const updateStats = () => {
  stats.value = {
    total: pagination.value.rowsNumber,
    info: logs.value.filter((log) => log.log_level === 'info').length,
    warning: logs.value.filter((log) => log.log_level === 'warning').length,
    error: logs.value.filter((log) => log.log_level === 'error').length,
  }
}

// Окремий метод для завантаження тільки глобальної статистики
const loadGlobalStats = async () => {
  try {
    // Запит без фільтрів для отримання загальної статистики
    const response = await WialonSyncApi.getLogs({
      page: 1,
      perPage: 1, // Мінімальний запит, нас цікавить тільки globalStats
    })

    if (response.data.globalStats) {
      globalStats.value = response.data.globalStats
    }
  } catch (error) {
    console.error('Error loading global stats:', error)
  }
}

// Utility methods
const getLogColor = (level) => {
  const colors = {
    info: 'blue',
    warning: 'orange',
    error: 'negative',
    debug: 'grey',
  }
  return colors[level] || 'grey'
}

const getLogIcon = (level) => {
  const icons = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    debug: 'bug_report',
  }
  return icons[level] || 'help'
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm:ss')
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadLogs()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadSessions()
  loadLogs()
})
</script>

<style scoped>
.log-details {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 11px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
}

.ellipsis-2-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
