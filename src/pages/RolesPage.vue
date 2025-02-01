<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('pages.roles.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="roles"
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
              :placeholder="$t('pages.roles.search')"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn
              color="primary"
              :label="$t('pages.roles.addRole')"
              class="q-ml-md"
              @click="openRoleDialog()"
            />
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-sm">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openRoleDialog(props.row)"
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

    <!-- Role Edit Dialog -->
    <q-dialog v-model="roleDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ editedRole.id ? $t('pages.roles.editRole') : $t('pages.roles.addRole') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveRole" class="q-gutter-md">
            <q-input
              v-model="editedRole.name"
              :label="$t('pages.roles.name')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.roles.required')]"
            />

            <q-input
              v-model="editedRole.description"
              :label="$t('pages.roles.description')"
              outlined
              dense
              type="textarea"
            />

            <div class="permissions-section">
              <div class="text-subtitle2 q-mb-sm">{{ $t('pages.roles.permissions') }}</div>
              <div v-for="group in permissionGroups" :key="group.name" class="q-mb-md">
                <div class="text-weight-bold q-mb-xs">{{ group.name }}</div>
                <q-option-group
                  v-model="selectedPermissions"
                  :options="group.permissions"
                  type="checkbox"
                  dense
                />
              </div>
            </div>

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
const roles = ref([])
const search = ref('')
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Dialog state
const roleDialog = ref(false)
const editedRole = ref({
  id: null,
  name: '',
  description: '',
})
const saving = ref(false)

// Permissions state
const permissions = ref([])
const selectedPermissions = ref([])

// Групуємо права за категоріями
const permissionGroups = computed(() => {
  const groups = {}
  permissions.value.forEach((permission) => {
    if (!groups[permission.group]) {
      groups[permission.group] = {
        name: permission.group,
        permissions: [],
      }
    }
    groups[permission.group].permissions.push({
      label: permission.name,
      value: permission.id,
    })
  })
  return Object.values(groups)
})

// Table columns
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('pages.roles.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'description',
    label: t('pages.roles.description'),
    align: 'left',
    field: 'description',
    sortable: true,
  },
  {
    name: 'created_at',
    label: t('pages.roles.createdAt'),
    align: 'left',
    field: 'created_at',
    sortable: true,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    name: 'updated_at',
    label: t('pages.roles.updatedAt'),
    align: 'left',
    field: 'updated_at',
    sortable: true,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    name: 'actions',
    label: t('pages.roles.actions'),
    align: 'center',
    field: 'actions',
  },
])

// Функція форматування лейблу пагінації
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

// Fetch roles
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await api.get('/roles', {
      params: {
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage === 0 ? 'All' : pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        search: search.value,
      },
    })
    roles.value = response.data.roles
    pagination.value.rowsNumber = response.data.total
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.roles.fetchError'),
    })
  } finally {
    loading.value = false
  }
}

// Fetch permissions
const fetchPermissions = async () => {
  try {
    const response = await api.get('/roles/permissions')
    permissions.value = response.data.permissions
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.roles.permissionsError'),
    })
  }
}

// Dialog handlers
const openRoleDialog = async (role = null) => {
  if (role) {
    editedRole.value = { ...role }
    try {
      const response = await api.get(`/roles/${role.id}/permissions`)
      selectedPermissions.value = response.data.permissions.map((p) => p.id)
    } catch {
      $q.notify({
        type: 'negative',
        message: t('pages.roles.fetchPermissionsError'),
      })
    }
  } else {
    editedRole.value = {
      id: null,
      name: '',
      description: '',
    }
    selectedPermissions.value = []
  }
  roleDialog.value = true
}

// Save handlers
const saveRole = async () => {
  saving.value = true
  try {
    const roleData = {
      ...editedRole.value,
      permissions: selectedPermissions.value,
    }

    if (editedRole.value.id) {
      await api.put(`/roles/${editedRole.value.id}`, roleData)
    } else {
      await api.post('/roles', roleData)
    }
    await fetchRoles()
    roleDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.roles.saveSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.roles.saveError'),
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (role) => {
  // Перевіряємо чи це не системна роль
  if (role.is_system) {
    $q.notify({
      type: 'negative',
      message: t('pages.roles.cantDeleteSystem'),
    })
    return
  }

  $q.dialog({
    title: t('pages.roles.confirmDelete'),
    message: t('pages.roles.deleteMessage', { name: role.name }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/roles/${role.id}`)
      await fetchRoles()
      $q.notify({
        type: 'positive',
        message: t('pages.roles.deleteSuccess'),
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: t('pages.roles.deleteError'),
      })
    }
  })
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
  await fetchRoles()
}

// Watch для пошуку
watch(search, () => {
  pagination.value.page = 1
  fetchRoles()
})

// Initial fetch
onMounted(() => {
  fetchRoles()
  fetchPermissions()
})
</script>

<style scoped>
.permissions-section {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
}
</style>
