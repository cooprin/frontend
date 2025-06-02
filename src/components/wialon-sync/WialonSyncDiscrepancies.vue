<template>
  <div>
    <!-- Панель управління -->
    <div class="row q-gutter-md q-mb-lg items-center">
      <q-btn
        :label="$t('wialonSync.discrepancies.actions.bulkIgnore')"
        color="grey"
        icon="visibility_off"
        :disable="!hasSelected || loading"
        @click="resolveSelected('ignored')"
      />

      <q-btn
        :label="$t('wialonSync.common.refresh')"
        color="secondary"
        icon="refresh"
        :loading="loading"
        @click="loadDiscrepancies"
        outline
      />

      <q-space />

      <!-- Фільтри -->
      <q-select
        v-model="filters.type"
        :options="typeOptions"
        :label="$t('wialonSync.discrepancies.columns.type')"
        dense
        outlined
        clearable
        style="min-width: 200px"
        emit-value
        map-options
      />

      <q-select
        v-model="filters.status"
        :options="statusOptions"
        :label="$t('wialonSync.discrepancies.columns.status')"
        dense
        outlined
        clearable
        style="min-width: 150px"
        emit-value
        map-options
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
          <div class="text-h6 text-orange">{{ stats.pending }}</div>
          <div class="text-caption">{{ $t('wialonSync.discrepancies.stats.pending') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-positive">{{ stats.approved }}</div>
          <div class="text-caption">{{ $t('wialonSync.discrepancies.stats.approved') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-negative">{{ stats.rejected }}</div>
          <div class="text-caption">{{ $t('wialonSync.discrepancies.stats.rejected') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-grey">{{ stats.ignored }}</div>
          <div class="text-caption">{{ $t('wialonSync.discrepancies.stats.ignored') }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Таблиця розбіжностей -->
    <q-table
      v-model:selected="selected"
      :rows="discrepancies"
      :columns="columns"
      :loading="loading"
      row-key="id"
      selection="multiple"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
      flat
      bordered
      :rows-per-page-options="pagination.rowsPerPageOptions"
      :rows-per-page-label="$t('common.rowsPerPage')"
      :pagination-label="paginationLabel"
    >
      <!-- Тип розбіжності -->
      <template v-slot:body-cell-discrepancy_type="props">
        <q-td :props="props">
          <q-chip
            :color="getTypeColor(props.value)"
            text-color="white"
            :icon="getTypeIcon(props.value)"
            size="sm"
          >
            {{ $t(`wialonSync.discrepancies.types.${props.value}`) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Дані з Wialon -->
      <template v-slot:body-cell-wialon_data="props">
        <q-td :props="props">
          <div class="text-weight-bold">{{ props.row.wialon_entity_data?.name || '-' }}</div>
          <div class="text-caption text-grey-7">
            ID: {{ props.row.wialon_entity_data?.wialon_id || '-' }}
          </div>
        </q-td>
      </template>

      <!-- Дані в системі -->
      <template v-slot:body-cell-system_data="props">
        <q-td :props="props">
          <div v-if="props.row.system_entity_data">
            <div class="text-weight-bold">{{ props.row.system_entity_data?.name || '-' }}</div>
            <div class="text-caption text-grey-7">
              ID: {{ props.row.system_entity_data?.id || '-' }}
            </div>
          </div>
          <div v-else class="text-grey-7">-</div>
        </q-td>
      </template>

      <!-- Запропонована дія -->
      <template v-slot:body-cell-suggested_action="props">
        <q-td :props="props">
          <q-chip v-if="props.value" color="blue" text-color="white" size="sm">
            {{ props.value }}
          </q-chip>
          <span v-else class="text-grey-7">-</span>
        </q-td>
      </template>

      <!-- Статус -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.value)"
            text-color="white"
            :icon="getStatusIcon(props.value)"
            size="sm"
          >
            {{ $t(`wialonSync.discrepancies.status.${props.value}`) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Дії -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group v-if="props.row.status === 'pending'" flat>
            <q-btn
              flat
              dense
              :icon="getActionIcon(props.row.discrepancy_type)"
              :color="getActionColor(props.row.discrepancy_type)"
              @click="openInteractiveDialog(props.row)"
            >
              <q-tooltip>{{ getActionTooltip(props.row.discrepancy_type) }}</q-tooltip>
            </q-btn>

            <q-btn
              flat
              dense
              icon="visibility_off"
              color="grey"
              @click="resolveDiscrepancy(props.row, 'ignored')"
            >
              <q-tooltip>{{ $t('wialonSync.discrepancies.actions.ignore') }}</q-tooltip>
            </q-btn>
          </q-btn-group>

          <q-btn flat round dense icon="visibility" @click="showDiscrepancyDetails(props.row)">
            <q-tooltip>{{ $t('wialonSync.common.showDetails') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Порожня таблиця -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm">
          <q-icon size="2em" name="check_circle" />
          <span>{{ $t('wialonSync.discrepancies.noDiscrepancies') }}</span>
        </div>
      </template>
    </q-table>

    <!-- Діалог деталей розбіжності -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('wialonSync.common.discrepancyDetails') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedDiscrepancy">
          <div class="row q-gutter-md">
            <!-- Загальна інформація -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('wialonSync.common.generalInfo') }}</div>

                <div class="q-gutter-sm">
                  <div>
                    <strong>{{ $t('wialonSync.discrepancies.columns.type') }}:</strong>
                    <q-chip
                      :color="getTypeColor(selectedDiscrepancy.discrepancy_type)"
                      text-color="white"
                      size="sm"
                    >
                      {{
                        $t(`wialonSync.discrepancies.types.${selectedDiscrepancy.discrepancy_type}`)
                      }}
                    </q-chip>
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.discrepancies.columns.status') }}:</strong>
                    <q-chip
                      :color="getStatusColor(selectedDiscrepancy.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ $t(`wialonSync.discrepancies.status.${selectedDiscrepancy.status}`) }}
                    </q-chip>
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.common.found') }}:</strong>
                    {{ formatDateTime(selectedDiscrepancy.created_at) }}
                  </div>
                  <div v-if="selectedDiscrepancy.resolved_at">
                    <strong>{{ $t('wialonSync.discrepancies.columns.resolvedAt') }}:</strong>
                    {{ formatDateTime(selectedDiscrepancy.resolved_at) }}
                  </div>
                  <div v-if="selectedDiscrepancy.resolved_by_name">
                    <strong>{{ $t('wialonSync.common.resolvedBy') }}:</strong>
                    {{ selectedDiscrepancy.resolved_by_name }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Дані з Wialon -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  {{ $t('wialonSync.discrepancies.columns.wialonData') }}
                </div>

                <pre class="text-caption">{{
                  JSON.stringify(selectedDiscrepancy.wialon_entity_data, null, 2)
                }}</pre>
              </q-card-section>
            </q-card>

            <!-- Дані в системі -->
            <q-card
              flat
              bordered
              class="col-12 col-md-6"
              v-if="selectedDiscrepancy.system_entity_data"
            >
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  {{ $t('wialonSync.discrepancies.columns.systemData') }}
                </div>

                <pre class="text-caption">{{
                  JSON.stringify(selectedDiscrepancy.system_entity_data, null, 2)
                }}</pre>
              </q-card-section>
            </q-card>

            <!-- Примітки -->
            <q-card flat bordered class="col-12" v-if="selectedDiscrepancy.resolution_notes">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  {{ $t('wialonSync.common.resolutionNotes') }}
                </div>
                <p>{{ selectedDiscrepancy.resolution_notes }}</p>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right" v-if="selectedDiscrepancy?.status === 'pending'">
          <q-btn
            :label="getActionTooltip(selectedDiscrepancy.discrepancy_type)"
            :color="getActionColor(selectedDiscrepancy.discrepancy_type)"
            @click="openInteractiveDialog(selectedDiscrepancy)"
          />
          <q-btn
            :label="$t('wialonSync.discrepancies.actions.ignore')"
            color="grey"
            @click="resolveDiscrepancy(selectedDiscrepancy, 'ignored')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалоги для інтерактивного вирішення розбіжностей -->

    <!-- Діалог клієнта -->
    <client-dialog
      v-model="showClientDialog"
      :edit-data="dialogEditData"
      :initial-data="dialogInitialData"
      @saved="onClientSaved"
    />

    <!-- Діалог об'єкта -->
    <wialon-object-dialog
      v-model="showObjectDialog"
      :edit-data="dialogEditData"
      :initial-data="dialogInitialData"
      @saved="onObjectSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { WialonSyncApi } from 'src/api/wialon-sync'
import ClientDialog from 'components/clients/ClientDialog.vue'
import WialonObjectDialog from 'components/wialon/WialonObjectDialog.vue'

const $q = useQuasar()
const route = useRoute()
const { t } = useI18n()
const dialogInitialData = ref(null)

// State
const loading = ref(false)
const discrepancies = ref([])
const selected = ref([])
const showDetailsDialog = ref(false)
const selectedDiscrepancy = ref(null)

// Діалоги для інтерактивного вирішення
const showClientDialog = ref(false)
const showObjectDialog = ref(false)
const currentDiscrepancy = ref(null)
const dialogEditData = ref(null)

// Фільтри
const filters = ref({
  type: null,
  status: null,
  sessionId: null,
  search: '',
})

// Статистика
const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  ignored: 0,
})

// Пагінація
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0,
  rowsPerPageOptions: [10, 15, 20, 25, 50],
})

// Опції для фільтрів
const typeOptions = computed(() => [
  { label: t('wialonSync.discrepancies.types.new_client'), value: 'new_client' },
  { label: t('wialonSync.discrepancies.types.new_object'), value: 'new_object' },
  {
    label: t('wialonSync.discrepancies.types.new_object_with_known_client'),
    value: 'new_object_with_known_client',
  },
  { label: t('wialonSync.discrepancies.types.client_name_changed'), value: 'client_name_changed' },
  { label: t('wialonSync.discrepancies.types.object_name_changed'), value: 'object_name_changed' },
])

const statusOptions = computed(() => [
  { label: t('wialonSync.discrepancies.status.pending'), value: 'pending' },
  { label: t('wialonSync.discrepancies.status.approved'), value: 'approved' },
  { label: t('wialonSync.discrepancies.status.rejected'), value: 'rejected' },
  { label: t('wialonSync.discrepancies.status.ignored'), value: 'ignored' },
])

// Колонки таблиці
const columns = computed(() => [
  {
    name: 'discrepancy_type',
    required: true,
    label: t('wialonSync.discrepancies.columns.type'),
    align: 'left',
    field: 'discrepancy_type',
    sortable: true,
  },
  {
    name: 'wialon_data',
    label: t('wialonSync.discrepancies.columns.wialonData'),
    align: 'left',
    field: 'wialon_entity_data',
  },
  {
    name: 'system_data',
    label: t('wialonSync.discrepancies.columns.systemData'),
    align: 'left',
    field: 'system_entity_data',
  },
  {
    name: 'suggested_action',
    label: t('wialonSync.discrepancies.columns.suggestedAction'),
    align: 'center',
    field: 'suggested_action',
  },
  {
    name: 'status',
    label: t('wialonSync.discrepancies.columns.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'created_at',
    label: t('wialonSync.common.found'),
    align: 'center',
    field: 'created_at',
    format: (val) => date.formatDate(val, 'DD.MM.YYYY HH:mm'),
    sortable: true,
  },
  {
    name: 'actions',
    label: t('wialonSync.common.actions'),
    align: 'center',
  },
])

// Computed
const hasSelected = computed(() => selected.value.length > 0)

// Methods
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const loadDiscrepancies = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      sessionId: filters.value.sessionId,
      type: filters.value.type,
      status: filters.value.status,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await WialonSyncApi.getDiscrepancies(params)

    discrepancies.value = response.data.discrepancies || []
    pagination.value.rowsNumber = response.data.total || 0
    updateStats()
  } catch (error) {
    console.error('Error loading discrepancies:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorLoadingDiscrepancies'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Інтерактивне вирішення розбіжностей
const openInteractiveDialog = (discrepancy) => {
  currentDiscrepancy.value = discrepancy

  switch (discrepancy.discrepancy_type) {
    case 'new_client':
      openNewClientDialog(discrepancy)
      break
    case 'new_object':
    case 'new_object_with_known_client':
      openNewObjectDialog(discrepancy)
      break
    case 'client_name_changed':
      openEditClientDialog(discrepancy)
      break
    case 'object_name_changed':
      openEditObjectDialog(discrepancy)
      break
    default:
      resolveDiscrepancy(discrepancy, 'approved')
  }
}

const openNewClientDialog = (discrepancy) => {
  const wialonData = discrepancy.wialon_entity_data

  // Для створення editData = null, initialData = дані з Wialon
  dialogEditData.value = null
  dialogInitialData.value = {
    name: wialonData.name,
    full_name: wialonData.full_name || wialonData.name,
    description: wialonData.description,
    wialon_id: wialonData.wialon_id,
    wialon_username: wialonData.wialon_username,
    is_active: true,
  }

  showClientDialog.value = true
}

const openEditClientDialog = (discrepancy) => {
  const systemData = discrepancy.system_entity_data
  const wialonData = discrepancy.wialon_entity_data

  // Для редагування передаємо системні дані з ID + пропоновану назву
  dialogEditData.value = {
    ...systemData,
    name: wialonData.name, // Пропонована нова назва з Wialon
    wialon_username: wialonData.wialon_username, // wialon_username з Wialon
  }

  showClientDialog.value = true
}

const openNewObjectDialog = (discrepancy) => {
  const wialonData = discrepancy.wialon_entity_data

  // Для створення editData = null, initialData = дані з Wialon
  dialogEditData.value = null
  dialogInitialData.value = {
    name: wialonData.name,
    wialon_id: wialonData.wialon_id,
    description: wialonData.description,
    client_id: discrepancy.suggested_client_id,
    status: 'active',
  }

  showObjectDialog.value = true
}

const openEditObjectDialog = (discrepancy) => {
  const systemData = discrepancy.system_entity_data
  const wialonData = discrepancy.wialon_entity_data

  // Для редагування передаємо системні дані з ID + пропоновану назву
  dialogEditData.value = {
    ...systemData,
    name: wialonData.name, // Пропонована нова назва з Wialon
  }

  showObjectDialog.value = true
}

const getActionIcon = (discrepancyType) => {
  const icons = {
    new_client: 'person_add',
    new_object: 'add_circle',
    new_object_with_known_client: 'add_circle',
    client_name_changed: 'edit',
    object_name_changed: 'edit',
  }
  return icons[discrepancyType] || 'check'
}

const getActionColor = (discrepancyType) => {
  const colors = {
    new_client: 'primary',
    new_object: 'primary',
    new_object_with_known_client: 'primary',
    client_name_changed: 'warning',
    object_name_changed: 'warning',
  }
  return colors[discrepancyType] || 'positive'
}

const getActionTooltip = (discrepancyType) => {
  const tooltips = {
    new_client: t('wialonSync.discrepancies.actions.createClient'),
    new_object: t('wialonSync.discrepancies.actions.createObject'),
    new_object_with_known_client: t('wialonSync.discrepancies.actions.createObject'),
    client_name_changed: t('wialonSync.discrepancies.actions.updateClient'),
    object_name_changed: t('wialonSync.discrepancies.actions.updateObject'),
  }
  return tooltips[discrepancyType] || t('wialonSync.discrepancies.actions.resolve')
}

// Обробники успішного збереження з діалогів
const onClientSaved = async () => {
  await markDiscrepancyAsApproved()
  showClientDialog.value = false
}

const onObjectSaved = async () => {
  await markDiscrepancyAsApproved()
  showObjectDialog.value = false
}

const markDiscrepancyAsApproved = async () => {
  if (!currentDiscrepancy.value) return

  try {
    await WialonSyncApi.resolveDiscrepancies(
      [currentDiscrepancy.value.id],
      'approved',
      `Вирішено інтерактивно: ${currentDiscrepancy.value.discrepancy_type}`,
    )

    // Оновлюємо локальний стан
    currentDiscrepancy.value.status = 'approved'
    currentDiscrepancy.value.resolved_at = new Date().toISOString()

    updateStats()

    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.discrepancyResolved'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error marking discrepancy as approved:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.discrepancies.resolveError'),
      icon: 'error',
    })
  }
}

const resolveDiscrepancy = async (discrepancy, action) => {
  try {
    await WialonSyncApi.resolveDiscrepancies([discrepancy.id], action)

    // Update local state
    discrepancy.status = action
    discrepancy.resolved_at = new Date().toISOString()

    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.discrepancyResolved'),
      icon: 'check',
    })

    updateStats()
    showDetailsDialog.value = false
  } catch (error) {
    console.error('Error resolving discrepancy:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('wialonSync.discrepancies.resolveError'),
      icon: 'error',
    })
  }
}

const resolveSelected = async (action) => {
  if (!hasSelected.value) return

  // Тільки для масового ігнорування
  if (action !== 'ignored') {
    $q.notify({
      color: 'info',
      message: t('wialonSync.discrepancies.useInteractiveMode'),
      icon: 'info',
    })
    return
  }

  try {
    await WialonSyncApi.resolveDiscrepancies(
      selected.value.map((d) => d.id),
      action,
      'Масово проігноровано',
    )

    // Update local state
    selected.value.forEach((discrepancy) => {
      discrepancy.status = action
      discrepancy.resolved_at = new Date().toISOString()
    })

    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.discrepanciesResolved', { count: selected.value.length }),
      icon: 'check',
    })

    selected.value = []
    updateStats()
  } catch (error) {
    console.error('Error resolving discrepancies:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('wialonSync.discrepancies.resolveError'),
      icon: 'error',
    })
  }
}

