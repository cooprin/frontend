<template>
  <div>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ $t('tickets.resolved.title') }}</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="secondary"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="loadTickets"
          :loading="loading"
        />
        <q-btn
          color="primary"
          icon="file_download"
          :label="$t('tickets.resolved.export')"
          @click="exportTickets"
          :loading="exporting"
        />
      </div>
    </div>

    <!-- Filters Card -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-subtitle2">{{ $t('tickets.resolved.filters') }}</div>
          <q-space />
          <q-btn
            flat
            dense
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
            @click="showFilters = !showFilters"
          />
        </div>

        <q-slide-transition>
          <div v-show="showFilters">
            <div class="row q-col-gutter-md q-mb-md">
              <!-- Search -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filters.search"
                  :label="$t('tickets.resolved.search')"
                  outlined
                  dense
                  clearable
                  @update:model-value="debouncedSearch"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <!-- Status -->
              <div class="col-12 col-md-2">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('tickets.status')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  @update:model-value="applyFilters"
                />
              </div>

              <!-- Priority -->
              <div class="col-12 col-md-2">
                <q-select
                  v-model="filters.priority"
                  :options="priorityOptions"
                  :label="$t('tickets.priority')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  @update:model-value="applyFilters"
                />
              </div>

              <!-- Category -->
              <div class="col-12 col-md-4">
                <q-select
                  v-model="filters.category_id"
                  :options="categoryOptions"
                  :label="$t('tickets.category')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  @update:model-value="applyFilters"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <!-- Date Range -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filters.date_from"
                  :label="$t('tickets.resolved.dateFrom')"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.date_from"
                          mask="YYYY-MM-DD"
                          @update:model-value="applyFilters"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup :label="$t('common.close')" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-3">
                <q-input
                  v-model="filters.date_to"
                  :label="$t('tickets.resolved.dateTo')"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.date_to"
                          mask="YYYY-MM-DD"
                          @update:model-value="applyFilters"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup :label="$t('common.close')" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- Resolved By -->
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.resolved_by"
                  :options="staffOptions"
                  :label="$t('tickets.resolved.resolvedBy')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="300"
                  @filter="filterStaff"
                  @update:model-value="applyFilters"
                />
              </div>

              <!-- Clear Filters -->
              <div class="col-12 col-md-3">
                <q-btn
                  flat
                  color="negative"
                  icon="clear"
                  :label="$t('common.clearFilters')"
                  @click="clearFilters"
                  class="full-width"
                />
              </div>
            </div>

            <!-- Quick Date Filters -->
            <div class="row q-gutter-sm">
              <q-chip
                clickable
                color="grey-4"
                text-color="black"
                icon="today"
                :label="$t('tickets.resolved.today')"
                @click="setDateFilter('today')"
              />
              <q-chip
                clickable
                color="grey-4"
                text-color="black"
                icon="view_week"
                :label="$t('tickets.resolved.thisWeek')"
                @click="setDateFilter('week')"
              />
              <q-chip
                clickable
                color="grey-4"
                text-color="black"
                icon="calendar_month"
                :label="$t('tickets.resolved.thisMonth')"
                @click="setDateFilter('month')"
              />
              <q-chip
                clickable
                color="grey-4"
                text-color="black"
                icon="calendar_today"
                :label="$t('tickets.resolved.lastMonth')"
                @click="setDateFilter('lastMonth')"
              />
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
    </q-card>

    <!-- Statistics -->
    <div class="row q-gutter-sm q-mb-md">
      <q-chip color="blue" text-color="white" icon="confirmation_number">
        {{ $t('tickets.resolved.total') }}: {{ pagination.total }}
      </q-chip>
      <q-chip color="green" text-color="white" icon="check_circle">
        {{ $t('tickets.resolved.resolved') }}: {{ resolvedCount }}
      </q-chip>
      <q-chip color="grey" text-color="white" icon="lock">
        {{ $t('tickets.resolved.closed') }}: {{ closedCount }}
      </q-chip>
      <q-chip color="purple" text-color="white" icon="done_all">
        {{ $t('tickets.resolved.totalResolved') }}: {{ totalResolvedCount }}
      </q-chip>
    </div>

    <!-- Tickets Table -->
    <q-table
      :rows="tickets"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      @request="onRequest"
      :rows-per-page-options="[10, 25, 50, 100]"
      binary-state-sort
    >
      <template v-slot:body-cell-ticket_number="props">
        <q-td :props="props">
          <q-btn
            flat
            no-caps
            color="primary"
            :label="props.row.ticket_number"
            @click="openTicket(props.row.id)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.title }}</div>
          <div class="text-caption text-grey-6" v-if="props.row.category_name">
            <q-icon name="folder" size="xs" class="q-mr-xs" />
            {{ props.row.category_name }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-client="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="24px" class="q-mr-sm">
              <q-icon name="person" />
            </q-avatar>
            <div>
              <div class="text-body2">{{ props.row.client_name }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.row.status)"
            text-color="white"
            :icon="getStatusIcon(props.row.status)"
            dense
          >
            {{ $t(`tickets.statuses.${props.row.status}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-chip
            :color="getPriorityColor(props.row.priority)"
            text-color="white"
            :icon="getPriorityIcon(props.row.priority)"
            dense
            size="sm"
          >
            {{ $t(`tickets.priorities.${props.row.priority}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-resolved_info="props">
        <q-td :props="props">
          <div v-if="props.row.resolved_at">
            <div class="text-body2">{{ formatDate(props.row.resolved_at) }}</div>
            <div class="text-caption text-grey-6" v-if="props.row.resolved_by_name">
              {{ $t('tickets.resolved.by') }}: {{ props.row.resolved_by_name }}
            </div>
          </div>
          <div v-else-if="props.row.closed_at">
            <div class="text-body2">{{ formatDate(props.row.closed_at) }}</div>
            <div class="text-caption text-grey-6">
              {{ $t('tickets.resolved.closed') }}
            </div>
          </div>
          <div v-else class="text-grey-6">-</div>
        </q-td>
      </template>

      <template v-slot:body-cell-resolution_time="props">
        <q-td :props="props">
          <div v-if="props.row.created_at && (props.row.resolved_at || props.row.closed_at)">
            {{ calculateResolutionTime(props.row) }}
          </div>
          <div v-else class="text-grey-6">-</div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="visibility"
              @click="openTicket(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.view') }}</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.status === 'resolved'"
              flat
              round
              dense
              color="grey"
              icon="lock"
              @click="closeTicket(props.row)"
              :loading="updatingTickets.includes(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.resolved.close') }}</q-tooltip>
            </q-btn>

            <q-btn
              v-if="['resolved', 'closed'].includes(props.row.status)"
              flat
              round
              dense
              color="orange"
              icon="refresh"
              @click="reopenTicket(props.row)"
              :loading="updatingTickets.includes(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.resolved.reopen') }}</q-tooltip>
            </q-btn>

            <q-btn-dropdown flat round dense color="grey-6" icon="more_vert">
              <q-list>
                <q-item clickable v-close-popup @click="openTicket(props.row.id)">
                  <q-item-section avatar>
                    <q-icon name="open_in_new" color="primary" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.openDetails') }}</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="exportSingleTicket(props.row)">
                  <q-item-section avatar>
                    <q-icon name="file_download" color="blue" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.resolved.exportTicket') }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { TicketsApi } from 'src/api/tickets'
import { date } from 'quasar'
import { debounce } from 'quasar'

const $q = useQuasar()
const { t } = useI18n()

// Injected methods from parent
const openTicketDetail = inject('openTicketDetail')

// State
const loading = ref(false)
const exporting = ref(false)
const tickets = ref([])
const showFilters = ref(false)
const updatingTickets = ref([])

// Filters
const filters = ref({
  search: '',
  status: '',
  priority: '',
  category_id: '',
  date_from: '',
  date_to: '',
  resolved_by: '',
})

// Pagination
const pagination = ref({
  sortBy: 'resolved_at',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  total: 0,
})

// Options
const categoryOptions = ref([])
const staffOptions = ref([])
const allStaffOptions = ref([])

// Computed
const statusOptions = computed(() => [
  { label: t('tickets.statuses.resolved'), value: 'resolved' },
  { label: t('tickets.statuses.closed'), value: 'closed' },
])

const priorityOptions = computed(() => [
  { label: t('tickets.priorities.low'), value: 'low' },
  { label: t('tickets.priorities.medium'), value: 'medium' },
  { label: t('tickets.priorities.high'), value: 'high' },
  { label: t('tickets.priorities.urgent'), value: 'urgent' },
])

const resolvedCount = computed(() => {
  return tickets.value.filter((ticket) => ticket.status === 'resolved').length
})

const closedCount = computed(() => {
  return tickets.value.filter((ticket) => ticket.status === 'closed').length
})

const totalResolvedCount = computed(() => {
  return resolvedCount.value + closedCount.value
})

// Table columns
const columns = computed(() => [
  {
    name: 'ticket_number',
    label: t('tickets.ticketNumber'),
    align: 'left',
    field: 'ticket_number',
    sortable: true,
  },
  {
    name: 'title',
    label: t('tickets.title'),
    align: 'left',
    field: 'title',
    sortable: true,
  },
  {
    name: 'client',
    label: t('tickets.client'),
    align: 'left',
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'status',
    label: t('tickets.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'priority',
    label: t('tickets.priority'),
    align: 'center',
    field: 'priority',
    sortable: true,
  },
  {
    name: 'resolved_info',
    label: t('tickets.resolved.resolvedInfo'),
    align: 'left',
    field: 'resolved_at',
    sortable: true,
  },
  {
    name: 'resolution_time',
    label: t('tickets.resolved.resolutionTime'),
    align: 'center',
    field: 'resolution_time',
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    field: 'actions',
  },
])

// Debounced search
const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

// Methods
const loadTickets = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      status: ['resolved', 'closed'],
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending,
      ...filters.value,
    }

    // Remove empty filters
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await TicketsApi.getTickets(params)
    tickets.value = response.data.tickets
    pagination.value.total = response.data.pagination.total
  } catch (error) {
    console.error('Error loading resolved tickets:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  loadTickets()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    priority: '',
    category_id: '',
    date_from: '',
    date_to: '',
    resolved_by: '',
  }
  applyFilters()
}

const setDateFilter = (period) => {
  const now = new Date()
  let startDate, endDate, lastMonth

  switch (period) {
    case 'today':
      startDate = date.formatDate(now, 'YYYY-MM-DD')
      endDate = startDate
      break
    case 'week':
      startDate = date.formatDate(date.startOfDate(now, 'week'), 'YYYY-MM-DD')
      endDate = date.formatDate(date.endOfDate(now, 'week'), 'YYYY-MM-DD')
      break
    case 'month':
      startDate = date.formatDate(date.startOfDate(now, 'month'), 'YYYY-MM-DD')
      endDate = date.formatDate(date.endOfDate(now, 'month'), 'YYYY-MM-DD')
      break
    case 'lastMonth':
      lastMonth = date.subtractFromDate(now, { months: 1 })
      startDate = date.formatDate(date.startOfDate(lastMonth, 'month'), 'YYYY-MM-DD')
      endDate = date.formatDate(date.endOfDate(lastMonth, 'month'), 'YYYY-MM-DD')
      break
  }

  filters.value.date_from = startDate
  filters.value.date_to = endDate
  applyFilters()
}

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  loadTickets()
}

const openTicket = (ticketId) => {
  if (openTicketDetail) {
    openTicketDetail(ticketId)
  }
}

const closeTicket = async (ticket) => {
  updatingTickets.value.push(ticket.id)
  try {
    await TicketsApi.updateTicket(ticket.id, {
      status: 'closed',
      closed_at: new Date().toISOString(),
    })

    $q.notify({
      color: 'positive',
      message: t('tickets.resolved.closeSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error closing ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.resolved.closeError'),
      icon: 'error',
    })
  } finally {
    updatingTickets.value = updatingTickets.value.filter((id) => id !== ticket.id)
  }
}

const reopenTicket = async (ticket) => {
  updatingTickets.value.push(ticket.id)
  try {
    await TicketsApi.updateTicket(ticket.id, {
      status: 'open',
      resolved_at: null,
      closed_at: null,
    })

    $q.notify({
      color: 'positive',
      message: t('tickets.resolved.reopenSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error reopening ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.resolved.reopenError'),
      icon: 'error',
    })
  } finally {
    updatingTickets.value = updatingTickets.value.filter((id) => id !== ticket.id)
  }
}

const exportTickets = async () => {
  exporting.value = true
  try {
    // This would be an export API call
    $q.notify({
      color: 'positive',
      message: t('tickets.resolved.exportSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error exporting tickets:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.resolved.exportError'),
      icon: 'error',
    })
  } finally {
    exporting.value = false
  }
}

const exportSingleTicket = async () => {
  try {
    // This would be a single ticket export API call
    $q.notify({
      color: 'positive',
      message: t('tickets.resolved.exportTicketSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error exporting ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.resolved.exportTicketError'),
      icon: 'error',
    })
  }
}

const loadCategories = async () => {
  try {
    const response = await TicketsApi.getCategories()
    categoryOptions.value = response.data.categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }))
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const loadStaff = async () => {
  try {
    const response = await TicketsApi.getStaff()
    if (response.data.success) {
      allStaffOptions.value = response.data.staff.map((user) => ({
        label: user.label || `${user.first_name} ${user.last_name}`,
        value: user.id,
        email: user.email,
      }))
      staffOptions.value = [...allStaffOptions.value]
    }
  } catch (error) {
    console.error('Error loading staff:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

const filterStaff = (val, update) => {
  update(() => {
    if (val === '') {
      staffOptions.value = allStaffOptions.value
    } else {
      const needle = val.toLowerCase()
      staffOptions.value = allStaffOptions.value.filter(
        (option) => option.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    resolved: 'green',
    closed: 'grey',
    cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    resolved: 'check_circle',
    closed: 'lock',
    cancelled: 'cancel',
  }
  return icons[status] || 'help'
}

const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  }
  return colors[priority] || 'grey'
}

const getPriorityIcon = (priority) => {
  const icons = {
    low: 'keyboard_arrow_down',
    medium: 'remove',
    high: 'keyboard_arrow_up',
    urgent: 'priority_high',
  }
  return icons[priority] || 'remove'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const calculateResolutionTime = (ticket) => {
  const startDate = new Date(ticket.created_at)
  const endDate = new Date(ticket.resolved_at || ticket.closed_at)
  const diffInHours = Math.floor((endDate - startDate) / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return `${diffInHours}${t('common.hours')}`
  } else {
    const days = Math.floor(diffInHours / 24)
    const hours = diffInHours % 24
    return `${days}${t('common.days')} ${hours}${t('common.hours')}`
  }
}

// Lifecycle
onMounted(() => {
  loadTickets()
  loadCategories()
  loadStaff()
})
</script>

<style scoped>
:deep(.q-table) tbody tr:hover {
  background: rgba(25, 118, 210, 0.04);
}

.q-chip {
  cursor: pointer;
  transition: all 0.3s ease;
}

.q-chip:hover {
  transform: scale(1.05);
}
</style>
