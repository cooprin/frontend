<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('pages.users.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="users"
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
              :placeholder="$t('pages.users.search')"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn
              color="primary"
              :label="$t('pages.users.addUser')"
              class="q-ml-md"
              @click="openUserDialog()"
            />
          </template>

          <template v-slot:body-cell-role="props">
            <q-td :props="props">
              {{ props.row.role_name }}
            </q-td>
          </template>

          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.is_active ? 'positive' : 'negative'"
                text-color="white"
                dense
              >
                {{ props.row.is_active ? $t('common.active') : $t('common.inactive') }}
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
                @click="openUserDialog(props.row)"
              >
                <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="secondary"
                icon="lock"
                @click="openPasswordDialog(props.row)"
              >
                <q-tooltip>{{ $t('pages.users.changePassword') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                :color="props.row.is_active ? 'negative' : 'positive'"
                :icon="props.row.is_active ? 'block' : 'check_circle'"
                @click="toggleUserStatus(props.row)"
              >
                <q-tooltip>
                  {{
                    props.row.is_active ? $t('pages.users.deactivate') : $t('pages.users.activate')
                  }}
                </q-tooltip>
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

    <!-- User Edit Dialog -->
    <q-dialog v-model="userDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editedUser.id ? $t('pages.users.editUser') : $t('pages.users.addUser') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveUser" class="q-gutter-md">
            <q-input
              v-model="editedUser.email"
              :label="$t('pages.users.email')"
              outlined
              dense
              type="email"
              :rules="[
                (val) => !!val || $t('pages.users.required'),
                (val) => /^[^@]+@[^@]+\.[^@]+$/.test(val) || $t('pages.users.invalidEmail'),
              ]"
            />

            <template v-if="!editedUser.id">
              <q-input
                v-model="editedUser.password"
                :label="$t('pages.users.password')"
                outlined
                dense
                type="password"
                :rules="[
                  (val) => !!val || $t('pages.users.required'),
                  (val) => val.length >= 8 || $t('pages.users.passwordLength'),
                ]"
              />

              <q-input
                v-model="editedUser.confirmPassword"
                :label="$t('pages.users.confirmPassword')"
                outlined
                dense
                type="password"
                :rules="[
                  (val) => !!val || $t('pages.users.required'),
                  (val) => val === editedUser.password || $t('pages.users.passwordMatch'),
                ]"
              />
            </template>

            <q-select
              v-model="editedUser.role_id"
              :options="roleOptions"
              :label="$t('pages.users.role')"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || $t('pages.users.required')]"
            />

            <q-input
              v-model="editedUser.firstName"
              :label="$t('pages.users.firstName')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.users.required')]"
            />

            <q-input
              v-model="editedUser.lastName"
              :label="$t('pages.users.lastName')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.users.required')]"
            />

            <q-input
              v-model="editedUser.phone"
              :label="$t('pages.users.phone')"
              outlined
              dense
              mask="(###) ###-####"
            />

            <q-toggle v-model="editedUser.is_active" :label="$t('pages.users.isActive')" />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn color="primary" type="submit" :label="$t('common.save')" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Password Dialog -->
    <q-dialog v-model="passwordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('pages.users.changePassword') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePassword" class="q-gutter-md">
            <q-input
              v-model="passwordData.password"
              :label="$t('pages.users.newPassword')"
              outlined
              dense
              type="password"
              :rules="[
                (val) => !!val || $t('pages.users.required'),
                (val) => val.length >= 8 || $t('pages.users.passwordLength'),
              ]"
            />
            <q-input
              v-model="passwordData.confirmPassword"
              :label="$t('pages.users.confirmPassword')"
              outlined
              dense
              type="password"
              :rules="[
                (val) => !!val || $t('pages.users.required'),
                (val) => val === passwordData.password || $t('pages.users.passwordMatch'),
              ]"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn
                color="primary"
                type="submit"
                :label="$t('common.save')"
                :loading="savingPassword"
              />
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
const users = ref([])
const search = ref('')
const pagination = ref({
  sortBy: 'lastName',
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
const userDialog = ref(false)
const passwordDialog = ref(false)
const editedUser = ref({
  id: null,
  role_id: null,
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  is_active: true,
})
const passwordData = ref({
  userId: null,
  password: '',
  confirmPassword: '',
})
const saving = ref(false)
const savingPassword = ref(false)
const roleOptions = ref([])

const columns = computed(() => [
  {
    name: 'firstName',
    required: true,
    label: t('pages.users.firstName'),
    align: 'left',
    field: 'firstName',
    sortable: true,
  },
  {
    name: 'lastName',
    required: true,
    label: t('pages.users.lastName'),
    align: 'left',
    field: 'lastName',
    sortable: true,
  },
  {
    name: 'email',
    required: true,
    label: t('pages.users.email'),
    align: 'left',
    field: 'email',
    sortable: true,
  },
  {
    name: 'role',
    required: true,
    label: t('pages.users.role'),
    align: 'left',
    field: 'role_name',
    sortable: true,
  },
  {
    name: 'phone',
    label: t('pages.users.phone'),
    align: 'left',
    field: 'phone',
    sortable: true,
  },
  {
    name: 'is_active',
    label: t('pages.users.status'),
    align: 'center',
    field: 'is_active',
    sortable: true,
  },
  {
    name: 'last_login',
    label: t('pages.users.lastLogin'),
    align: 'left',
    field: 'last_login',
    sortable: true,
    format: (val) => (val ? new Date(val).toLocaleString() : '-'),
  },
  {
    name: 'actions',
    label: t('pages.users.actions'),
    align: 'center',
    field: 'actions',
  },
])

// Fetch roles
const fetchRoles = async () => {
  try {
    const response = await api.get('/user/roles')
    roleOptions.value = response.data.roles.map((role) => ({
      label: role.name,
      value: role.id,
    }))
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.users.rolesError'),
    })
  }
}

