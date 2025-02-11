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
              v-model="editedUser.first_name"
              :label="$t('pages.users.first_name')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.users.required')]"
            />

            <q-input
              v-model="editedUser.last_name"
              :label="$t('pages.users.last_name')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.users.required')]"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-select
                  v-model="selectedCountryCode"
                  :options="countryCodes"
                  option-label="country"
                  option-value="code"
                  :label="$t('pages.users.countryCode')"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="country-select"
                >
                  <template v-slot:option="{ opt }">
                    <q-item>
                      <q-item-section>
                        <q-item-label>{{ opt.country }}</q-item-label>
                        <q-item-label caption>{{ opt.code }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

                  <template v-slot:selected>
                    <div class="row no-wrap">
                      <div class="text-subtitle2">{{ selectedCountryCode }}</div>
                    </div>
                  </template>
                </q-select>
              </div>
              <div class="col-8">
                <q-input
                  v-model="phoneNumber"
                  :label="$t('pages.users.phone')"
                  outlined
                  dense
                  :mask="selectedCountryMask"
                  unmasked-value
                  :rules="[(val) => !val || val.length >= 5 || $t('pages.users.invalidPhone')]"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>
            </div>

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
import { countryCodes, getPhoneWithoutCode, formatPhoneWithCode } from 'src/constants/countryCodes'

const selectedCountryCode = ref('+380')
const phoneNumber = ref('')

const selectedCountryMask = computed(() => {
  const country = countryCodes.find((c) => c.code === selectedCountryCode.value)
  return country ? country.mask : ''
})

const $q = useQuasar()
const { t } = useI18n()

// Table state
const loading = ref(false)
const users = ref([])
const search = ref('')
const pagination = ref({
  sortBy: 'last_name',
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
  first_name: '',
  last_name: '',
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
    name: 'first_name',
    required: true,
    label: t('pages.users.first_name'),
    align: 'left',
    field: 'first_name',
    sortable: true,
  },
  {
    name: 'last_name',
    required: true,
    label: t('pages.users.last_name'),
    align: 'left',
    field: 'last_name',
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
    const phone = user.phone || ''
    const countryCode = countryCodes.find((c) => phone.startsWith(c.code))
    selectedCountryCode.value = countryCode?.code || '+380'
    phoneNumber.value = getPhoneWithoutCode(phone)
    editedUser.value = {
      ...user,
      // Отримуємо роль зі списку ролей по імені
      role_id: roleOptions.value.find((role) => role.label === user.role_name)?.value,
      password: '',
      confirmPassword: '',
    }
  } else {
    selectedCountryCode.value = '+380'
    phoneNumber.value = ''
    editedUser.value = {
      id: null,
      role_id: null,
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
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
    const userData = {
      ...editedUser.value,
      phone: formatPhoneWithCode(phoneNumber.value, selectedCountryCode.value),
    }
    if (editedUser.value.id) {
      await api.put(`/user/${editedUser.value.id}`, userData)
    } else {
      await api.post('/user', userData)
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

const confirmDelete = async (user) => {
  const deleteUser = async (force = false) => {
    try {
      await api.delete(`/user/${user.id}${force ? '?force=true' : ''}`)
      await fetchUsers()
      $q.notify({
        type: 'positive',
        message: force ? t('pages.users.deleteWithAuditSuccess') : t('pages.users.deleteSuccess'),
      })
    } catch (error) {
      if (error.response?.status === 409 && error.response.data.hasAuditRecords) {
        // Show confirmation for deleting user with audit records
        $q.dialog({
          title: t('pages.users.confirmDeleteWithAudit'),
          message: t('pages.users.deleteWithAuditMessage', {
            name: `${user.first_name} ${user.last_name}`,
            count: error.response.data.recordsCount,
          }),
          persistent: true,
          ok: {
            color: 'negative',
            label: t('pages.users.confirmDeleteWithRecords'),
            flat: true,
          },
          cancel: {
            label: t('common.cancel'),
            flat: true,
          },
        }).onOk(async () => {
          await deleteUser(true)
        })
      } else {
        $q.notify({
          type: 'negative',
          message: t('pages.users.deleteError'),
        })
      }
    }
  }

  $q.dialog({
    title: t('pages.users.confirmDelete'),
    message: t('pages.users.deleteMessage', {
      name: `${user.first_name} ${user.last_name}`,
    }),
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
    await deleteUser()
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
.country-select {
  min-width: 120px;
}

:deep(.q-field__native > span) {
  opacity: 1 !important;
}

:deep(.q-select__dropdown-icon) {
  margin-left: 4px;
}

:deep(.q-field__prefix) {
  padding-right: 6px;
}
</style>
