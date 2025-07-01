<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('pages.auditLogs.title') }}</div>
          <q-space />
          <q-btn
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
            flat
            color="primary"
            @click="showFilters = !showFilters"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-slide-transition>
          <div v-show="showFilters">
            <div class="row q-col-gutter-sm q-mb-md">
              <!-- Пошук -->
              <div class="col-12 col-sm-4">
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
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.actionType"
                  :options="actionTypeSearch.filteredOptions.value"
                  :label="$t('pages.auditLogs.actionType')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => actionTypeSearch.filterOptions(val, update)"
                  @popup-show="actionTypeSearch.resetFilter"
                />
              </div>

              <!-- Тип сутності -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.entityType"
                  :options="entityTypeSearch.filteredOptions.value"
                  :label="$t('pages.auditLogs.entityType')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => entityTypeSearch.filterOptions(val, update)"
                  @popup-show="entityTypeSearch.resetFilter"
                />
              </div>

              <!-- Схема -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.tableSchema"
                  :options="schemaSearch.filteredOptions.value"
                  :label="$t('pages.auditLogs.schema')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => schemaSearch.filterOptions(val, update)"
                  @popup-show="schemaSearch.resetFilter"
                  @update:model-value="onSchemaChange"
                />
              </div>

              <!-- Таблиця -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.tableName"
                  :options="tableSearch.filteredOptions.value"
                  :label="$t('pages.auditLogs.table')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => tableSearch.filterOptions(val, update)"
                  @popup-show="tableSearch.resetFilter"
                  :disable="!filters.tableSchema"
                />
              </div>

              <!-- Тип аудиту -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.auditType"
                  :options="[
                    { label: $t('pages.auditLogs.auditTypes.all'), value: null },
                    { label: $t('pages.auditLogs.auditTypes.system'), value: 'SYSTEM' },
                    { label: $t('pages.auditLogs.auditTypes.business'), value: 'BUSINESS' },
                  ]"
                  :label="$t('pages.auditLogs.auditType')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <!-- Тип користувача -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.userType"
                  :options="[
                    { label: $t('pages.auditLogs.userTypes.all'), value: null },
                    { label: $t('pages.auditLogs.userTypes.staff'), value: 'staff' },
                    { label: $t('pages.auditLogs.userTypes.client'), value: 'client' },
                  ]"
                  :label="$t('pages.auditLogs.userType')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Дата від -->
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="filters.dateFrom"
                  :label="$t('pages.auditLogs.dateFrom')"
                  :placeholder="dateFormat"
                  outlined
                  dense
                  type="date"
                />
              </div>

              <!-- Дата до -->
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="filters.dateTo"
                  :label="$t('pages.auditLogs.dateTo')"
                  :placeholder="dateFormat"
                  outlined
                  dense
                  type="date"
                />
              </div>

              <!-- IP адреса -->
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="filters.ipAddress"
                  :label="$t('pages.auditLogs.ipAddress')"
                  outlined
                  dense
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="lan" />
                  </template>
                </q-input>
              </div>

              <!-- Фільтр змін -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.hasChanges"
                  :options="[
                    { label: $t('pages.auditLogs.changes.all'), value: null },
                    { label: $t('pages.auditLogs.changes.withChanges'), value: true },
                    { label: $t('pages.auditLogs.changes.withoutChanges'), value: false },
                  ]"
                  :label="$t('pages.auditLogs.changes.filter')"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn
                  color="primary"
                  :label="$t('pages.auditLogs.clearFilters')"
                  @click="clearFilters"
                />
                <q-btn
                  color="secondary"
                  :label="$t('pages.auditLogs.export')"
                  @click="exportData"
                  :loading="exporting"
                />
              </div>
            </div>
            <!-- Закриття row -->
          </div>
          <!-- Закриття v-show -->
        </q-slide-transition>

        <!-- Таблиця логів -->
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
          <!-- Час створення -->
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.value) }}
            </q-td>
          </template>

          <!-- Тип дії -->
          <template v-slot:body-cell-action_type="props">
            <q-td :props="props">
              <q-chip :color="getActionColor(props.value)" text-color="white" dense>
                {{ formatActionType(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Тип аудиту -->
          <template v-slot:body-cell-audit_type="props">
            <q-td :props="props">
              <q-chip :color="getAuditTypeColor(props.value)" text-color="white" dense>
                {{ formatAuditType(props.value) }}
              </q-chip>
            </q-td>
          </template>
          <!-- Тип користувача -->
          <template v-slot:body-cell-user_type="props">
            <q-td :props="props">
              <q-chip
                v-if="props.value"
                :color="props.value === 'staff' ? 'blue' : 'green'"
                text-color="white"
                dense
              >
                {{
                  props.value === 'staff'
                    ? $t('pages.auditLogs.userTypes.staff')
                    : $t('pages.auditLogs.userTypes.client')
                }}
              </q-chip>
              <span v-else>-</span>
            </q-td>
          </template>

          <!-- Зміни -->
          <template v-slot:body-cell-changes="props">
            <q-td :props="props" class="text-center">
              <q-btn-group flat>
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
                <q-btn
                  v-if="props.row.browser_info"
                  flat
                  round
                  dense
                  color="info"
                  icon="computer"
                  @click="showBrowserInfo(props.row)"
                >
                  <q-tooltip>{{ $t('pages.auditLogs.viewBrowserInfo') }}</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>

          <!-- IP адреса -->
          <template v-slot:body-cell-ip_address="props">
            <q-td :props="props">
              <q-chip dense class="cursor-pointer" @click="filters.ipAddress = props.value">
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <!-- Таблиця -->
          <template v-slot:body-cell-table="props">
            <q-td :props="props">
              {{ `${props.row.table_schema}.${props.row.table_name}` }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Діалог перегляду змін -->
    <q-dialog v-model="changesDialog" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('pages.auditLogs.changes.title') }}</div>
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
                    <q-item-label>{{
                      selectedLog?.display_name || selectedLog?.user_email || '-'
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('pages.auditLogs.action') }}</q-item-label>
                    <q-item-label>{{ formatActionType(selectedLog?.action_type) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('pages.auditLogs.table') }}</q-item-label>
                    <q-item-label>{{
                      `${selectedLog?.table_schema}.${selectedLog?.table_name}`
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Зміни -->
            <div class="col-12">
              <q-tabs
                v-model="changesTab"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
              >
                <q-tab name="changes" :label="$t('pages.auditLogs.changes.onlyChanged')" />
                <q-tab name="full" :label="$t('pages.auditLogs.changes.fullComparison')" />
                <q-tab name="raw" :label="$t('pages.auditLogs.changes.rawData')" />
              </q-tabs>

              <q-tab-panels v-model="changesTab" animated>
                <!-- Тільки зміни -->
                <q-tab-panel name="changes">
                  <pre class="changes-pre" v-if="selectedLog?.changes">{{
                    formatValues(selectedLog.changes)
                  }}</pre>
                  <div v-else class="text-grey-6">
                    {{ $t('pages.auditLogs.changes.noChanges') }}
                  </div>
                </q-tab-panel>

                <!-- Повне порівняння -->
                <q-tab-panel name="full">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle1 q-mb-sm">
                        {{ $t('pages.auditLogs.oldValues') }}
                      </div>
                      <pre class="changes-pre">{{ formatValues(selectedLog?.old_values) }}</pre>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle1 q-mb-sm">
                        {{ $t('pages.auditLogs.newValues') }}
                      </div>
                      <pre class="changes-pre">{{ formatValues(selectedLog?.new_values) }}</pre>
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Сирі дані -->
                <q-tab-panel name="raw">
                  <pre class="changes-pre">{{ formatValues(selectedLog) }}</pre>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог інформації про браузер -->
    <q-dialog v-model="browserInfoDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('pages.auditLogs.browserInfo') }}</div>
        </q-card-section>

        <q-card-section>
          <pre class="changes-pre">{{ formatValues(selectedLog?.browser_info) }}</pre>
          <div class="q-mt-md">
            <strong>User Agent:</strong>
            <div class="q-mt-sm">{{ selectedLog?.user_agent }}</div>
          </div>
        </q-card-section>

        <q-card-section align="right">
          <q-btn flat :label="$t('common.close')" v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { AuditApi } from 'src/api/audit'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const showFilters = ref(false)

const $q = useQuasar()
const { t, locale } = useI18n()

// State
const loading = ref(false)
const exporting = ref(false)
const logs = ref([])
const changesDialog = ref(false)
const browserInfoDialog = ref(false)
const selectedLog = ref(null)
const changesTab = ref('changes')

// Options
const actionTypeOptions = ref([])
const entityTypeOptions = ref([])
const schemaOptions = ref([])
const tableOptions = ref([])
const schemasData = ref({})
// Searchable selects
const actionTypeSearch = useSearchableSelect(actionTypeOptions)
const entityTypeSearch = useSearchableSelect(entityTypeOptions)
const schemaSearch = useSearchableSelect(schemaOptions)
const tableSearch = useSearchableSelect(ref([]))

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Filters
const filters = ref({
  search: '',
  actionType: null,
  entityType: null,
  dateFrom: null,
  dateTo: null,
  auditType: null,
  userType: null,
  tableSchema: null,
  tableName: null,
  ipAddress: null,
  hasChanges: null,
})

// Computed
const dateFormat = computed(() => {
  return locale.value === 'uk' ? 'ДД.ММ.РРРР' : 'DD.MM.YYYY'
})

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
    name: 'user_display',
    required: true,
    label: t('pages.auditLogs.user'),
    align: 'left',
    field: 'display_name',
    sortable: true,
  },
  {
    name: 'user_type',
    label: t('pages.auditLogs.userType'),
    align: 'left',
    field: 'user_type',
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
    name: 'table',
    label: t('pages.auditLogs.table'),
    align: 'left',
    sortable: false,
  },
  {
    name: 'ip_address',
    label: 'IP',
    align: 'left',
    field: 'ip_address',
    sortable: true,
  },
  {
    name: 'audit_type',
    label: t('pages.auditLogs.auditType'),
    align: 'left',
    field: 'audit_type',
    sortable: true,
  },
  {
    name: 'changes',
    label: t('pages.auditLogs.changes.title'),
    align: 'center',
    field: 'changes',
  },
])

// Methods
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return date.formatDate(
    dateStr,
    locale.value === 'uk' ? 'DD.MM.YYYY HH:mm:ss' : 'MM/DD/YYYY HH:mm:ss',
  )
}

