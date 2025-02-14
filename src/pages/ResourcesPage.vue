<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('pages.resources.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="resources"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :selected-rows-label="$t('common.selectedRows')"
          :pagination-label="paginationLabel"
        >
          <template v-slot:top-right>
            <div class="row items-center q-gutter-md">
              <q-input
                v-model="search"
                dense
                outlined
                debounce="300"
                :placeholder="$t('pages.resources.search')"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>

              <q-btn
                color="primary"
                :label="$t('pages.resources.addResource')"
                @click="openResourceDialog()"
              />
            </div>
          </template>

          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-chip :color="getTypeColor(props.value)" text-color="white" dense>
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-sm">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openResourceDialog(props.row)"
              >
                <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                color="secondary"
                icon="settings"
                @click="openActionsDialog(props.row)"
              >
                <q-tooltip>{{ $t('pages.resources.manageActions') }}</q-tooltip>
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
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Resource Edit Dialog -->
    <q-dialog v-model="resourceDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{
              editedResource.id
                ? $t('pages.resources.editResource')
                : $t('pages.resources.addResource')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveResource" class="q-gutter-md">
            <q-input
              v-model="editedResource.name"
              :label="$t('pages.resources.name')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.resources.required')]"
            />

            <q-input
              v-model="editedResource.code"
              :label="$t('pages.resources.code')"
              outlined
              dense
              :disable="!!editedResource.id"
              :rules="[
                (val) => !!val || $t('pages.resources.required'),
                (val) => /^[a-z_]+$/.test(val) || $t('pages.resources.invalidCode'),
              ]"
            >
              <template v-slot:hint>
                {{ $t('pages.resources.codeHint') }}
              </template>
            </q-input>

            <q-select
              v-model="editedResource.type"
              :options="resourceTypes"
              :label="$t('pages.resources.type')"
              outlined
              dense
              :disable="!!editedResource.id"
              :rules="[(val) => !!val || $t('pages.resources.required')]"
            />

            <q-input
              v-model="editedResource.metadata"
              type="textarea"
              :label="$t('pages.resources.metadata')"
              outlined
              dense
              :rules="[
                (val) => {
                  try {
                    if (val) JSON.parse(val)
                    return true
                  } catch (e) {
                    return $t('pages.resources.invalidJson')
                  }
                },
              ]"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn color="primary" type="submit" :label="$t('common.save')" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Actions Dialog -->
    <q-dialog v-model="actionsDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('pages.resources.manageActions') }}</div>
          <div class="text-subtitle2">{{ selectedResource?.name }}</div>
        </q-card-section>

        <q-card-section>
          <div class="q-pa-sm">
            <div v-for="action in actions" :key="action.id" class="q-mb-sm">
              <q-checkbox v-model="action.is_default" :label="action.name" :disable="saving" />
              <div class="text-caption text-grey-7 q-pl-lg">{{ action.description }}</div>
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat :label="$t('common.cancel')" v-close-popup :disable="saving" />
            <q-btn
              color="primary"
              :label="$t('common.save')"
              :loading="saving"
              @click="saveActions"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ResourcesApi } from 'src/api/resources'

const $q = useQuasar()
const { t } = useI18n()

// Table state
const loading = ref(false)
const saving = ref(false)
const resources = ref([])
const search = ref('')
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Dialog states
const resourceDialog = ref(false)
const actionsDialog = ref(false)
const editedResource = ref({
  id: null,
  name: '',
  code: '',
  type: '',
  metadata: '{}',
})
const selectedResource = ref(null)
const actions = ref([])

const resourceTypes = ['table', 'module', 'function']

// Columns definition
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('pages.resources.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'code',
    required: true,
    label: t('pages.resources.code'),
    align: 'left',
    field: 'code',
    sortable: true,
  },
  {
    name: 'type',
    label: t('pages.resources.type'),
    align: 'center',
    field: 'type',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('pages.resources.actions'),
    align: 'center',
    field: 'actions',
  },
])

