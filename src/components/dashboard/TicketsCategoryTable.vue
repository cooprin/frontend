<template>
  <div>
    <q-table
      :rows="data"
      :columns="columns"
      row-key="category_id"
      :loading="loading"
      flat
      dense
      :pagination="{ rowsPerPage: 0 }"
      hide-pagination
    >
      <template v-slot:body-cell-category_name="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-icon
              :name="getCategoryIcon(props.row.category_name)"
              :color="props.row.category_color || 'grey'"
              size="sm"
              class="q-mr-sm"
            />
            <div>
              <div class="text-body2 text-weight-medium">
                {{ getCategoryName(props.row.category_name) }}
              </div>
              <div class="text-caption text-grey">
                {{ getCategoryName(props.row.category_name) }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-total_count="props">
        <q-td :props="props" class="text-center">
          <q-chip color="blue-grey" text-color="white" :label="props.row.total_count" dense />
        </q-td>
      </template>

      <template v-slot:body-cell-new_count="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="props.row.new_count > 0 ? 'blue' : 'grey-4'"
            :text-color="props.row.new_count > 0 ? 'white' : 'grey-8'"
            :label="props.row.new_count"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-in_progress_count="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="props.row.in_progress_count > 0 ? 'orange' : 'grey-4'"
            :text-color="props.row.in_progress_count > 0 ? 'white' : 'grey-8'"
            :label="props.row.in_progress_count"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-resolved_count="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="props.row.resolved_count > 0 ? 'green' : 'grey-4'"
            :text-color="props.row.resolved_count > 0 ? 'white' : 'grey-8'"
            :label="props.row.resolved_count"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-avg_resolution_time="props">
        <q-td :props="props" class="text-center">
          <div class="text-body2">
            {{ formatResolutionTime(props.row.avg_resolution_time) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            dense
            round
            color="primary"
            icon="visibility"
            @click="viewCategoryTickets(props.row)"
          >
            <q-tooltip>{{ $t('tickets.filters.category') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md text-grey">
          <q-icon name="folder" size="2em" />
          <div class="q-mt-sm">{{ $t('dashboard.noCategoryData') }}</div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

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

const router = useRouter()

const { t } = useI18n()

// Table columns
const columns = computed(() => [
  {
    name: 'category_name',
    label: t('tickets.category'),
    align: 'left',
    field: 'category_name',
    style: 'width: 35%',
  },
  {
    name: 'total_count',
    label: t('dashboard.metrics.totalTickets'),
    align: 'center',
    field: 'total_count',
    style: 'width: 12%',
  },
  {
    name: 'new_count',
    label: t('tickets.statuses.open'),
    align: 'center',
    field: 'new_count',
    style: 'width: 12%',
  },
  {
    name: 'in_progress_count',
    label: t('tickets.statuses.in_progress'),
    align: 'center',
    field: 'in_progress_count',
    style: 'width: 12%',
  },
  {
    name: 'resolved_count',
    label: t('tickets.statuses.resolved'),
    align: 'center',
    field: 'resolved_count',
    style: 'width: 12%',
  },
  {
    name: 'avg_resolution_time',
    label: t('dashboard.metrics.avgResolutionTime'),
    align: 'center',
    field: 'avg_resolution_time',
    style: 'width: 12%',
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    field: 'actions',
    style: 'width: 5%',
  },
])

// Methods
const getCategoryIcon = (categoryName) => {
  const icons = {
    technical_support: 'support_agent',
    hardware_issues: 'hardware',
    configuration: 'settings',
    billing_payment: 'payment',
    system_access: 'login',
    other: 'help',
  }
  return icons[categoryName] || 'folder'
}

const formatResolutionTime = (timeInHours) => {
  if (!timeInHours || timeInHours === 0) {
    return '-'
  }

  if (timeInHours < 1) {
    const minutes = Math.round(timeInHours * 60)
    return `${minutes}${t('common.minutesShort')}`
  } else if (timeInHours < 24) {
    return `${Math.round(timeInHours)}${t('common.hoursShort')}`
  } else {
    const days = Math.round(timeInHours / 24)
    return `${days}${t('common.daysShort')}`
  }
}

const viewCategoryTickets = (category) => {
  // Navigate to tickets page with category filter
  router.push({
    name: 'tickets',
    query: {
      category_id: category.category_id,
      tab: 'all',
    },
  })
}

const getCategoryName = (categoryName) => {
  // Якщо вже є повний ключ - використовуємо його
  if (categoryName.startsWith('tickets.categories.')) {
    return t(categoryName)
  }
  // Інакше додаємо префікс
  return t(`tickets.categories.${categoryName}`)
}
</script>

<style scoped>
:deep(.q-table) {
  box-shadow: none;
}

:deep(.q-table tbody td) {
  padding: 12px 8px;
}

:deep(.q-table thead th) {
  padding: 12px 8px;
  font-weight: 600;
  background: var(--q-primary);
  color: white;
}

:deep(.q-table tbody tr:hover) {
  background: rgba(var(--q-primary), 0.05);
}
</style>
