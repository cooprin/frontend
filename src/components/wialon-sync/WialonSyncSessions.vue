<template>
  <div>
    <!-- Панель управління -->
    <div class="row q-gutter-md q-mb-lg items-center">
      <q-btn
        :label="isSyncing ? `Синхронізація (${syncDuration})` : $t('wialonSync.sessions.startNew')"
        color="primary"
        icon="sync"
        :loading="isSyncing"
        :disable="isSyncing"
        @click="startSync"
      />

      <q-btn
        :label="$t('wialonSync.common.refresh')"
        color="secondary"
        icon="refresh"
        :loading="loading"
        @click="loadSessions"
        outline
      />

      <q-space />

      <!-- Пошук -->
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

    <!-- Статистика швидкого огляду -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-primary">{{ globalStats.total }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.total') }}</div>
          <!-- 🆕 Підказка про локальні дані -->
          <div class="text-caption text-grey-6" v-if="stats.total !== globalStats.total">
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.total }})
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-positive">{{ globalStats.completed }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.completed') }}</div>
          <div class="text-caption text-grey-6" v-if="stats.completed !== globalStats.completed">
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.completed }})
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-negative">{{ globalStats.failed }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.failed') }}</div>
          <div class="text-caption text-grey-6" v-if="stats.failed !== globalStats.failed">
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.failed }})
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-orange">{{ globalStats.pendingDiscrepancies }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.pending') }}</div>
          <div
            class="text-caption text-grey-6"
            v-if="stats.pendingDiscrepancies !== globalStats.pendingDiscrepancies"
          >
            ({{ $t('wialonSync.common.onPage') }}: {{ stats.pendingDiscrepancies }})
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Таблиця сесій -->
    <q-table
      :rows="sessions"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
      flat
      bordered
      :rows-per-page-options="pagination.rowsPerPageOptions"
      :rows-per-page-label="$t('common.rowsPerPage')"
      :pagination-label="paginationLabel"
    >
      <!-- Статус -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.value)"
            text-color="white"
            :icon="getStatusIcon(props.value)"
            size="sm"
          >
            {{ $t(`wialonSync.sessions.status.${props.value}`) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Тривалість -->
      <template v-slot:body-cell-duration="props">
        <q-td :props="props">
          {{ formatDuration(props.row.duration_seconds) }}
        </q-td>
      </template>

      <!-- Дії -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="primary"
              @click="showSessionDetails(props.row)"
            >
              <q-tooltip>{{ $t('wialonSync.sessions.details') }}</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.discrepancies_found > 0"
              flat
              round
              dense
              icon="list_alt"
              color="orange"
              @click="showDiscrepancies(props.row.id)"
            >
              <q-tooltip
                >{{ $t('wialonSync.discrepancies.title') }} ({{
                  props.row.discrepancies_found
                }})</q-tooltip
              >
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>

      <!-- Порожня таблиця -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm">
          <q-icon size="2em" name="sync_disabled" />
          <span>{{ $t('wialonSync.sessions.noSessions') }}</span>
        </div>
      </template>
    </q-table>

    <!-- Діалог деталей сесії -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('wialonSync.sessions.details') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedSession">
          <div class="row q-gutter-md">
            <!-- Інформація про сесію -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('wialonSync.common.generalInfo') }}</div>

                <div class="q-gutter-sm">
                  <div><strong>ID:</strong> {{ selectedSession.id }}</div>
                  <div>
                    <strong>{{ $t('wialonSync.sessions.columns.status') }}:</strong>
                    <q-chip
                      :color="getStatusColor(selectedSession.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ $t(`wialonSync.sessions.status.${selectedSession.status}`) }}
                    </q-chip>
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.sessions.columns.startTime') }}:</strong>
                    {{ formatDateTime(selectedSession.start_time) }}
                  </div>
                  <div v-if="selectedSession.end_time">
                    <strong>{{ $t('wialonSync.sessions.columns.endTime') }}:</strong>
                    {{ formatDateTime(selectedSession.end_time) }}
                  </div>
                  <div v-if="selectedSession.duration_seconds">
                    <strong>{{ $t('wialonSync.sessions.columns.duration') }}:</strong>
                    {{ formatDuration(selectedSession.duration_seconds) }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.common.createdBy') }}:</strong>
                    {{ selectedSession.created_by_name || $t('wialonSync.common.system') }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Статистика -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('wialonSync.common.statistics') }}</div>

                <div class="q-gutter-sm">
                  <div>
                    <strong>{{ $t('wialonSync.sessions.columns.clientsChecked') }}:</strong>
                    {{ selectedSession.total_clients_checked || 0 }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.sessions.columns.objectsChecked') }}:</strong>
                    {{ selectedSession.total_objects_checked || 0 }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.sessions.columns.discrepanciesFound') }}:</strong>
                    <q-chip color="orange" text-color="white" size="sm">
                      {{ selectedSession.discrepancies_found || 0 }}
                    </q-chip>
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.discrepancies.pending') }}:</strong>
                    {{ selectedSession.pending_discrepancies || 0 }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.discrepancies.stats.approved') }}:</strong>
                    {{ selectedSession.approved_discrepancies || 0 }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Логи сесії -->
          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">{{ $t('wialonSync.sessions.logs') }}</div>

              <q-list bordered separator v-if="sessionLogs.length > 0">
                <q-item v-for="log in sessionLogs" :key="log.id">
                  <q-item-section avatar>
                    <q-icon :name="getLogIcon(log.log_level)" :color="getLogColor(log.log_level)" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ log.message }}</q-item-label>
                    <q-item-label caption>{{ formatDateTime(log.created_at) }}</q-item-label>
                  </q-item-section>
                  <q-item-section v-if="log.details" side>
                    <q-btn flat round dense icon="code" @click="showLogDetails(log)" />
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-center text-grey q-pa-md">
                {{ $t('wialonSync.logs.noLogs') }}
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WialonSyncApi } from 'src/api/wialon-sync'
import { useWialonSync } from 'src/composables/useWialonSync'

const $q = useQuasar()
const { t } = useI18n()
const emit = defineEmits(['show-discrepancies'])

// State
const loading = ref(false)
const { isSyncing, syncDuration, startSync: globalStartSync } = useWialonSync()
const sessions = ref([])
const showDetailsDialog = ref(false)
const selectedSession = ref(null)
const sessionLogs = ref([])

// Фільтри
const filters = ref({
  search: '',
})

// Статистика
const stats = ref({
  total: 0,
  completed: 0,
  failed: 0,
  pendingDiscrepancies: 0,
})
// Глобальна статистика
const globalStats = ref({
  total: 0,
  completed: 0,
  failed: 0,
  running: 0,
  cancelled: 0,
  pendingDiscrepancies: 0,
})

// Пагінація
const pagination = ref({
  sortBy: 'start_time',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50],
})

