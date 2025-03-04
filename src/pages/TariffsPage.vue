<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('tariffs.title') }}</div>
          <q-space />
          <q-btn
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
            flat
            color="primary"
            @click="showFilters = !showFilters"
          />
        </div>

        <q-slide-transition>
          <div v-show="showFilters">
            <div class="row q-col-gutter-sm q-mb-md">
              <!-- Статус -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.isActive"
                  :options="statusOptions"
                  :label="$t('tariffs.filters.status')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="tariffs"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :selected-rows-label="$t('common.selectedRows')"
          :pagination-label="paginationLabel"
        >
          <!-- Пошук -->
          <template v-slot:top-right>
            <q-input
              v-model="filters.search"
              :label="$t('tariffs.filters.search')"
              outlined
              dense
              debounce="300"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="primary"
              icon="add"
              class="q-ml-md"
              :label="$t('tariffs.add')"
              @click="openCreateDialog"
            >
              <q-tooltip>{{ $t('tariffs.add') }}</q-tooltip>
            </q-btn>
          </template>

          <!-- Слот для ціни -->
          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.price) }}
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

          <!-- Слот для кількості об'єктів -->
          <template v-slot:body-cell-objects_count="props">
            <q-td :props="props" class="text-center">
              <q-badge color="primary" :label="props.row.objects_count || 0" />
            </q-td>
          </template>

          <!-- Слот для дій -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn-group flat>
                <q-btn
                  flat
                  round
                  dense
                  color="info"
                  icon="link"
                  @click="openAssignDialog(props.row)"
                >
                  <q-tooltip>{{ $t('tariffs.assignment.assignTo') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="openDetails(props.row)"
                >
                  <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="warning"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Діалоги -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('tariffs.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteTariff"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <tariff-dialog v-model="showDialog" :edit-data="editTariff" @saved="loadTariffs" />
    <tariff-assign-dialog
      v-model="showAssignDialog"
      :tariff="tariffToAssign"
      @saved="loadTariffs"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TariffsApi } from 'src/api/tariffs'
import TariffDialog from 'components/tariffs/TariffDialog.vue'
import TariffAssignDialog from 'components/tariffs/TariffAssignDialog.vue'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

// State
const loading = ref(false)
const showDialog = ref(false)
const showAssignDialog = ref(false)
const showFilters = ref(false)
const editTariff = ref(null)
const tariffToAssign = ref(null)
const tariffs = ref([])
const deleteDialog = ref(false)
const tariffToDelete = ref(null)

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

// Filters
const filters = ref({
  search: '',
  isActive: null,
})

// Options
const statusOptions = computed(() => [
  { label: t('common.all'), value: null },
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false },
])

// Columns
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('tariffs.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'price',
    label: t('tariffs.price'),
    align: 'right',
    field: 'price',
    sortable: true,
  },
  {
    name: 'objects_count',
    label: t('tariffs.objectsCount'),
    align: 'center',
    field: 'objects_count',
    sortable: true,
  },
  {
    name: 'is_active',
    label: t('common.status'),
    align: 'center',
    field: 'is_active',
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

const loadTariffs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      is_active: filters.value.isActive,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await TariffsApi.getTariffs(params)
    tariffs.value = response.data.tariffs
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading tariffs:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    isActive: null,
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

  await loadTariffs()
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const openDetails = (tariff) => {
  router.push({ name: 'tariff-details', params: { id: tariff.id } })
}

const openCreateDialog = () => {
  editTariff.value = null
  showDialog.value = true
}

const openEditDialog = (tariff) => {
  editTariff.value = tariff
  showDialog.value = true
}

const openAssignDialog = (tariff) => {
  tariffToAssign.value = tariff
  showAssignDialog.value = true
}

const confirmDelete = (tariff) => {
  tariffToDelete.value = tariff
  deleteDialog.value = true
}

const deleteTariff = async () => {
  try {
    await TariffsApi.deleteTariff(tariffToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: t('tariffs.deleteSuccess'),
    })
    loadTariffs()
  } catch (error) {
    console.error('Error deleting tariff:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
    })
  }
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadTariffs()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadTariffs()
})
</script>

<style scoped>
/* Тут можна додати специфічні стилі для цієї сторінки */
</style>
