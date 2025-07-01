<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('warehouses.title') }}</div>
      </q-card-section>
      <q-card-section>
        <q-table
          v-model:pagination="pagination"
          :rows="warehouses"
          :columns="columns"
          :loading="loading"
          binary-state-sort
          @request="onRequest"
          row-key="id"
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :pagination-label="paginationLabel"
        >
          <template v-slot:top-right>
            <q-input
              v-model="filters.search"
              :label="$t('common.search')"
              dense
              outlined
              debounce="300"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="primary"
              :label="$t('warehouses.add')"
              icon="add"
              class="q-ml-md"
              @click="openCreateDialog"
            />
          </template>
          <!-- Слот для статусу -->
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-chip :color="props.row.is_active ? 'positive' : 'grey'" text-color="white" dense>
                {{ props.row.is_active ? $t('common.active') : $t('common.inactive') }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для відповідальної особи -->
          <template v-slot:body-cell-responsible_person="props">
            <q-td :props="props">
              <div>{{ props.row.responsible_person_name }}</div>
              <div class="text-caption">{{ props.row.responsible_person_email }}</div>
            </q-td>
          </template>

          <!-- Слот для дій -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-sm">
              <q-btn
                color="primary"
                icon="inventory"
                size="sm"
                flat
                dense
                :to="{ name: 'stock', query: { warehouse: props.row.id } }"
              >
                <q-tooltip>{{ $t('warehouses.viewStock') }}</q-tooltip>
              </q-btn>
              <q-btn
                color="warning"
                icon="edit"
                size="sm"
                flat
                dense
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="!props.row.total_items"
                color="negative"
                icon="delete"
                size="sm"
                flat
                dense
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Діалог створення/редагування -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ isEdit ? $t('warehouses.edit') : $t('warehouses.create') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <!-- Назва -->
            <q-input
              v-model="form.name"
              :label="$t('warehouses.name')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
            />

            <!-- Опис -->
            <q-input
              v-model="form.description"
              :label="$t('warehouses.description')"
              type="textarea"
              outlined
            />

            <!-- Адреса -->
            <q-input
              v-model="form.address"
              :label="$t('warehouses.address')"
              type="textarea"
              outlined
            />

            <!-- Відповідальна особа -->
            <q-select
              v-model="form.responsible_person_id"
              :options="userSearch.filteredOptions.value"
              :label="$t('warehouses.responsiblePerson')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="(val, update) => userSearch.filterOptions(val, update)"
              @popup-show="userSearch.resetFilter"
            />

            <!-- Статус -->
            <q-toggle v-if="isEdit" v-model="form.is_active" :label="$t('warehouses.isActive')" />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог підтвердження видалення -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('warehouses.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteWarehouse"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { debounce } from 'lodash'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WarehousesApi } from 'src/api/warehouses'
import { UsersApi } from 'src/api/users'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const warehouses = ref([])
const showDialog = ref(false)
const deleteDialog = ref(false)
const warehouseToDelete = ref(null)
const isEdit = ref(false)
const userOptions = ref([])
// Searchable selects
const userSearch = useSearchableSelect(userOptions)

// Form
const defaultForm = {
  name: '',
  description: '',
  address: '',
  responsible_person_id: null,
  is_active: true,
}
const form = ref({ ...defaultForm })

// Фільтри
const filters = ref({
  search: '',
})

// Пагінація
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'name',
  descending: false,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

// Колонки таблиці
const columns = computed(() => [
  {
    name: 'name',
    field: 'name',
    label: t('warehouses.name'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'responsible_person',
    field: (row) => row,
    label: t('warehouses.responsiblePerson'),
    align: 'left',
    sortable: false,
  },
  {
    name: 'total_items',
    field: 'total_items',
    label: t('warehouses.totalItems'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'is_active',
    field: 'is_active',
    label: t('common.status'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    sortable: false,
  },
])

// Methods
const loadWarehouses = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await WarehousesApi.getWarehouses(params)
    warehouses.value = response.data.warehouses
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading data:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const response = await UsersApi.getUsers({
      is_active: true,
      per_page: 'All',
    })
    userOptions.value = response.data.users.map((u) => ({
      label: `${u.first_name} ${u.last_name}`,
      value: u.id,
    }))
    userSearch.initializeOptions(userOptions.value)
  } catch (error) {
    console.error('Error loading users:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value = {
    ...pagination.value,
    page,
    rowsPerPage,
    sortBy,
    descending,
  }
  await loadWarehouses()
}

const openCreateDialog = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  showDialog.value = true
}

const openEditDialog = (warehouse) => {
  isEdit.value = true
  form.value = { ...warehouse }
  showDialog.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await WarehousesApi.updateWarehouse(form.value.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('warehouses.updateSuccess'),
        icon: 'check',
      })
    } else {
      await WarehousesApi.createWarehouse(form.value)
      $q.notify({
        color: 'positive',
        message: t('warehouses.createSuccess'),
        icon: 'check',
      })
    }
    showDialog.value = false
    loadWarehouses()
  } catch {
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (warehouse) => {
  warehouseToDelete.value = warehouse
  deleteDialog.value = true
}

const deleteWarehouse = async () => {
  try {
    await WarehousesApi.deleteWarehouse(warehouseToDelete.value.id)
    $q.notify({
      color: 'positive',
      message: t('warehouses.deleteSuccess'),
      icon: 'check',
    })
    loadWarehouses()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

watch(
  () => ({
    ...filters.value,
    page: pagination.value.page,
    rowsPerPage: pagination.value.rowsPerPage,
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
  }),
  debounce(() => {
    loadWarehouses()
  }, 300),
  { deep: true },
)

onMounted(() => {
  loadWarehouses()
  loadUsers()
})
</script>
