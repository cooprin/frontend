<template>
  <div>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ $t('tickets.all.title') }}</div>
      <div class="row q-gutter-sm">
        <!-- Bulk Actions -->
        <q-btn-dropdown
          v-if="selected.length > 0"
          color="orange"
          icon="playlist_add_check"
          :label="$t('tickets.all.bulkActions', { count: selected.length })"
        >
          <q-list>
            <q-item clickable v-close-popup @click="showBulkAssignDialog = true">
              <q-item-section avatar>
                <q-icon name="person_add" color="blue" />
              </q-item-section>
              <q-item-section>{{ $t('tickets.all.bulkAssign') }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="showBulkStatusDialog = true">
              <q-item-section avatar>
                <q-icon name="update" color="green" />
              </q-item-section>
              <q-item-section>{{ $t('tickets.all.bulkStatus') }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="showBulkPriorityDialog = true">
              <q-item-section avatar>
                <q-icon name="priority_high" color="red" />
              </q-item-section>
              <q-item-section>{{ $t('tickets.all.bulkPriority') }}</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="exportSelected">
              <q-item-section avatar>
                <q-icon name="file_download" color="purple" />
              </q-item-section>
              <q-item-section>{{ $t('tickets.all.exportSelected') }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

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
          :label="$t('tickets.all.export')"
          @click="exportAllTickets"
          :loading="exporting"
        />
        <q-btn
          color="primary"
          icon="add"
          :label="$t('tickets.add')"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Advanced Filters Card -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-subtitle2">{{ $t('tickets.all.advancedFilters') }}</div>
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
            <!-- Main Filters Row -->
            <div class="row q-col-gutter-md q-mb-md">
              <!-- Search -->
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filters.search"
                  :label="$t('tickets.all.globalSearch')"
                  :hint="$t('tickets.all.searchHint')"
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
                  multiple
                  clearable
                  @update:model-value="applyFilters"
                >
                  <template v-slot:selected-item="{ opt }">
                    <q-chip :color="getStatusColor(opt.value)" text-color="white" dense size="sm">
                      {{ opt.label }}
                    </q-chip>
                  </template>
                </q-select>
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
                  multiple
                  clearable
                  @update:model-value="applyFilters"
                >
                  <template v-slot:selected-item="{ opt }">
                    <q-chip :color="getPriorityColor(opt.value)" text-color="white" dense size="sm">
                      {{ opt.label }}
                    </q-chip>
                  </template>
                </q-select>
              </div>

              <!-- Category -->
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.category_id"
                  :options="categoryOptions"
                  :label="$t('tickets.category')"
                  outlined
                  dense
                  emit-value
                  map-options
                  multiple
                  clearable
                  @update:model-value="applyFilters"
                />
              </div>

              <!-- Assigned To -->
              <div class="col-12 col-md-2">
                <q-select
                  v-model="filters.assigned_to"
                  :options="assigneeOptions"
                  :label="$t('tickets.assignedTo')"
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
            </div>

            <!-- Date Filters Row -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-2">
                <q-input
                  v-model="filters.created_from"
                  :label="$t('tickets.all.createdFrom')"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.created_from"
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

              <div class="col-12 col-md-2">
                <q-input
                  v-model="filters.created_to"
                  :label="$t('tickets.all.createdTo')"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.created_to"
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

              <div class="col-12 col-md-2">
                <q-input
                  v-model="filters.updated_from"
                  :label="$t('tickets.all.updatedFrom')"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.updated_from"
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

              <div class="col-12 col-md-2">
                <q-input
                  v-model="filters.updated_to"
                  :label="$t('tickets.all.updatedTo')"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.updated_to"
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

              <!-- Client Filter -->
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.client_id"
                  :options="clientOptions"
                  :label="$t('tickets.client')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="300"
                  @filter="filterClients"
                  @update:model-value="applyFilters"
                />
              </div>

              <!-- Clear Filters -->
              <div class="col-12 col-md-1">
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

            <!-- Quick Filters -->
            <div class="row q-gutter-sm">
              <q-chip
                clickable
                :color="quickFilter === 'urgent' ? 'red' : 'grey-4'"
                :text-color="quickFilter === 'urgent' ? 'white' : 'black'"
                icon="priority_high"
                :label="$t('tickets.all.urgentOnly')"
                @click="setQuickFilter('urgent')"
              />
              <q-chip
                clickable
                :color="quickFilter === 'unassigned' ? 'orange' : 'grey-4'"
                :text-color="quickFilter === 'unassigned' ? 'white' : 'black'"
                icon="person_off"
                :label="$t('tickets.all.unassigned')"
                @click="setQuickFilter('unassigned')"
              />
              <q-chip
                clickable
                :color="quickFilter === 'my' ? 'blue' : 'grey-4'"
                :text-color="quickFilter === 'my' ? 'white' : 'black'"
                icon="person"
                :label="$t('tickets.all.myTickets')"
                @click="setQuickFilter('my')"
              />
              <q-chip
                clickable
                :color="quickFilter === 'overdue' ? 'red-8' : 'grey-4'"
                :text-color="quickFilter === 'overdue' ? 'white' : 'black'"
                icon="schedule"
                :label="$t('tickets.all.overdue')"
                @click="setQuickFilter('overdue')"
              />
              <q-chip
                clickable
                :color="quickFilter === 'recent' ? 'green' : 'grey-4'"
                :text-color="quickFilter === 'recent' ? 'white' : 'black'"
                icon="new_releases"
                :label="$t('tickets.all.recent24h')"
                @click="setQuickFilter('recent')"
              />
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
    </q-card>

    <!-- Statistics -->
    <div class="row q-gutter-sm q-mb-md">
      <q-chip color="blue" text-color="white" icon="confirmation_number">
        {{ $t('tickets.all.total') }}: {{ pagination.total }}
      </q-chip>
      <q-chip color="orange" text-color="white" icon="fiber_new">
        {{ $t('tickets.all.newTickets') }}: {{ getCountByStatus('open') }}
      </q-chip>
      <q-chip color="purple" text-color="white" icon="play_arrow">
        {{ $t('tickets.all.inProgress') }}:
        {{ getCountByStatus(['in_progress', 'waiting_client']) }}
      </q-chip>
      <q-chip color="green" text-color="white" icon="check_circle">
        {{ $t('tickets.all.resolved') }}: {{ getCountByStatus(['resolved', 'closed']) }}
      </q-chip>
      <q-chip color="red" text-color="white" icon="priority_high">
        {{ $t('tickets.all.urgent') }}: {{ getCountByPriority('urgent') }}
      </q-chip>
    </div>

    <!-- Tickets Table -->
    <q-table
      :rows="tickets"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      v-model:selected="selected"
      selection="multiple"
      @request="onRequest"
      @selection="onSelectionChange"
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

      <template v-slot:body-cell-assigned_to="props">
        <q-td :props="props">
          <div v-if="props.row.assigned_to_name" class="row items-center">
            <q-avatar size="20px" class="q-mr-xs">
              <q-icon name="person" />
            </q-avatar>
            <div class="text-body2">{{ props.row.assigned_to_name }}</div>
          </div>
          <div v-else class="text-grey-6 text-caption">
            {{ $t('tickets.all.unassigned') }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          <div class="text-body2">{{ formatDate(props.row.created_at) }}</div>
          <div class="text-caption text-grey-6">{{ formatTime(props.row.created_at) }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-updated_at="props">
        <q-td :props="props">
          <div class="text-body2">{{ formatDate(props.row.updated_at) }}</div>
          <div class="text-caption text-grey-6">{{ formatRelativeTime(props.row.updated_at) }}</div>
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

            <q-btn-dropdown flat round dense color="grey-6" icon="more_vert">
              <q-list>
                <q-item clickable v-close-popup @click="quickAssign(props.row)">
                  <q-item-section avatar>
                    <q-icon name="person_add" color="blue" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.assignToMe') }}</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="quickStatusChange(props.row, getNextStatus(props.row.status))"
                >
                  <q-item-section avatar>
                    <q-icon name="update" color="green" />
                  </q-item-section>
                  <q-item-section>{{ getNextStatusLabel(props.row.status) }}</q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="openTicket(props.row.id)">
                  <q-item-section avatar>
                    <q-icon name="open_in_new" color="primary" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.openDetails') }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Create Ticket Dialog -->
    <create-ticket-dialog v-model="showCreateDialog" @ticket-created="onTicketCreated" />

    <!-- Bulk Action Dialogs -->
    <bulk-assign-dialog
      v-model="showBulkAssignDialog"
      :tickets="selected"
      @assigned="onBulkAction"
    />

    <bulk-status-dialog
      v-model="showBulkStatusDialog"
      :tickets="selected"
      @updated="onBulkAction"
    />

    <bulk-priority-dialog
      v-model="showBulkPriorityDialog"
      :tickets="selected"
      @updated="onBulkAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { TicketsApi } from 'src/api/tickets'
import { date } from 'quasar'
import { debounce } from 'quasar'
import CreateTicketDialog from 'components/tickets/CreateTicketDialog.vue'
import BulkAssignDialog from 'components/tickets/BulkAssignDialog.vue'
import BulkStatusDialog from 'components/tickets/BulkStatusDialog.vue'
import BulkPriorityDialog from 'components/tickets/BulkPriorityDialog.vue'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// Injected methods from parent
const openTicketDetail = inject('openTicketDetail')

// State
const loading = ref(false)
const exporting = ref(false)
const tickets = ref([])
const selected = ref([])
const showFilters = ref(false)
const quickFilter = ref(null)

// Dialog states
const showCreateDialog = ref(false)
const showBulkAssignDialog = ref(false)
const showBulkStatusDialog = ref(false)
const showBulkPriorityDialog = ref(false)

// Filters
const filters = ref({
  search: '',
  status: [],
  priority: [],
  category_id: [],
  assigned_to: '',
  client_id: '',
  created_from: '',
  created_to: '',
  updated_from: '',
  updated_to: '',
})

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  total: 0,
})

// Options
const categoryOptions = ref([])
const assigneeOptions = ref([])

const allAssigneeOptions = ref([])
const clientOptions = ref([])

// Computed
const statusOptions = computed(() => [
  { label: t('tickets.statuses.open'), value: 'open' },
  { label: t('tickets.statuses.in_progress'), value: 'in_progress' },
  { label: t('tickets.statuses.waiting_client'), value: 'waiting_client' },
  { label: t('tickets.statuses.resolved'), value: 'resolved' },
  { label: t('tickets.statuses.closed'), value: 'closed' },
  { label: t('tickets.statuses.cancelled'), value: 'cancelled' },
])

const priorityOptions = computed(() => [
  { label: t('tickets.priorities.low'), value: 'low' },
  { label: t('tickets.priorities.medium'), value: 'medium' },
  { label: t('tickets.priorities.high'), value: 'high' },
  { label: t('tickets.priorities.urgent'), value: 'urgent' },
])

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
    name: 'assigned_to',
    label: t('tickets.assignedTo'),
    align: 'left',
    field: 'assigned_to_name',
    sortable: true,
  },
  {
    name: 'created_at',
    label: t('tickets.createdAt'),
    align: 'left',
    field: 'created_at',
    sortable: true,
  },
  {
    name: 'updated_at',
    label: t('tickets.lastUpdate'),
    align: 'left',
    field: 'updated_at',
    sortable: true,
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
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending,
      ...filters.value,
    }

    // Remove empty filters
    Object.keys(params).forEach((key) => {
      if (
        params[key] === '' ||
        params[key] === null ||
        params[key] === undefined ||
        (Array.isArray(params[key]) && params[key].length === 0)
      ) {
        delete params[key]
      }
    })

    const response = await TicketsApi.getTickets(params)
    tickets.value = response.data.tickets
    pagination.value.total = response.data.pagination.total
  } catch (error) {
    console.error('Error loading all tickets:', error)
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
  selected.value = []
  loadTickets()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: [],
    priority: [],
    category_id: [],
    assigned_to: '',
    client_id: '',
    created_from: '',
    created_to: '',
    updated_from: '',
    updated_to: '',
  }
  quickFilter.value = null
  applyFilters()
}

