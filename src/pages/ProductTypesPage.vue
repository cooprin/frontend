<template>
  <q-page padding>
    <!-- Заголовок і кнопка додавання -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-md">{{ $t('productTypes.title') }}</h5>
      <q-btn color="primary" :label="$t('productTypes.add')" icon="add" @click="openCreateDialog" />
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

      <!-- Фільтр по статусу -->
      <div class="col-12 col-sm-4">
        <q-select
          v-model="filters.isActive"
          :options="statusOptions"
          :label="$t('productTypes.filters.status')"
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
      :rows="productTypes"
      :columns="columns"
      :loading="loading"
      :rows-per-page-options="[10, 20, 50, 100]"
      row-key="id"
      flat
      bordered
      @request="onRequest"
    >
      <!-- Слот для характеристик -->
      <template v-slot:body-cell-characteristics="props">
        <q-td :props="props">
          <div class="row q-gutter-x-sm">
            <q-chip
              v-for="char in props.row.characteristics"
              :key="char.id"
              :color="getCharacteristicColor(char.type)"
              text-color="white"
              dense
              square
            >
              {{ char.name }}
            </q-chip>
          </div>
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
          <q-btn color="warning" icon="edit" size="sm" flat dense :to="getEditRoute(props.row)">
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
            {{ isEdit ? $t('productTypes.edit') : $t('productTypes.create') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <!-- Назва -->
            <q-input
              v-model="form.name"
              :label="$t('productTypes.name')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
            />

            <!-- Код -->
            <q-input
              v-model="form.code"
              :label="$t('productTypes.code')"
              :rules="[
                (val) => !!val || $t('common.validation.required'),
                (val) => /^[a-zA-Z0-9_-]+$/.test(val) || $t('common.validation.codeFormat'),
              ]"
              outlined
            />

            <!-- Опис -->
            <q-input
              v-model="form.description"
              :label="$t('productTypes.description')"
              type="textarea"
              outlined
            />

            <!-- Статус -->
            <q-toggle v-if="isEdit" v-model="form.is_active" :label="$t('productTypes.isActive')" />

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
          <span class="q-ml-sm">{{ $t('productTypes.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteProductType"
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
import { ProductTypesApi } from 'src/api/product-types'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const productTypes = ref([])
const showDialog = ref(false)
const deleteDialog = ref(false)
const typeToDelete = ref(null)
const isEdit = ref(false)

// Form
const defaultForm = {
  name: '',
  code: '',
  description: '',
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
})

// Опції для селектів
const statusOptions = [
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false },
]

// Колонки таблиці
const columns = [
  {
    name: 'name',
    field: 'name',
    label: t('productTypes.name'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'code',
    field: 'code',
    label: t('productTypes.code'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'characteristics',
    field: (row) => row.characteristics?.length || 0,
    label: t('productTypes.characteristics'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'products_count',
    field: 'products_count',
    label: t('productTypes.productsCount'),
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
const loadProductTypes = async () => {
  loading.value = true
  try {
    const response = await ProductTypesApi.getProductTypes({
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value,
    })
    productTypes.value = response.data.productTypes
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

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await loadProductTypes()
}

const onFiltersChange = () => {
  pagination.value.page = 1
  loadProductTypes()
}

const getCharacteristicColor = (type) => {
  const colors = {
    string: 'blue',
    number: 'green',
    date: 'purple',
    boolean: 'orange',
    select: 'red',
  }
  return colors[type] || 'grey'
}

const getEditRoute = (productType) => ({
  name: 'product-type-edit',
  params: { id: productType.id },
})

const openCreateDialog = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  showDialog.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await ProductTypesApi.updateProductType(form.value.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.updateSuccess'),
        icon: 'check',
      })
    } else {
      await ProductTypesApi.createProductType(form.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.createSuccess'),
        icon: 'check',
      })
    }
    showDialog.value = false
    loadProductTypes()
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

const confirmDelete = (productType) => {
  typeToDelete.value = productType
  deleteDialog.value = true
}

const deleteProductType = async () => {
  try {
    await ProductTypesApi.deleteProductType(typeToDelete.value.id)
    $q.notify({
      color: 'positive',
      message: t('productTypes.deleteSuccess'),
      icon: 'check',
    })
    loadProductTypes()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

onMounted(() => {
  loadProductTypes()
})
</script>
