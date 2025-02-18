<template>
  <q-page padding>
    <!-- Заголовок і кнопка додавання -->
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-none">{{ $t('productTypes.title') }}</h5>
      <q-btn
        color="primary"
        :label="$t('productTypes.add')"
        icon="add"
        :to="{ name: 'product-type-create' }"
      />
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
          :label="$t('productTypes.filters.status')"
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
      :rows="productTypes"
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
      <!-- Слот для коду -->
      <template v-slot:body-cell-code="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-chip square dense color="primary" text-color="white">
              {{ props.row.code }}
            </q-chip>
            <q-tooltip>
              {{ getCodeDescription(props.row.code) }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

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
              <q-tooltip>
                {{ $t(`productTypes.characteristicTypes.${char.type}`) }}
              </q-tooltip>
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
          <q-btn
            color="info"
            icon="edit"
            size="sm"
            flat
            dense
            :to="{ name: 'product-type-edit', params: { id: props.row.id } }"
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
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ProductTypesApi } from 'src/api/product-types'
import { CHARACTERISTIC_COLORS } from 'src/constants/productTypes'
import { debounce } from 'lodash'

const $q = useQuasar()
const { t, locale } = useI18n()

// State
const loading = ref(false)
const productTypes = ref([])
const deleteDialog = ref(false)
const typeToDelete = ref(null)
const productTypeCodes = ref([])

const getCodeDescription = (code) => {
  const typeCode = productTypeCodes.value.find((t) => t.value === code)
  return typeCode ? typeCode.description : code
}

const loadProductTypeCodes = async () => {
  try {
    const response = await ProductTypesApi.getProductTypeCodes()
    productTypeCodes.value = response.data.codes
  } catch (error) {
    console.error('Error loading product type codes:', error)
  }
}

onMounted(() => {
  loadProductTypes()
  loadProductTypeCodes()
})

// Фільтри і пагінація
const filters = ref({
  search: '',
  isActive: null,
})

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'name',
  descending: false,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 0],
})

// Computed
const statusOptions = computed(() => [
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false },
])

const columns = computed(() => [
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
])

// Watches
watch(locale, () => {
  loadProductTypes()
})

watch(
  filters,
  debounce(() => {
    pagination.value.page = 1
    loadProductTypes()
  }, 300),
  { deep: true },
)

// Methods
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const getCharacteristicColor = (type) => {
  return CHARACTERISTIC_COLORS[type] || 'grey'
}

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
  } catch (error) {
    console.error('Error loading product types:', error)
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
  } catch (error) {
    console.error('Error deleting product type:', error)
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
