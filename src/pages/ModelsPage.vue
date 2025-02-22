<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('models.title') }}</div>
      </q-card-section>
      <q-card-section>
        <!-- Таблиця -->
        <q-table
          v-model:pagination="pagination"
          :rows="models"
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
              :label="$t('models.add')"
              icon="add"
              @click="openCreateDialog"
              class="q-ml-md"
            />
          </template>
          <!-- Слот для зображення -->
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-img
                :src="props.row.image_url || '/images/no-image.png'"
                :ratio="1"
                style="max-width: 50px"
                fit="contain"
              />
            </q-td>
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
      </q-card-section>
    </q-card>

    <!-- Діалог створення/редагування -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ isEdit ? $t('models.edit') : $t('models.create') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <!-- Назва -->
            <q-input
              v-model="form.name"
              :label="$t('models.name')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
            />

            <!-- Виробник -->
            <q-select
              v-model="form.manufacturer_id"
              :options="manufacturerOptions"
              :label="$t('models.manufacturer')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Опис -->
            <q-input
              v-model="form.description"
              :label="$t('models.description')"
              type="textarea"
              outlined
            />

            <!-- Зображення -->
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto">
                <q-img
                  :src="imagePreview || form.image_url || '/images/no-image.png'"
                  :ratio="1"
                  style="width: 100px"
                  fit="contain"
                />
              </div>
              <div class="col">
                <q-file
                  v-model="imageFile"
                  :label="$t('models.imageUrl')"
                  outlined
                  accept=".jpg,.jpeg,.png"
                  @update:model-value="onImageSelect"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>
            </div>

            <!-- Статус -->
            <q-toggle v-if="isEdit" v-model="form.is_active" :label="$t('models.isActive')" />

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
          <span class="q-ml-sm">{{ $t('models.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteModel"
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
import { ModelsApi } from 'src/api/models'
import { ManufacturersApi } from 'src/api/manufacturers'
import { debounce } from 'lodash'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const models = ref([])
const showDialog = ref(false)
const deleteDialog = ref(false)
const modelToDelete = ref(null)
const isEdit = ref(false)
const manufacturerOptions = ref([])
const imageFile = ref(null)
const imagePreview = ref(null)

// Form
const defaultForm = {
  name: '',
  manufacturer_id: null,
  description: '',
  image_url: null,
  is_active: true,
}
const form = ref({ ...defaultForm })

// Фільтри
const filters = ref({
  search: '',
})

// Пагінація
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}
// Пагінація
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'name',
  descending: false,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

watch(
  () => ({
    ...filters.value,
    page: pagination.value.page,
    rowsPerPage: pagination.value.rowsPerPage,
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
  }),
  debounce(() => {
    loadModels()
  }, 300),
  { deep: true },
)

// Колонки таблиці
const columns = computed(() => [
  {
    name: 'name',
    field: 'name',
    label: t('models.name'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'manufacturer_name',
    field: 'manufacturer_name',
    label: t('models.manufacturer'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'products_count',
    field: 'products_count',
    label: t('models.productsCount'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'in_stock_count',
    field: 'in_stock_count',
    label: t('models.inStockCount'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'installed_count',
    field: 'installed_count',
    label: t('models.installedCount'),
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
const loadModels = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || 'name',
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
    }

    // Видалимо undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await ModelsApi.getModels(params)
    models.value = response.data.models
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading models:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    models.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loading.value = false
  }
}

const loadManufacturers = async () => {
  try {
    const response = await ManufacturersApi.getManufacturers({
      isActive: true,
      perPage: 'All',
    })
    manufacturerOptions.value = response.data.manufacturers.map((m) => ({
      label: m.name,
      value: m.id,
    }))
  } catch (error) {
    console.error('Error loading manufacturers:', error)
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadModels()
}

const openCreateDialog = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  imageFile.value = null
  imagePreview.value = null
  showDialog.value = true
}

const openEditDialog = (model) => {
  isEdit.value = true
  form.value = { ...model }
  imageFile.value = null
  imagePreview.value = null
  showDialog.value = true
}

const uploadImage = async (modelId) => {
  if (!imageFile.value) return

  try {
    const formData = new FormData()
    formData.append('image', imageFile.value)

    await ModelsApi.uploadImage(modelId, formData)
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

const onImageSelect = (file) => {
  if (file) {
    // Перевірка розміру файлу (наприклад, до 5MB)
    if (file.size > 5 * 1024 * 1024) {
      $q.notify({
        color: 'negative',
        message: t('common.errors.fileTooLarge'),
        icon: 'error',
      })
      imageFile.value = null
      return
    }

    // Перевірка типу файлу
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      $q.notify({
        color: 'negative',
        message: t('common.errors.invalidFileType'),
        icon: 'error',
      })
      imageFile.value = null
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}

const onSubmit = async () => {
  saving.value = true
  try {
    let modelId
    if (isEdit.value) {
      const response = await ModelsApi.updateModel(form.value.id, form.value)
      modelId = response.data.model.id
      $q.notify({
        color: 'positive',
        message: t('models.updateSuccess'),
        icon: 'check',
      })
    } else {
      const response = await ModelsApi.createModel(form.value)
      modelId = response.data.model.id
      $q.notify({
        color: 'positive',
        message: t('models.createSuccess'),
        icon: 'check',
      })
    }

    if (imageFile.value) {
      await uploadImage(modelId)
    }

    showDialog.value = false
    loadModels()
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

const confirmDelete = (model) => {
  modelToDelete.value = model
  deleteDialog.value = true
}

const deleteModel = async () => {
  try {
    await ModelsApi.deleteModel(modelToDelete.value.id)
    $q.notify({
      color: 'positive',
      message: t('models.deleteSuccess'),
      icon: 'check',
    })
    loadModels()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

onMounted(() => {
  loadModels()
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

/* Додаткові стилі для зображень */
.image-preview {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
</style>