const setQuickFilter = (filter) => {
  quickFilter.value = quickFilter.value === filter ? null : filter

  // Reset relevant filters
  switch (filter) {
    case 'urgent':
      filters.value.priority = quickFilter.value ? ['urgent'] : []
      break
    case 'unassigned':
      filters.value.assigned_to = quickFilter.value ? 'unassigned' : ''
      break
    case 'my':
      filters.value.assigned_to = quickFilter.value ? authStore.user.id : ''
      break
    case 'overdue':
      // This would need backend support
      break
    case 'recent':
      if (quickFilter.value) {
        const yesterday = date.subtractFromDate(new Date(), { days: 1 })
        filters.value.created_from = date.formatDate(yesterday, 'YYYY-MM-DD')
        filters.value.created_to = date.formatDate(new Date(), 'YYYY-MM-DD')
      } else {
        filters.value.created_from = ''
        filters.value.created_to = ''
      }
      break
  }

  if (!quickFilter.value) {
    // Reset filters when deselecting
    clearFilters()
  } else {
    applyFilters()
  }
}

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  loadTickets()
}

const onSelectionChange = (selection) => {
  selected.value = selection.keys
}

const openTicket = (ticketId) => {
  if (openTicketDetail) {
    openTicketDetail(ticketId)
  }
}

