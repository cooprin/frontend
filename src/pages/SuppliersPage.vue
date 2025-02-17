<template>
  <q-page padding>
    <!-- Заголовок і кнопка додавання -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-md">{{ $t('suppliers.title') }}</h5>
      <q-btn color="primary" :label="$t('suppliers.add')" icon="add" @click="openCreateDialog" />
    </div>

    <!-- Фільтри -->
    <!-- Фільтри -->
    <div class="row q-col-gutter-sm q-mb-md">
      <!-- Пошук -->
      <div class="col-12 col-sm-4">
        <q-input
          v-model="filters.search"
          :label="$t('common.search')"
          dense
          outlined
          clearable
          :loading="loading"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Фільтр по статусу -->
      <div class="col-12 col-sm-4">
        <q-select
          v-model="filters.isActive"
          :options="statusOptions"
          :label="$t('suppliers.filters.status')"
          dense
          outlined
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- Таблиця -->
    <q-table
      v-model:pagination="pagination"
      :rows="suppliers"
      :columns="columns"
      :loading="loading"
      :rows-per-page-options="[10, 20, 50, 100]"
      row-key="id"
      flat
      bordered
      @request="onRequest"
      :rows-per-page-label="$t('common.rowsPerPage')"
      :selected-rows-label="$t('common.selectedRows')"
      :pagination-label="paginationLabel"
      @update:pagination="onRequest"
    >
      <!-- Слот для статусу -->
      <template v-slot:body-cell-is_active="props">
        <q-td :props="props">
          <q-chip :color="props.row.is_active ? 'positive' : 'grey'" text-color="white" dense>
            {{ props.row.is_active ? $t('common.active') : $t('common.inactive') }}
          </q-chip>
        </q-td>
      </template>

      <!-- Слот для контактів -->
      <template v-slot:body-cell-contacts="props">
        <q-td :props="props">
          <div class="text-body2">{{ props.row.contact_person }}</div>
          <div class="text-caption">{{ props.row.phone }}</div>
          <div class="text-caption">{{ props.row.email }}</div>
        </q-td>
      </template>

      <!-- Слот для дій -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-sm">
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
            v-if="!props.row.products_count"
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

    <!-- Діалог створення/редагування -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ isEdit ? $t('suppliers.edit') : $t('suppliers.create') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <!-- Назва -->
            <q-input
              v-model="form.name"
              :label="$t('suppliers.name')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
            />

            <!-- Опис -->
            <q-input
              v-model="form.description"
              :label="$t('suppliers.description')"
              type="textarea"
              outlined
            />

            <!-- Контактна особа -->
            <q-input
              v-model="form.contact_person"
              :label="$t('suppliers.contactPerson')"
              outlined
            />

            <!-- Телефон -->
            <q-input v-model="form.phone" :label="$t('suppliers.phone')" outlined />

            <!-- Email -->
            <q-input v-model="form.email" :label="$t('suppliers.email')" type="email" outlined />

            <!-- Адреса -->
            <q-input
              v-model="form.address"
              :label="$t('suppliers.address')"
              type="textarea"
              outlined
            />

            <!-- Статус -->
            <q-toggle v-if="isEdit" v-model="form.is_active" :label="$t('suppliers.isActive')" />

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
          <span class="q-ml-sm">{{ $t('suppliers.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteSupplier"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { SuppliersApi } from 'src/api/suppliers'
import { debounce } from 'lodash'

const $q = useQuasar()
const { t, locale } = useI18n()

watch(locale, () => {
  loadSuppliers()
})

watch(
  filters,
  debounce(() => {
    pagination.value.page = 1
    loadSuppliers()
  }, 300),
  { deep: true },
)

// State
const loading = ref(false)
const saving = ref(false)
const suppliers = ref([])
const showDialog = ref(false)
const deleteDialog = ref(false)
const supplierToDelete = ref(null)
const isEdit = ref(false)

// Form
const defaultForm = {
  name: '',
  description: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  is_active: true,
}
const form = ref({ ...defaultForm })

// Фільтри
const filters = ref({
  search: '',
  isActive: null,
})

// Пагінація
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'name',
  descending: false,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Опції для селектів
const statusOptions = computed(() => [
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false },
])

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}
// Колонки таблиці
const columns = [
  {
    name: 'name',
    field: 'name',
    label: t('suppliers.name'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'contacts',
    field: (row) => row,
    label: t('suppliers.contacts'),
    align: 'left',
    sortable: false,
  },
  {
    name: 'products_count',
    field: 'products_count',
    label: t('suppliers.productsCount'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'active_warranty_count',
    field: 'active_warranty_count',
    label: t('suppliers.activeWarrantyCount'),
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
]

// Methods
const loadSuppliers = async () => {
  loading.value = true
  try {
    const response = await SuppliersApi.getSuppliers({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value,
    })
    suppliers.value = response.data.suppliers
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })

    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Помилка завантаження даних',
      icon: 'error',
    })
    suppliers.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loading.value = false
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadSuppliers()
}

const openCreateDialog = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  showDialog.value = true
}

const openEditDialog = (supplier) => {
  isEdit.value = true
  form.value = { ...supplier }
  showDialog.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await SuppliersApi.updateSupplier(form.value.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('suppliers.updateSuccess'),
        icon: 'check',
      })
    } else {
      await SuppliersApi.createSupplier(form.value)
      $q.notify({
        color: 'positive',
        message: t('suppliers.createSuccess'),
        icon: 'check',
      })
    }
    showDialog.value = false
    loadSuppliers()
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

const confirmDelete = (supplier) => {
  supplierToDelete.value = supplier
  deleteDialog.value = true
}

const deleteSupplier = async () => {
  try {
    await SuppliersApi.deleteSupplier(supplierToDelete.value.id)
    $q.notify({
      color: 'positive',
      message: t('suppliers.deleteSuccess'),
      icon: 'check',
    })
    loadSuppliers()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

onMounted(() => {
  loadSuppliers()
})
</script>
<style scoped>
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