const formatActionType = (actionType) => {
  if (!actionType) return '-'
  return t(`pages.auditLogs.actions.${actionType.toLowerCase()}`)
}

const formatAuditType = (type) => {
  if (!type) return '-'
  return t(`pages.auditLogs.auditTypes.${type.toLowerCase()}`)
}

const getActionColor = (actionType) => {
  const colors = {
    CREATE: 'positive',
    UPDATE: 'warning',
    DELETE: 'negative',
    LOGIN: 'info',
    LOGOUT: 'grey',
    LOGIN_FAILED: 'orange',
  }
  return colors[actionType] || 'grey'
}

const getAuditTypeColor = (type) => {
  const colors = {
    SYSTEM: 'purple',
    BUSINESS: 'teal',
  }
  return colors[type] || 'grey'
}

const formatValues = (values) => {
  if (!values) return ''
  try {
    return JSON.stringify(values, null, 2)
  } catch (error) {
    console.error('Error formatting values:', error)
    return String(values)
  }
}

// API calls
const fetchLogTypes = async () => {
  try {
    const response = await AuditApi.getTypes()
    if (response.data.success) {
      actionTypeOptions.value = response.data.actionTypes.map((type) => ({
        label: t(`pages.auditLogs.actions.${type.toLowerCase()}`),
        value: type,
      }))
      entityTypeOptions.value = response.data.entityTypes.map((type) => ({
        label: t(`pages.auditLogs.entities.${type.toLowerCase()}`),
        value: type,
      }))
      // Зберігаємо дані про схеми
      schemasData.value = response.data.schemas.reduce((acc, schema) => {
        acc[schema.schema] = schema
        return acc
      }, {})
      // Формуємо опції для схем
      schemaOptions.value = response.data.schemas.map((schema) => ({
        label: schema.schema,
        value: schema.schema,
      }))

      // Ініціалізуємо searchable select-и
      actionTypeSearch.initializeOptions(actionTypeOptions.value)
      entityTypeSearch.initializeOptions(entityTypeOptions.value)
      schemaSearch.initializeOptions(schemaOptions.value)
    }
  } catch (error) {
    console.error('Error fetching log types:', error)
    $q.notify({
      type: 'negative',
      message: t('pages.auditLogs.fetchTypesError'),
    })
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage === 0 ? 'All' : pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value,
    }

    const response = await AuditApi.getLogs(params)
    if (response.data.success) {
      logs.value = response.data.logs
      pagination.value.rowsNumber = response.data.total
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

// Handlers
const showChanges = (log) => {
  selectedLog.value = log
  changesDialog.value = true
}

const showBrowserInfo = (log) => {
  selectedLog.value = log
  browserInfoDialog.value = true
}

const onSchemaChange = () => {
  const schema = filters.value.tableSchema
  filters.value.tableName = null
  if (schema) {
    tableOptions.value =
      schemasData.value[schema]?.tables.map((table) => ({
        label: table,
        value: table,
      })) || []
    tableSearch.initializeOptions(tableOptions.value)
  } else {
    tableOptions.value = []
    tableSearch.initializeOptions([])
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    actionType: null,
    entityType: null,
    dateFrom: null,
    dateTo: null,
    auditType: null,
    userType: null,
    tableSchema: null,
    tableName: null,
    ipAddress: null,
    hasChanges: null,
  }
}

const exportData = async () => {
  exporting.value = true
  try {
    const response = await AuditApi.exportLogs({
      ...filters.value,
      export: true,
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `audit-logs-${date.formatDate(Date.now(), 'YYYY-MM-DD')}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    $q.notify({
      type: 'positive',
      message: t('pages.auditLogs.exportSuccess'),
    })
  } catch (error) {
    console.error('Error exporting logs:', error)
    $q.notify({
      type: 'negative',
      message: t('pages.auditLogs.exportError'),
    })
  } finally {
    exporting.value = false
  }
}

const onRequest = async (props) => {
  try {
    // Перевіряємо, чи props - це об'єкт пагінації або містить пагінацію
    const paginationData = props.pagination || props

    // Безпечно отримуємо значення з nullish coalescing
    const page = paginationData.page ?? pagination.value.page
    const rowsPerPage = paginationData.rowsPerPage ?? pagination.value.rowsPerPage
    const sortBy = paginationData.sortBy ?? pagination.value.sortBy
    const descending = paginationData.descending ?? pagination.value.descending

    pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
    await fetchLogs()
  } catch (error) {
    console.error('Error in pagination request:', error)
    await fetchLogs()
  }
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    fetchLogs()
  },
  { deep: true },
)

// Lifecycle
onMounted(async () => {
  await fetchLogTypes()
  await fetchLogs()
})
</script>