// Fetch users
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/user', {
      params: {
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage === 0 ? 'All' : pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        search: search.value,
      },
    })
    users.value = response.data.users
    pagination.value.rowsNumber = response.data.total
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.users.fetchError'),
    })
  } finally {
    loading.value = false
  }
}

// Dialog handlers
const openUserDialog = (user = null) => {
  if (user) {
    editedUser.value = {
      ...user,
      // Отримуємо роль зі списку ролей по імені
      role_id: roleOptions.value.find((role) => role.label === user.role_name)?.value,
      password: '',
      confirmPassword: '',
    }
  } else {
    editedUser.value = {
      id: null,
      role_id: null,
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      is_active: true,
    }
  }
  userDialog.value = true
}

const openPasswordDialog = (user) => {
  passwordData.value = {
    userId: user.id,
    password: '',
    confirmPassword: '',
  }
  passwordDialog.value = true
}

// Save handlers
const saveUser = async () => {
  saving.value = true
  try {
    if (editedUser.value.id) {
      await api.put(`/user/${editedUser.value.id}`, editedUser.value)
    } else {
      await api.post('/user', editedUser.value)
    }
    await fetchUsers()
    userDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.users.saveSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.users.saveError'),
    })
  } finally {
    saving.value = false
  }
}

const savePassword = async () => {
  savingPassword.value = true
  try {
    await api.put(`/user/${passwordData.value.userId}/password`, {
      password: passwordData.value.password,
    })
    passwordDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.users.passwordSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.users.passwordError'),
    })
  } finally {
    savingPassword.value = false
  }
}

const toggleUserStatus = async (user) => {
  try {
    await api.put(`/user/${user.id}/status`, {
      is_active: !user.is_active,
    })
    await fetchUsers()
    $q.notify({
      type: 'positive',
      message: t('pages.users.statusUpdateSuccess'),
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('pages.users.statusUpdateError'),
    })
  }
}

const confirmDelete = (user) => {
  $q.dialog({
    title: t('pages.users.confirmDelete'),
    message: t('pages.users.deleteMessage', { name: `${user.firstName} ${user.lastName}` }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/user/${user.id}`)
      await fetchUsers()
      $q.notify({
        type: 'positive',
        message: t('pages.users.deleteSuccess'),
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: t('pages.users.deleteError'),
      })
    }
  })
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
  await fetchUsers()
}

// Watch для пошуку
watch(search, () => {
  pagination.value.page = 1
  fetchUsers()
})

// Initial fetch
onMounted(() => {
  fetchRoles()
  fetchUsers()
})
</script>