// Колонки таблиці
const columns = computed(() => [
  {
    name: 'start_time',
    required: true,
    label: t('wialonSync.sessions.columns.startTime'),
    align: 'left',
    field: 'start_time',
    format: (val) => date.formatDate(val, 'DD.MM.YYYY HH:mm'),
    sortable: true,
  },
  {
    name: 'status',
    label: t('wialonSync.sessions.columns.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'total_clients_checked',
    label: t('wialonSync.sessions.columns.clientsChecked'),
    align: 'center',
    field: 'total_clients_checked',
    sortable: true,
  },
  {
    name: 'total_objects_checked',
    label: t('wialonSync.sessions.columns.objectsChecked'),
    align: 'center',
    field: 'total_objects_checked',
    sortable: true,
  },
  {
    name: 'discrepancies_found',
    label: t('wialonSync.sessions.columns.discrepanciesFound'),
    align: 'center',
    field: 'discrepancies_found',
    sortable: true,
  },
  {
    name: 'duration',
    label: t('wialonSync.sessions.columns.duration'),
    align: 'center',
    field: 'duration_seconds',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('wialonSync.common.actions'),
    align: 'center',
  },
])

// Methods
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const loadSessions = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
    }

    // Видаляємо undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await WialonSyncApi.getSessions(params)

    sessions.value = response.data.sessions || []
    pagination.value.rowsNumber = response.data.total || 0

    // 🆕 Оновити глобальну статистику з API
    if (response.data.globalStats) {
      globalStats.value = response.data.globalStats
    }

    updateStats() // Локальна статистика
  } catch (error) {
    console.error('Error loading sessions:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorLoading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const startSync = async () => {
  try {
    await globalStartSync()

    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.syncStarted'),
      icon: 'sync',
    })

    // 🆕 Оновити глобальну статистику після синхронізації
    setTimeout(async () => {
      await loadSessions()
      await loadGlobalStats()
    }, 1000)
  } catch (error) {
    console.error('Error starting sync:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('wialonSync.common.errorStartingSync'),
      icon: 'error',
    })
  }
}

const showSessionDetails = async (session) => {
  selectedSession.value = session
  showDetailsDialog.value = true

  // Завантажити логи сесії
  try {
    const response = await WialonSyncApi.getSession(session.id)
    sessionLogs.value = response.data.logs || []
  } catch (error) {
    console.error('Error loading session logs:', error)
    sessionLogs.value = []
  }
}

const showDiscrepancies = (sessionId) => {
  emit('show-discrepancies', sessionId)
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

  await loadSessions()
}

const updateStats = () => {
  stats.value = {
    total: pagination.value.rowsNumber,
    completed: sessions.value.filter((s) => s.status === 'completed').length,
    failed: sessions.value.filter((s) => s.status === 'failed').length,
    pendingDiscrepancies: sessions.value.reduce(
      (sum, s) => sum + (s.pending_discrepancies || 0),
      0,
    ),
  }
}

// Окремий метод для завантаження тільки глобальної статистики
const loadGlobalStats = async () => {
  try {
    // Запит без фільтрів для отримання загальної статистики
    const response = await WialonSyncApi.getSessions({
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
const getStatusColor = (status) => {
  const colors = {
    running: 'blue',
    completed: 'positive',
    failed: 'negative',
    cancelled: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    running: 'sync',
    completed: 'check_circle',
    failed: 'error',
    cancelled: 'cancel',
  }
  return icons[status] || 'help'
}

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

const formatDuration = (seconds) => {
  if (!seconds) return '-'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}${t('wialonSync.common.hours')} ${minutes}${t('wialonSync.common.minutes')} ${secs}${t('wialonSync.common.seconds')}`
  } else if (minutes > 0) {
    return `${minutes}${t('wialonSync.common.minutes')} ${secs}${t('wialonSync.common.seconds')}`
  } else {
    return `${secs}${t('wialonSync.common.seconds')}`
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm:ss')
}

const showLogDetails = (log) => {
  $q.dialog({
    title: t('wialonSync.logs.columns.details'),
    message: `<pre>${JSON.stringify(log.details, null, 2)}</pre>`,
    html: true,
    ok: t('wialonSync.common.close'),
  })
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadSessions()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadSessions()
})

// Expose для доступу з батьківського компонента
defineExpose({
  loadSessions,
})
</script>
