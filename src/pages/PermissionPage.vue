<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('pages.permissions.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="permissions"
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
                :placeholder="$t('pages.permissions.search')"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>

              <q-btn
                color="secondary"
                :label="$t('pages.permissions.manageGroups')"
                @click="openGroupsDialog"
              />

              <q-btn
                color="primary"
                icon="add"
                :label="$t('pages.permissions.addPermission')"
                @click="openPermissionDialog()"
              />
            </div>
          </template>

          <template v-slot:body-cell-is_system="props">
            <q-td :props="props">
              <q-chip :color="props.row.is_system ? 'primary' : 'grey'" text-color="white" dense>
                {{ props.row.is_system ? $t('common.yes') : $t('common.no') }}
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
                @click="openPermissionDialog(props.row)"
                :disable="props.row.is_system"
              >
                <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
                :disable="props.row.is_system"
              >
                <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Permission Edit Dialog -->
    <q-dialog v-model="permissionDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{
              editedPermission.id
                ? $t('pages.permissions.editPermission')
                : $t('pages.permissions.addPermission')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePermission" class="q-gutter-md">
            <q-input
              v-model="editedPermission.name"
              :label="$t('pages.permissions.name')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.permissions.required')]"
            />

            <q-input
              v-model="editedPermission.code"
              :label="$t('pages.permissions.code')"
              outlined
              dense
              :rules="[
                (val) => !!val || $t('pages.permissions.required'),
                (val) => /^[a-z]+\.[a-z]+$/.test(val) || $t('pages.permissions.invalidCode'),
              ]"
            >
              <template v-slot:hint>
                {{ $t('pages.permissions.codeHint') }}
              </template>
            </q-input>

            <q-select
              v-model="editedPermission.group_id"
              :options="groupOptions"
              :label="$t('pages.permissions.group')"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || $t('pages.permissions.required')]"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn color="primary" type="submit" :label="$t('common.save')" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Groups Dialog -->
    <q-dialog v-model="groupDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{
              editedGroup.id ? $t('pages.permissions.editGroup') : $t('pages.permissions.addGroup')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveGroup" class="q-gutter-md">
            <q-input
              v-model="editedGroup.name"
              :label="$t('pages.permissions.groupName')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.permissions.required')]"
            />

            <q-input
              v-model="editedGroup.description"
              :label="$t('pages.permissions.groupDescription')"
              outlined
              dense
              type="textarea"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn
                color="primary"
                type="submit"
                :label="$t('common.save')"
                :loading="savingGroup"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Groups List Dialog -->
    <q-dialog v-model="groupsListDialog">
      <q-card style="min-width: 700px">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">{{ $t('pages.permissions.groups') }}</div>
            <q-btn
              color="primary"
              :label="$t('pages.permissions.addGroup')"
              @click="openGroupDialog()"
            />
          </div>
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="groups"
            :columns="groupColumns"
            row-key="id"
            :loading="loadingGroups"
            :pagination-label="paginationLabel"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-sm">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="openGroupDialog(props.row)"
                >
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDeleteGroup(props.row)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'

const $q = useQuasar()
const { t } = useI18n()

// Table state
const loading = ref(false)
const loadingGroups = ref(false)
const permissions = ref([])
const groups = ref([])
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
const permissionDialog = ref(false)
const groupDialog = ref(false)
const groupsListDialog = ref(false)
const saving = ref(false)
const savingGroup = ref(false)

// Edited items
const editedPermission = ref({
  id: null,
  name: '',
  code: '',
  group_id: null,
})

const editedGroup = ref({
  id: null,
  name: '',
  description: '',
})

const groupOptions = ref([])

// Функція форматування лейблу пагінації
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}
// Columns definitions
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('pages.permissions.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'code',
    required: true,
    label: t('pages.permissions.code'),
    align: 'left',
    field: 'code',
    sortable: true,
  },
  {
    name: 'group_name',
    label: t('pages.permissions.group'),
    align: 'left',
    field: 'group_name',
    sortable: true,
  },
  {
    name: 'is_system',
    label: t('pages.permissions.isSystem'),
    align: 'center',
    field: 'is_system',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('pages.permissions.actions'),
    align: 'center',
    field: 'actions',
  },
])

