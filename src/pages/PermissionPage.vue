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
          @update:pagination="onRequest"
        >
          <template v-slot:top-right>
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
              color="primary"
              :label="$t('pages.permissions.addPermission')"
              class="q-ml-md"
              @click="openPermissionDialog()"
            />
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
const permissions = ref([])
const search = ref('')
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Функція форматування лейблу пагінації
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

// Dialog state
const permissionDialog = ref(false)
const editedPermission = ref({
  id: null,
  name: '',
  code: '',
  group_id: null,
})
const saving = ref(false)
const groupOptions = ref([])

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

// Fetch groups
const fetchGroups = async () => {
  try {
    const response = await api.get('/permissions/groups')
    groupOptions.value = response.data.groups.map((group) => ({
      label: group.name,
      value: group.id,
    }))
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.permissions.groupsError'),
    })
  }
}

// Fetch permissions
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