// Функція форматування лейблу пагінації
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const getTypeColor = (type) => {
  const colors = {
    table: 'purple',
    module: 'blue',
    function: 'green',
  }
  return colors[type] || 'grey'
}

// Fetch resources
const fetchResources = async () => {
  loading.value = true
  try {
    const response = await ResourcesApi.getResources({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage === 0 ? 'All' : pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      search: search.value.trim(),
    })
    resources.value = response.data.resources
    pagination.value.rowsNumber = response.data.total
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.resources.fetchError'),
    })
  } finally {
    loading.value = false
  }
}

// Fetch resource actions
const fetchResourceActions = async (resource) => {
  try {
    const response = await ResourcesApi.getResourceActions(resource.id)
    actions.value = response.data.actions
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.resources.actionsError'),
    })
  }
}

// Dialog handlers
const openResourceDialog = (resource = null) => {
  if (resource) {
    editedResource.value = {
      ...resource,
      metadata: JSON.stringify(resource.metadata, null, 2),
    }
  } else {
    editedResource.value = {
      id: null,
      name: '',
      code: '',
      type: '',
      metadata: '{}',
    }
  }
  resourceDialog.value = true
}

const openActionsDialog = async (resource) => {
  selectedResource.value = resource
  actionsDialog.value = true
  await fetchResourceActions(resource)
}

// Save handlers
const saveResource = async () => {
  saving.value = true
  try {
    const data = {
      ...editedResource.value,
      metadata: JSON.parse(editedResource.value.metadata),
    }

    if (editedResource.value.id) {
      await ResourcesApi.updateResource(editedResource.value.id, data)
    } else {
      await ResourcesApi.createResource(data)
    }
    await fetchResources()
    resourceDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.resources.saveSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.resources.saveError'),
    })
  } finally {
    saving.value = false
  }
}

const saveActions = async () => {
  saving.value = true
  try {
    await ResourcesApi.updateResourceActions(selectedResource.value.id, {
      actions: actions.value,
    })
    actionsDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.resources.actionsSaveSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.resources.actionsSaveError'),
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (resource) => {
  $q.dialog({
    title: t('pages.resources.confirmDelete'),
    message: t('pages.resources.deleteMessage', { name: resource.name }),
    persistent: true,
    ok: {
      color: 'negative',
      label: t('common.delete'),
      flat: true,
    },
    cancel: {
      label: t('common.cancel'),
      flat: true,
    },
  }).onOk(async () => {
    try {
      await ResourcesApi.deleteResource(resource.id)
      await fetchResources()
      $q.notify({
        type: 'positive',
        message: t('pages.resources.deleteSuccess'),
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: t('pages.resources.deleteError'),
      })
    }
  })
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
  await fetchResources()
}

// Watch для пошуку
watch(search, () => {
  pagination.value.page = 1
  fetchResources()
})

// Initial fetch
onMounted(() => {
  fetchResources()
})
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

<style scoped>
.groups-table {
  max-height: 400px;
  overflow-y: auto;
}

/* Стилі для світлої теми */
:deep(.q-table) thead tr {
  background: var(--q-primary);
}

:deep(.q-table) thead tr th {
  color: white !important;
  font-weight: 600 !important;
  padding: 8px 16px;
}

/* Стилі для темної теми */
.body--dark :deep(.q-table) thead tr {
  background: var(--q-dark);
}

.body--dark :deep(.q-table) thead tr th {
  color: white !important;
}

/* Стилі для ховера рядків */
:deep(.q-table) tbody tr:hover {
  background: rgba(var(--q-primary), 0.1);
}

/* Стилі для парних рядків */
:deep(.q-table) tbody tr:nth-child(even) {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark :deep(.q-table) tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.03);
}

/* Стилі для клітинок таблиці */
:deep(.q-table) td {
  padding: 8px 16px;
}

/* Стилі для границь таблиці */
:deep(.q-table) {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark :deep(.q-table) {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Стилі для розділових ліній */
:deep(.q-table) th,
:deep(.q-table) td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark :deep(.q-table) th,
.body--dark :deep(.q-table) td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