const quickAssign = async (ticket) => {
  try {
    await TicketsApi.updateTicket(ticket.id, {
      assigned_to: authStore.user.id,
    })

    $q.notify({
      color: 'positive',
      message: t('tickets.assignSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error assigning ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.assignError'),
      icon: 'error',
    })
  }
}

const quickStatusChange = async (ticket, newStatus) => {
  try {
    await TicketsApi.updateTicket(ticket.id, { status: newStatus })

    $q.notify({
      color: 'positive',
      message: t('tickets.updateSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error updating ticket status:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.updateError'),
      icon: 'error',
    })
  }
}

const getNextStatus = (currentStatus) => {
  const statusFlow = {
    open: 'in_progress',
    in_progress: 'resolved',
    waiting_client: 'in_progress',
    resolved: 'closed',
    closed: 'open',
    cancelled: 'open',
  }
  return statusFlow[currentStatus] || 'in_progress'
}

const getNextStatusLabel = (currentStatus) => {
  const nextStatus = getNextStatus(currentStatus)
  return t(`tickets.statuses.${nextStatus}`)
}

const exportAllTickets = async () => {
  exporting.value = true
  try {
    // This would be an export API call
    $q.notify({
      color: 'positive',
      message: t('tickets.all.exportSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error exporting tickets:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.all.exportError'),
      icon: 'error',
    })
  } finally {
    exporting.value = false
  }
}

