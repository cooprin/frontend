<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('manufacturers.title') }}</div>
      </q-card-section>
      <q-card-section>
        <q-table
          v-model:pagination="pagination"
          :rows="manufacturers"
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
          <!-- Пошук -->
          <template v-slot:top-right>
            <q-input
              v-model="filters.search"
              :label="$t('common.search')"
              dense
              outlined
              debounce="300"
              :loading="loading"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="primary"
              :label="$t('manufacturers.add')"
              icon="add"
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
                v-if="!props.row.models_count"
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
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ isEdit ? $t('manufacturers.edit') : $t('manufacturers.create') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.name"
              :label="$t('manufacturers.name')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
            />

            <q-input
              v-model="form.description"
              :label="$t('manufacturers.description')"
              type="textarea"
              outlined
            />

            <q-toggle
              v-if="isEdit"
              v-model="form.is_active"
              :label="$t('manufacturers.isActive')"
            />

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
          <span class="q-ml-sm">{{ $t('manufacturers.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteManufacturer"
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
import { ManufacturersApi } from 'src/api/manufacturers'
import { debounce } from 'lodash'

const $q = useQuasar()
const { t, locale } = useI18n()

watch(locale, () => {
  // Перезавантажуємо дані, якщо потрібно
  loadManufacturers()
})

// State
const loading = ref(false)
const saving = ref(false)
const manufacturers = ref([])
const showDialog = ref(false)
const deleteDialog = ref(false)
const manufacturerToDelete = ref(null)
const isEdit = ref(false)

// Form
const defaultForm = {
  name: '',
  description: '',
  is_active: true,
}
const form = ref({ ...defaultForm })

// Фільтри
const filters = ref({
  search: '',
  isActive: null,
})

watch(
  filters,
  debounce(() => {
    pagination.value.page = 1
    loadManufacturers()
  }, 300),
  { deep: true },
)
// Пагінація
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'name',
  descending: false,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Колонки таблиці
const columns = computed(() => [
  {
    name: 'name',
    field: 'name',
    label: t('manufacturers.name'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'models_count',
    field: 'models_count',
    label: t('manufacturers.modelsCount'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'products_count',
    field: 'products_count',
    label: t('manufacturers.productsCount'),
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

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}
const loadManufacturers = async () => {
  loading.value = true
  try {
    const response = await ManufacturersApi.getManufacturers({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value,
    })
    manufacturers.value = response.data.manufacturers
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
    manufacturers.value = []
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
  await loadManufacturers()
}

const openCreateDialog = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  showDialog.value = true
}

const openEditDialog = (manufacturer) => {
  isEdit.value = true
  form.value = { ...manufacturer }
  showDialog.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await ManufacturersApi.updateManufacturer(form.value.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('manufacturers.updateSuccess'),
        icon: 'check',
      })
    } else {
      await ManufacturersApi.createManufacturer(form.value)
      $q.notify({
        color: 'positive',
        message: t('manufacturers.createSuccess'),
        icon: 'check',
      })
    }
    showDialog.value = false
    loadManufacturers()
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

const confirmDelete = (manufacturer) => {
  manufacturerToDelete.value = manufacturer
  deleteDialog.value = true
}

const deleteManufacturer = async () => {
  try {
    await ManufacturersApi.deleteManufacturer(manufacturerToDelete.value.id)
    $q.notify({
      color: 'positive',
      message: t('manufacturers.deleteSuccess'),
      icon: 'check',
    })
    loadManufacturers()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

onMounted(() => {
  loadManufacturers()
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
