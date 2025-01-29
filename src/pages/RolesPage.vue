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
          :pagination="pagination"
          @request="onRequest"
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
      <q-card style="min-width: 400px">
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
import { ref, onMounted } from 'vue'
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
})

// Dialog state
const roleDialog = ref(false)
const editedRole = ref({
  id: null,
  name: '',
  description: '',
})
const saving = ref(false)

const columns = [
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
]

// Fetch roles
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await api.get('/roles', {
      params: {
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
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

// Dialog handlers
const openRoleDialog = (role = null) => {
  if (role) {
    editedRole.value = { ...role }
  } else {
    editedRole.value = {
      id: null,
      name: '',
      description: '',
    }
  }
  roleDialog.value = true
}

// Save handlers
const saveRole = async () => {
  saving.value = true
  try {
    if (editedRole.value.id) {
      await api.put(`/roles/${editedRole.value.id}`, editedRole.value)
    } else {
      await api.post('/roles', editedRole.value)
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

onMounted(fetchRoles)
</script>