const showDiscrepancyDetails = (discrepancy) => {
  selectedDiscrepancy.value = discrepancy
  showDetailsDialog.value = true
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

  await loadDiscrepancies()
}

const updateStats = () => {
  stats.value = {
    pending: discrepancies.value.filter((d) => d.status === 'pending').length,
    approved: discrepancies.value.filter((d) => d.status === 'approved').length,
    rejected: discrepancies.value.filter((d) => d.status === 'rejected').length,
    ignored: discrepancies.value.filter((d) => d.status === 'ignored').length,
  }
}

// Utility methods
const getTypeColor = (type) => {
  const colors = {
    new_client: 'blue',
    new_object: 'green',
    new_object_with_known_client: 'teal',
    client_name_changed: 'orange',
    object_name_changed: 'amber',
  }
  return colors[type] || 'grey'
}

const getTypeIcon = (type) => {
  const icons = {
    new_client: 'person_add',
    new_object: 'add_circle',
    new_object_with_known_client: 'add_circle_outline',
    client_name_changed: 'edit',
    object_name_changed: 'edit',
  }
  return icons[type] || 'help'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'positive',
    rejected: 'negative',
    ignored: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'schedule',
    approved: 'check_circle',
    rejected: 'cancel',
    ignored: 'visibility_off',
  }
  return icons[status] || 'help'
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm:ss')
}

// Функція для встановлення фільтра по сесії (викликається з сесій)
const setSessionFilter = (sessionId) => {
  filters.value.sessionId = sessionId
  pagination.value.page = 1
  loadDiscrepancies()
}

// Watch for route changes (session filter)
watch(
  () => route.query.sessionId,
  (sessionId) => {
    if (sessionId) {
      setSessionFilter(sessionId)
    }
  },
  { immediate: true },
)

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadDiscrepancies()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadDiscrepancies()
})

// Expose для доступу з батьківського компонента
defineExpose({
  setSessionFilter,
})
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
