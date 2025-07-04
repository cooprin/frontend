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
          binary-state-sort
          @request="onRequest"
          row-key="id"
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :selected-rows-label="$t('common.selectedRows')"
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
                :src="
                  props.row.image_url ? getImageUrl(props.row.image_url) : '/images/no-image.png'
                "
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
              :options="manufacturerSearch.filteredOptions.value"
              :label="$t('models.manufacturer')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="(val, update) => manufacturerSearch.filterOptions(val, update)"
              @popup-show="manufacturerSearch.resetFilter"
            />
            <!-- Тип продукту -->
            <q-select
              v-model="form.product_type_id"
              :options="productTypeSearch.filteredOptions.value"
              :label="$t('models.productType')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="(val, update) => productTypeSearch.filterOptions(val, update)"
              @popup-show="productTypeSearch.resetFilter"
            />

            <!-- Опис -->
            <q-input
              v-model="form.description"
              :label="$t('models.description')"
              type="textarea"
              outlined
            />

            <!-- Зображення -->

            <div class="row items-center q-gutter-sm q-mb-md">
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

              <div class="col-auto flex justify-center">
                <q-img
                  :src="
                    imagePreview ||
                    (form.image_url ? getImageUrl(form.image_url) : '/images/no-image.png')
                  "
                  :ratio="1"
                  style="
                    width: 120px;
                    height: 120px;
                    cursor: pointer;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                  "
                  fit="contain"
                  @click="openCurrentImage()"
                  class="image-clickable"
                />
              </div>
            </div>

            <!-- Статус -->
            <q-toggle v-if="isEdit" v-model="form.is_active" :label="$t('models.isActive')" />
            <model-files-manager
              v-if="isEdit && form.id"
              :model-id="form.id"
              :refresh-trigger="filesRefreshTrigger"
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
    <q-dialog v-model="showImageDialog">
      <q-card class="image-dialog-card">
        <q-card-section class="row items-center justify-end q-pb-none">
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none flex justify-center">
          <q-img
            :src="selectedImage"
            style="max-width: 90vw; max-height: 70vh; min-width: 300px; min-height: 200px"
            fit="contain"
          />
        </q-card-section>
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
import { ProductTypesApi } from 'src/api/product-types'
import ModelFilesManager from 'src/components/models/ModelFilesManager.vue'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const $q = useQuasar()
const { t } = useI18n()
const filesRefreshTrigger = ref(0)

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
const productTypeOptions = ref([])
// Searchable selects
const manufacturerSearch = useSearchableSelect(manufacturerOptions)
const productTypeSearch = useSearchableSelect(productTypeOptions)
const showImageDialog = ref(false)
const selectedImage = ref('')

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/no-image.png'
  return `${process.env.API_URL}/uploads/${imagePath}`
}

const openCurrentImage = () => {
  if (imagePreview.value) {
    selectedImage.value = imagePreview.value
    showImageDialog.value = true
  } else if (form.value && form.value.image_url) {
    selectedImage.value = getImageUrl(form.value.image_url)
    showImageDialog.value = true
  }
}

const loadProductTypes = async () => {
  try {
    console.log('Starting loadProductTypes')

    const response = await ProductTypesApi.getProductTypes()

    console.log('Product types response:', response)

    if (response && response.data && response.data.productTypes) {
      productTypeOptions.value = response.data.productTypes.map((t) => ({
        label: t.name,
        value: t.id,
      }))
      productTypeSearch.initializeOptions(productTypeOptions.value)
      console.log('Product type options:', productTypeOptions.value)
    } else {
      console.error('Unexpected API response structure:', response)
      productTypeOptions.value = []
      productTypeSearch.initializeOptions([])
    }
  } catch (error) {
    console.error('Error loading product types:', error)
    productTypeOptions.value = [{ label: 'Завантаження типів не вдалося', value: null }]
    productTypeSearch.initializeOptions(productTypeOptions.value)
  }
}

// Form
const defaultForm = {
  name: '',
  manufacturer_id: null,
  product_type_id: null,
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
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
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
    name: 'product_type_name',
    field: 'product_type_name',
    label: t('models.productType'),
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
    manufacturerSearch.initializeOptions(manufacturerOptions.value)
  } catch (error) {
    console.error('Error loading manufacturers:', error)
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
    if (!form.value.name || !form.value.manufacturer_id || !form.value.product_type_id) {
      $q.notify({
        color: 'negative',
        message: t('common.errors.requiredFields'),
        icon: 'error',
      })
      return
    }

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
  } catch (error) {
    console.error('Error saving model:', error)
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

watch(
  form,
  () => {
    // Скидаємо лічильник оновлення файлів при зміні форми
    filesRefreshTrigger.value += 1
  },
  { deep: true },
)

onMounted(() => {
  loadModels()
  loadManufacturers()
  loadProductTypes()
})
</script>
<style scoped>
/* Додаткові стилі для зображень */
.image-preview {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
.image-dialog-card {
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 8px;
}

.image-clickable {
  transition: transform 0.2s;
}

.image-clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}
</style>
