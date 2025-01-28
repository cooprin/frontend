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
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- Top section with search and add button -->
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

          <!-- Actions column -->
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
                <q-tooltip>{{ $t('pages.users.edit') }}</q-tooltip>
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
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>{{ $t('pages.users.delete') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- User Edit Dialog -->
    <q-dialog v-model="userDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ editedUser.id ? $t('pages.users.editUser') : $t('pages.users.addUser') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveUser" class="q-gutter-md">
            <q-input
              v-model="editedUser.first_name"
              :label="$t('pages.users.firstName')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.users.required')]"
            />
            <q-input
              v-model="editedUser.last_name"
              :label="$t('pages.users.lastName')"
              outlined
              dense
              :rules="[(val) => !!val || $t('pages.users.required')]"
            />
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

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn color="primary" type="submit" :label="$t('common.save')" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Password Change Dialog -->
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
import { ref, onMounted } from 'vue'
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
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Dialog state
const userDialog = ref(false)
const passwordDialog = ref(false)
const editedUser = ref({
  id: null,
  first_name: '',
  last_name: '',
  email: '',
})
const passwordData = ref({
  userId: null,
  password: '',
  confirmPassword: '',
})
const saving = ref(false)
const savingPassword = ref(false)

const columns = [
  {
    name: 'first_name',
    required: true,
    label: t('pages.users.firstName'),
    align: 'left',
    field: 'first_name',
    sortable: true,
  },
  {
    name: 'last_name',
    required: true,
    label: t('pages.users.lastName'),
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
    name: 'actions',
    label: t('pages.users.actions'),
    align: 'center',
    field: 'actions',
  },
]

// Fetch users
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/users', {
      params: {
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
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
    editedUser.value = { ...user }
  } else {
    editedUser.value = {
      id: null,
      first_name: '',
      last_name: '',
      email: '',
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
      await api.put(`/users/${editedUser.value.id}`, editedUser.value)
    } else {
      await api.post('/users', editedUser.value)
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
    await api.put(`/users/${passwordData.value.userId}/password`, {
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

const confirmDelete = (user) => {
  $q.dialog({
    title: t('pages.users.confirmDelete'),
    message: t('pages.users.deleteMessage', { name: `${user.first_name} ${user.last_name}` }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/users/${user.id}`)
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

onMounted(fetchUsers)
</script>
