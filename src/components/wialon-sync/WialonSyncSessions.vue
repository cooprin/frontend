<template>
  <div>
    <!-- Панель управління -->
    <div class="row q-gutter-md q-mb-lg items-center">
      <q-btn
        :label="$t('wialonSync.sessions.startNew')"
        color="primary"
        icon="sync"
        :loading="starting"
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
          <div class="text-h6 text-primary">{{ stats.total }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.total') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-positive">{{ stats.completed }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.completed') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-negative">{{ stats.failed }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.failed') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-orange">{{ stats.pendingDiscrepancies }}</div>
          <div class="text-caption">{{ $t('wialonSync.sessions.stats.pending') }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Таблиця сесій -->
    <q-table
      :rows="filteredSessions"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
      flat
      bordered
      :rows-per-page-options="[10, 20, 50]"
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
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WialonSyncApi } from 'src/api/wialon-sync'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const starting = ref(false)
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

// Пагінація
const pagination = ref({
  sortBy: 'start_time',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
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

// Computed
const filteredSessions = computed(() => {
  if (!filters.value.search) return sessions.value

  const searchLower = filters.value.search.toLowerCase()
  return sessions.value.filter(
    (session) =>
      session.id.toLowerCase().includes(searchLower) ||
      session.status.toLowerCase().includes(searchLower) ||
      (session.created_by_name && session.created_by_name.toLowerCase().includes(searchLower)),
  )
})

// Methods
const loadSessions = async () => {
  loading.value = true
  try {
    const params = {
      limit: pagination.value.rowsPerPage,
      offset: (pagination.value.page - 1) * pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
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
    pagination.value.rowsNumber = response.data.pagination?.total || 0
    updateStats()
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
  starting.value = true
  try {
    await WialonSyncApi.startSync()

    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.syncStarted'),
      icon: 'sync',
    })

    // Оновити список після короткої затримки
    setTimeout(() => {
      loadSessions()
    }, 1000)
  } catch (error) {
    console.error('Error starting sync:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('wialonSync.common.errorStartingSync'),
      icon: 'error',
    })
  } finally {
    starting.value = false
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
  // Переключаємося на вкладку розбіжностей і передаємо sessionId як параметр
  const parent = getCurrentInstance().parent
  if (parent && parent.setupState && parent.setupState.tab) {
    parent.setupState.tab.value = 'discrepancies'

    // Встановлюємо фільтр по сесії в компоненті розбіжностей
    setTimeout(() => {
      // Шукаємо компонент розбіжностей і передаємо йому sessionId
      const discrepanciesComponent = parent.refs?.discrepanciesComponent
      if (discrepanciesComponent && discrepanciesComponent.setSessionFilter) {
        discrepanciesComponent.setSessionFilter(sessionId)
      }
    }, 100)
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

  await loadSessions()
}

const updateStats = () => {
  stats.value = {
    total: sessions.value.length,
    completed: sessions.value.filter((s) => s.status === 'completed').length,
    failed: sessions.value.filter((s) => s.status === 'failed').length,
    pendingDiscrepancies: sessions.value.reduce(
      (sum, s) => sum + (s.pending_discrepancies || 0),
      0,
    ),
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
  () => filters.value.search,
  () => {
    pagination.value.page = 1
    loadSessions()
  },
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
