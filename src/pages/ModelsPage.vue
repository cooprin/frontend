<template>
  <q-page padding>
    <!-- Заголовок і кнопка додавання -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-md">{{ $t('models.title') }}</h5>
      <q-btn color="primary" :label="$t('models.add')" icon="add" @click="openCreateDialog" />
    </div>

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
          @update:model-value="onFiltersChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Фільтр по виробнику -->
      <div class="col-12 col-sm-4">
        <q-select
          v-model="filters.manufacturer"
          :options="manufacturerOptions"
          :label="$t('models.filters.manufacturer')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>

      <!-- Фільтр по статусу -->
      <div class="col-12 col-sm-4">
        <q-select
          v-model="filters.isActive"
          :options="statusOptions"
          :label="$t('models.filters.status')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="onFiltersChange"
        />
      </div>
    </div>

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
    >
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ModelsApi } from 'src/api/models'
import { ManufacturersApi } from 'src/api/manufacturers'

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
  manufacturer: null,
  isActive: null,
})

// Пагінація
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'name',
  descending: false,
})

// Опції для селектів
const statusOptions = [
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false },
]

// Колонки таблиці
const columns = [
  {
    name: 'image',
    field: 'image_url',
    label: '',
    align: 'left',
    sortable: false,
  },
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
]

// Methods
const loadModels = async () => {
  loading.value = true
  try {
    const response = await ModelsApi.getModels({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value,
    })
    models.value = response.data.models
    pagination.value.rowsNumber = response.data.total
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
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

const onFiltersChange = () => {
  pagination.value.page = 1
  loadModels()
}

const onImageSelect = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
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

  const formData = new FormData()
  formData.append('image', imageFile.value)

  await ModelsApi.uploadImage(modelId, formData)
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