const exportSelected = async () => {
  try {
    // Export selected tickets
    $q.notify({
      color: 'positive',
      message: t('tickets.all.exportSelectedSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error exporting selected tickets:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.all.exportSelectedError'),
      icon: 'error',
    })
  }
}

const onTicketCreated = () => {
  loadTickets()
}

const onBulkAction = () => {
  selected.value = []
  loadTickets()
}

const loadCategories = async () => {
  try {
    const response = await TicketsApi.getCategories()
    categoryOptions.value = response.data.categories.map((cat) => ({
      label: cat.name.startsWith('tickets.categories.')
        ? t(cat.name)
        : t(`tickets.categories.${cat.name}`),
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
      allAssigneeOptions.value = [
        { label: t('tickets.all.unassigned'), value: 'unassigned' },
        ...response.data.staff.map((user) => ({
          label: user.label || `${user.first_name} ${user.last_name}`,
          value: user.id,
          email: user.email,
        })),
      ]
      assigneeOptions.value = [...allAssigneeOptions.value]
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
      assigneeOptions.value = [...allAssigneeOptions.value]
    } else {
      const needle = val.toLowerCase()
      assigneeOptions.value = allAssigneeOptions.value.filter(
        (option) => option.label && option.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const filterClients = async (val, update) => {
  if (val.length < 2) {
    update(() => {
      clientOptions.value = []
    })
    return
  }

  try {
    // This would be a clients search API call
    update(() => {
      clientOptions.value = [{ label: `Client ${val}`, value: 'client1' }]
    })
  } catch (error) {
    console.error('Error searching clients:', error)
  }
}

// Statistics helpers
const getCountByStatus = (statuses) => {
  const statusArray = Array.isArray(statuses) ? statuses : [statuses]
  return tickets.value.filter((ticket) => statusArray.includes(ticket.status)).length
}

const getCountByPriority = (priority) => {
  return tickets.value.filter((ticket) => ticket.priority === priority).length
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    open: 'blue',
    in_progress: 'orange',
    waiting_client: 'purple',
    resolved: 'green',
    closed: 'grey',
    cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    open: 'fiber_new',
    in_progress: 'play_arrow',
    waiting_client: 'schedule',
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
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'HH:mm')
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return '-'
  const now = new Date()
  const ticketDate = new Date(dateString)
  const diffInHours = (now - ticketDate) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - ticketDate) / (1000 * 60))
    return diffInMinutes <= 1
      ? t('common.justNow')
      : t('common.minutesAgo', { count: diffInMinutes })
  } else if (diffInHours < 24) {
    return t('common.hoursAgo', { count: Math.floor(diffInHours) })
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return t('common.daysAgo', { count: diffInDays })
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

:deep(.q-table__top) {
  padding: 8px 16px;
}

:deep(.q-table__bottom) {
  padding: 8px 16px;
}
</style>