const groupColumns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('pages.permissions.groupName'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'description',
    label: t('pages.permissions.groupDescription'),
    align: 'left',
    field: 'description',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('pages.permissions.actions'),
    align: 'center',
    field: 'actions',
  },
])

// Fetch functions
const fetchGroups = async () => {
  loadingGroups.value = true
  try {
    const response = await api.get('/permissions/groups')
    groups.value = response.data.groups
    groupOptions.value = response.data.groups.map((group) => ({
      label: group.name,
      value: group.id,
    }))
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.permissions.groupsError'),
    })
  } finally {
    loadingGroups.value = false
  }
}

const fetchPermissions = async () => {
  loading.value = true
  try {
    const response = await api.get('/permissions', {
      params: {
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage === 0 ? 'All' : pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        search: search.value,
      },
    })
    permissions.value = response.data.permissions
    pagination.value.rowsNumber = response.data.total
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.permissions.fetchError'),
    })
  } finally {
    loading.value = false
  }
}

// Dialog handlers
const openPermissionDialog = (permission = null) => {
  if (permission) {
    editedPermission.value = {
      ...permission,
      group_id: groupOptions.value.find((group) => group.label === permission.group_name)?.value,
    }
  } else {
    editedPermission.value = {
      id: null,
      name: '',
      code: '',
      group_id: null,
    }
  }
  permissionDialog.value = true
}

const openGroupDialog = (group = null) => {
  if (group) {
    editedGroup.value = { ...group }
  } else {
    editedGroup.value = {
      id: null,
      name: '',
      description: '',
    }
  }
  groupDialog.value = true
}

const openGroupsDialog = () => {
  groupsListDialog.value = true
  fetchGroups()
}

// Save handlers
const savePermission = async () => {
  saving.value = true
  try {
    if (editedPermission.value.id) {
      await api.put(`/permissions/${editedPermission.value.id}`, editedPermission.value)
    } else {
      await api.post('/permissions', editedPermission.value)
    }
    await fetchPermissions()
    permissionDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.permissions.saveSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.permissions.saveError'),
    })
  } finally {
    saving.value = false
  }
}

const saveGroup = async () => {
  savingGroup.value = true
  try {
    if (editedGroup.value.id) {
      await api.put(`/permissions/groups/${editedGroup.value.id}`, editedGroup.value)
    } else {
      await api.post('/permissions/groups', editedGroup.value)
    }
    await fetchGroups()
    groupDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.permissions.groupSaveSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.permissions.groupSaveError'),
    })
  } finally {
    savingGroup.value = false
  }
}

// Delete handlers
const confirmDelete = (permission) => {
  if (permission.is_system) {
    return $q.notify({
      type: 'warning',
      message: t('pages.permissions.cannotDeleteSystem'),
    })
  }

  $q.dialog({
    title: t('pages.permissions.confirmDelete'),
    message: t('pages.permissions.deleteMessage', { name: permission.name }),
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
      await api.delete(`/permissions/${permission.id}`)
      await fetchPermissions()
      $q.notify({
        type: 'positive',
        message: t('pages.permissions.deleteSuccess'),
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: t('pages.permissions.deleteError'),
      })
    }
  })
}

const confirmDeleteGroup = (group) => {
  $q.dialog({
    title: t('pages.permissions.confirmDeleteGroup'),
    message: t('pages.permissions.deleteGroupMessage', { name: group.name }),
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
      await api.delete(`/permissions/groups/${group.id}`)
      await fetchGroups()
      $q.notify({
        type: 'positive',
        message: t('pages.permissions.groupDeleteSuccess'),
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: t('pages.permissions.groupDeleteError'),
      })
    }
  })
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
  await fetchPermissions()
}

// Watch для пошуку
watch(search, () => {
  pagination.value.page = 1
  fetchPermissions()
})

// Initial fetch
onMounted(() => {
  fetchGroups()
  fetchPermissions()
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
