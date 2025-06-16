<template>
  <div class="models-stock-table">
    <q-table
      :rows="data"
      :columns="columns"
      row-key="model_id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      dense
      :virtual-scroll="data.length > 50"
      :style="data.length > 0 ? 'height: 400px' : ''"
    >
      <template v-slot:top>
        <div class="row items-center full-width q-gutter-md">
          <q-input
            v-model="filters.search"
            dense
            outlined
            :placeholder="$t('dashboard.searchModels')"
            clearable
            @update:model-value="onSearch"
            style="min-width: 200px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filters.productType"
            :options="productTypeOptions"
            dense
            outlined
            clearable
            emit-value
            map-options
            :label="$t('dashboard.productType')"
            @update:model-value="onFilterChange"
            style="min-width: 150px"
          />

          <q-space />

          <q-btn
            flat
            round
            dense
            color="primary"
            icon="refresh"
            :loading="loading"
            @click="$emit('refresh')"
          >
            <q-tooltip>{{ $t('dashboard.refresh') }}</q-tooltip>
          </q-btn>
        </div>
      </template>

      <template v-slot:body-cell-model_name="props">
        <q-td :props="props">
          <div class="row items-center">
            <div>
              <div class="text-weight-medium">{{ props.row.model_name }}</div>
              <div class="text-caption text-grey-6">{{ props.row.manufacturer_name }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-total_quantity="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="getStockStatusColor(props.row.stock_status)"
            :label="props.row.total_quantity"
            class="text-weight-bold"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-stock_status="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="getStockStatusColor(props.row.stock_status)"
            text-color="white"
            :label="getStockStatusLabel(props.row.stock_status)"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="visibility"
            @click="$emit('view-model', props.row)"
          >
            <q-tooltip>{{ $t('dashboard.viewDetails') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md">
          <div class="text-grey-8">
            {{ loading ? $t('common.loading') : $t('dashboard.noDataAvailable') }}
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  productTypeOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['refresh', 'view-model', 'filter-change'])

const { t } = useI18n()

const filters = ref({
  search: '',
  productType: null,
})

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = computed(() => [
  {
    name: 'model_name',
    align: 'left',
    label: t('dashboard.modelName'),
    field: 'model_name',
    sortable: true,
    style: 'width: 250px',
  },
  {
    name: 'product_type_name',
    align: 'left',
    label: t('dashboard.productType'),
    field: 'product_type_name',
    sortable: true,
  },
  {
    name: 'total_quantity',
    align: 'center',
    label: t('dashboard.quantity'),
    field: 'total_quantity',
    sortable: true,
  },

  {
    name: 'stock_status',
    align: 'center',
    label: t('dashboard.status'),
    field: 'stock_status',
    sortable: true,
  },
  {
    name: 'actions',
    align: 'center',
    label: t('dashboard.actions'),
    field: 'actions',
    sortable: false,
  },
])

const getStockStatusColor = (status) => {
  switch (status) {
    case 'high':
      return 'positive'
    case 'medium':
      return 'warning'
    case 'critical':
      return 'negative'
    default:
      return 'grey'
  }
}

const getStockStatusLabel = (status) => {
  switch (status) {
    case 'high':
      return t('dashboard.stockHigh')
    case 'medium':
      return t('dashboard.stockMedium')
    case 'critical':
      return t('dashboard.stockCritical')
    default:
      return '—'
  }
}

const onRequest = (props) => {
  pagination.value = props.pagination
}

const onSearch = () => {
  onFilterChange()
}

const onFilterChange = () => {
  emit('filter-change', {
    search: filters.value.search,
    productType: filters.value.productType,
  })
}

watch(
  () => props.data,
  (newData) => {
    pagination.value.rowsNumber = newData.length
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.models-stock-table {
  .q-table__top {
    padding: 8px;
  }
}
</style>
