<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('productTypes.title') }}</div>
      </q-card-section>
      <q-card-section>
        <!-- Таблиця -->
        <q-table
          v-model:pagination="pagination"
          :rows="productTypes"
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
              :label="$t('productTypes.add')"
              icon="add"
              class="q-ml-md"
              :to="{ name: 'product-type-create' }"
            />
          </template>
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
      </q-card-section>
    </q-card>

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
const { t } = useI18n()

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
})

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

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
    sortable: false, // прибрали сортування
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
watch(
  () => ({
    ...filters.value,
    page: pagination.value.page,
    rowsPerPage: pagination.value.rowsPerPage,
    sortBy: pagination.value.sortBy,
    descending: pagination.value.descending,
  }),
  debounce(() => {
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

    const response = await ProductTypesApi.getProductTypes(params)
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

  pagination.value = {
    ...pagination.value,
    page,
    rowsPerPage,
    sortBy,
    descending,
  }

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
