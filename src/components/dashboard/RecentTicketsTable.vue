<template>
  <div>
    <q-table
      :rows="data"
      :columns="columns"
      row-key="id"
      :loading="loading"
      hide-pagination
      flat
      dense
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-ticket_number="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            :label="props.row.ticket_number"
            @click="$emit('view-ticket', props.row.id)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-chip :color="getPriorityColor(props.row.priority)" text-color="white" dense size="sm">
            {{ $t(`tickets.priorities.${props.row.priority}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip :color="getStatusColor(props.row.status)" text-color="white" dense size="sm">
            {{ $t(`tickets.statuses.${props.row.status}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          <div class="text-caption">
            {{ formatRelativeTime(props.row.created_at) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-client_name="props">
        <q-td :props="props">
          <div class="text-body2">{{ props.row.client_name }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <div class="text-body2 ellipsis" style="max-width: 200px">
            {{ props.row.title }}
          </div>
          <q-tooltip>{{ props.row.title }}</q-tooltip>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md text-grey">
          <q-icon name="confirmation_number" size="2em" />
          <div class="q-mt-sm">{{ $t('dashboard.noRecentTickets') }}</div>
        </div>
      </template>
    </q-table>

    <div v-if="data.length > 0" class="q-mt-sm text-center">
      <q-btn
        flat
        dense
        color="primary"
        :label="$t('dashboard.viewAllTickets')"
        @click="$router.push({ name: 'tickets' })"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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

defineEmits(['view-ticket'])

const { t } = useI18n()

// Table columns
const columns = computed(() => [
  {
    name: 'ticket_number',
    label: t('tickets.ticketNumber'),
    align: 'left',
    field: 'ticket_number',
    style: 'width: 120px',
  },
  {
    name: 'title',
    label: t('tickets.ticketTitle'),
    align: 'left',
    field: 'title',
    style: 'width: 200px',
  },
  {
    name: 'client_name',
    label: t('tickets.client'),
    align: 'left',
    field: 'client_name',
    style: 'width: 150px',
  },
  {
    name: 'priority',
    label: t('tickets.priority'),
    align: 'center',
    field: 'priority',
    style: 'width: 100px',
  },
  {
    name: 'status',
    label: t('tickets.status'),
    align: 'center',
    field: 'status',
    style: 'width: 120px',
  },
  {
    name: 'created_at',
    label: t('tickets.createdAt'),
    align: 'right',
    field: 'created_at',
    style: 'width: 100px',
  },
])

// Utility methods
const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple',
  }
  return colors[priority] || 'grey'
}

const getStatusColor = (status) => {
  const colors = {
    open: 'blue',
    in_progress: 'orange',
    waiting_client: 'amber',
    resolved: 'green',
    closed: 'grey',
    cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const formatRelativeTime = (date) => {
  const now = new Date()
  const ticketDate = new Date(date)
  const diffInHours = (now - ticketDate) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - ticketDate) / (1000 * 60))
    return diffInMinutes <= 1
      ? t('common.justNow')
      : t('common.minutesAgo', { count: diffInMinutes })
  } else if (diffInHours < 24) {
    return t('common.hoursAgo', { count: Math.floor(diffInHours) })
  } else if (diffInHours < 48) {
    return t('common.yesterday')
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return t('common.daysAgo', { count: diffInDays })
  }
}
</script>

<style scoped>
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.q-table) {
  box-shadow: none;
}

:deep(.q-table tbody td) {
  padding: 8px;
}

:deep(.q-table thead th) {
  padding: 8px;
  font-weight: 600;
}
</style>
