<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('pages.auditLogs.title') }}</div>
      </q-card-section>

      <q-card-section>
        <!-- Фільтри -->
        <div class="row q-col-gutter-sm q-mb-md">
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
        </div>

        <!-- Таблиця -->
        <q-table
          :rows="logs"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-changes="props">
            <q-td :props="props">
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
    <q-dialog v-model="changesDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('pages.auditLogs.changes') }}</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-y-md">
            <div class="col-12" v-if="selectedLog?.oldValues">
              <div class="text-subtitle2">{{ $t('pages.auditLogs.oldValues') }}</div>
              <pre>{{ JSON.stringify(selectedLog.oldValues, null, 2) }}</pre>
            </div>
            <div class="col-12" v-if="selectedLog?.newValues">
              <div class="text-subtitle2">{{ $t('pages.auditLogs.newValues') }}</div>
              <pre>{{ JSON.stringify(selectedLog.newValues, null, 2) }}</pre>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'

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
})

const filters = ref({
  actionType: null,
  entityType: null,
  dateFrom: null,
  dateTo: null,
})

// Опції для фільтрів
const actionTypeOptions = [
  { label: t('pages.auditLogs.actions.login'), value: 'LOGIN' },
  { label: t('pages.auditLogs.actions.create'), value: 'CREATE' },
  { label: t('pages.auditLogs.actions.update'), value: 'UPDATE' },
  { label: t('pages.auditLogs.actions.delete'), value: 'DELETE' },
]

const entityTypeOptions = [
  { label: t('pages.auditLogs.entities.user'), value: 'USER' },
  { label: t('pages.auditLogs.entities.role'), value: 'ROLE' },
]

// Діалог змін
const changesDialog = ref(false)
const selectedLog = ref(null)

// Колонки таблиці
const columns = computed(() => [
  {
    name: 'created_at',
    required: true,
    label: t('pages.auditLogs.date'),
    align: 'left',
    field: (row) => new Date(row.created_at).toLocaleString(),
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
  },
])

// Методи
const fetchLogs = async () => {
  loading.value = true
  try {
    const response = await api.get('/audit-logs', {
      params: {
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        ...filters.value,
      },
    })
    logs.value = response.data.logs
    pagination.value.rowsNumber = response.data.total
  } catch {
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

// Initial fetch
onMounted(fetchLogs)
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
