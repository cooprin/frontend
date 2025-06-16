<template>
  <div class="repair-items-table">
    <q-table
      :rows="data"
      :columns="columns"
      row-key="product_id"
      :loading="loading"
      dense
      :style="data.length > 0 ? 'height: 300px' : ''"
      virtual-scroll
    >
      <template v-slot:top>
        <div class="row items-center full-width q-gutter-md">
          <div class="text-h6">{{ $t('dashboard.repairItems') }}</div>
          <q-space />
          <q-input
            v-model="filters.search"
            dense
            outlined
            :placeholder="$t('dashboard.searchPlaceholder')"
            clearable
            @update:model-value="onSearch"
            style="min-width: 200px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
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

      <template v-slot:body-cell-sku="props">
        <q-td :props="props">
          <div>
            <div class="text-weight-medium">{{ props.row.sku }}</div>
            <div class="text-caption text-grey-6">{{ props.row.model_name }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-repair_sent_date="props">
        <q-td :props="props" class="text-center">
          <div v-if="props.row.repair_sent_date">
            {{ formatDate(props.row.repair_sent_date) }}
          </div>
          <div v-else class="text-grey-6">—</div>
        </q-td>
      </template>

      <template v-slot:body-cell-days_in_repair="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="getRepairStatusColor(props.row.days_in_repair)"
            text-color="white"
            :label="`${props.row.days_in_repair} ${getDaysLabel(props.row.days_in_repair)}`"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <div class="row q-gutter-xs justify-center">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="visibility"
              @click="$emit('view-product', props.row)"
            >
              <q-tooltip>{{ $t('dashboard.viewDetails') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="positive"
              icon="build"
              @click="$emit('return-from-repair', props.row)"
            >
              <q-tooltip>{{ $t('dashboard.returnFromRepair') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md">
          <div class="text-positive">
            {{ loading ? $t('common.loading') : $t('dashboard.noItemsInRepair') }}
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'

defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh', 'view-product', 'return-from-repair', 'filter-change'])

const { t } = useI18n()

const filters = ref({
  search: '',
})

const columns = computed(() => [
  {
    name: 'sku',
    align: 'left',
    label: 'SKU / ' + t('dashboard.modelName'),
    field: 'sku',
    sortable: true,
    style: 'width: 200px',
  },
  {
    name: 'manufacturer_name',
    align: 'left',
    label: t('dashboard.manufacturer'),
    field: 'manufacturer_name',
    sortable: true,
  },
  {
    name: 'product_type_name',
    align: 'left',
    label: t('dashboard.productType'),
    field: 'product_type_name',
    sortable: true,
  },
  {
    name: 'from_warehouse_name',
    align: 'left',
    label: t('dashboard.warehouseSelector'),
    field: 'from_warehouse_name',
    sortable: true,
  },
  {
    name: 'repair_sent_date',
    align: 'center',
    label: t('dashboard.sentToRepairDate'),
    field: 'repair_sent_date',
    sortable: true,
  },
  {
    name: 'days_in_repair',
    align: 'center',
    label: t('dashboard.daysInRepair'),
    field: 'days_in_repair',
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

const getRepairStatusColor = (days) => {
  if (days <= 7) return 'positive'
  if (days <= 30) return 'warning'
  return 'negative'
}

const getDaysLabel = (days) => {
  if (days === 1) return 'день'
  if (days >= 2 && days <= 4) return 'дні'
  return 'днів'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return date.formatDate(dateStr, 'DD.MM.YYYY')
}

const onSearch = () => {
  emit('filter-change', {
    search: filters.value.search,
  })
}
</script>

<style lang="scss" scoped>
.repair-items-table {
  .q-table__top {
    padding: 8px;
  }
}
</style>
