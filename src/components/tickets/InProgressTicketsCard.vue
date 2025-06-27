<template>
  <div>
    <!-- Header with search and filters -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ $t('tickets.inProgress.title') }}</div>
      <div class="row q-gutter-sm">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('tickets.inProgress.searchPlaceholder')"
          outlined
          dense
          style="min-width: 300px"
          @update:model-value="onSearch"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          color="secondary"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="loadTickets"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Quick Filters -->
    <div class="row q-gutter-sm q-mb-md">
      <q-chip
        clickable
        :color="showMyTicketsOnly ? 'primary' : 'grey-4'"
        :text-color="showMyTicketsOnly ? 'white' : 'black'"
        icon="person"
        :label="$t('tickets.inProgress.myTickets')"
        @click="toggleMyTickets"
      />
      <q-chip
        clickable
        :color="statusFilter === 'in_progress' ? 'orange' : 'grey-4'"
        :text-color="statusFilter === 'in_progress' ? 'white' : 'black'"
        icon="play_arrow"
        :label="$t('tickets.statuses.in_progress')"
        @click="setStatusFilter('in_progress')"
      />
      <q-chip
        clickable
        :color="statusFilter === 'waiting_client' ? 'purple' : 'grey-4'"
        :text-color="statusFilter === 'waiting_client' ? 'white' : 'black'"
        icon="schedule"
        :label="$t('tickets.statuses.waiting_client')"
        @click="setStatusFilter('waiting_client')"
      />
      <q-chip
        clickable
        :color="statusFilter === null ? 'blue' : 'grey-4'"
        :text-color="statusFilter === null ? 'white' : 'black'"
        icon="view_list"
        :label="$t('tickets.inProgress.allInProgress')"
        @click="setStatusFilter(null)"
      />
    </div>

    <!-- Statistics -->
    <div class="row q-gutter-sm q-mb-md">
      <q-chip color="blue" text-color="white" icon="confirmation_number">
        {{ $t('tickets.inProgress.total') }}: {{ pagination.total }}
      </q-chip>
      <q-chip color="orange" text-color="white" icon="play_arrow">
        {{ $t('tickets.inProgress.inProgress') }}: {{ inProgressCount }}
      </q-chip>
      <q-chip color="purple" text-color="white" icon="schedule">
        {{ $t('tickets.inProgress.waitingClient') }}: {{ waitingClientCount }}
      </q-chip>
      <q-chip color="green" text-color="white" icon="person">
        {{ $t('tickets.inProgress.assignedToMe') }}: {{ myTicketsCount }}
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
      :rows-per-page-options="[10, 25, 50]"
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

      <template v-slot:body-cell-assigned_to="props">
        <q-td :props="props">
          <div v-if="props.row.assigned_to_name" class="row items-center">
            <q-avatar size="24px" class="q-mr-sm">
              <q-icon name="person" />
            </q-avatar>
            <div>
              <div class="text-body2">{{ props.row.assigned_to_name }}</div>
              <div class="text-caption text-grey-6">
                {{ $t('tickets.inProgress.assignedOn') }}: {{ formatDate(props.row.assigned_at) }}
              </div>
            </div>
          </div>
          <div v-else class="text-grey-6">
            {{ $t('tickets.inProgress.unassigned') }}
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

      <template v-slot:body-cell-last_comment="props">
        <q-td :props="props">
          <div v-if="props.row.last_comment" class="last-comment">
            <div class="text-caption text-grey-6 q-mb-xs">
              {{ props.row.last_comment.author_name }} •
              {{ formatRelativeTime(props.row.last_comment.created_at) }}
            </div>
            <div class="text-body2">
              {{ truncateText(props.row.last_comment.comment_text, 100) }}
            </div>
          </div>
          <div v-else class="text-grey-6 text-caption">
            {{ $t('tickets.inProgress.noComments') }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-updated_at="props">
        <q-td :props="props">
          <div class="text-body2">{{ formatDate(props.row.updated_at) }}</div>
          <div class="text-caption text-grey-6">{{ formatTime(props.row.updated_at) }}</div>
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
              v-if="props.row.status === 'in_progress'"
              flat
              round
              dense
              color="purple"
              icon="schedule"
              @click="setWaitingClient(props.row)"
              :loading="updatingTickets.includes(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.inProgress.setWaitingClient') }}</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.status === 'waiting_client'"
              flat
              round
              dense
              color="orange"
              icon="play_arrow"
              @click="resumeWork(props.row)"
              :loading="updatingTickets.includes(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.inProgress.resumeWork') }}</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              color="green"
              icon="check_circle"
              @click="markResolved(props.row)"
              :loading="resolvingTickets.includes(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.inProgress.markResolved') }}</q-tooltip>
            </q-btn>

            <q-btn-dropdown flat round dense color="grey-6" icon="more_vert">
              <q-list>
                <q-item
                  v-if="!props.row.assigned_to || props.row.assigned_to !== authStore.user.id"
                  clickable
                  v-close-popup
                  @click="assignToMe(props.row)"
                >
                  <q-item-section avatar>
                    <q-icon name="person_add" color="blue" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.assignToMe') }}</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="changePriority(props.row, 'urgent')">
                  <q-item-section avatar>
                    <q-icon name="priority_high" color="red" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.markUrgent') }}</q-item-section>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { TicketsApi } from 'src/api/tickets'
import { date } from 'quasar'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// Injected methods from parent
const openTicketDetail = inject('openTicketDetail')

// State
const loading = ref(false)
const tickets = ref([])
const searchQuery = ref('')
const showMyTicketsOnly = ref(false)
const statusFilter = ref(null) // null = all, 'in_progress', 'waiting_client'
const updatingTickets = ref([])
const resolvingTickets = ref([])
const allStaffOptions = ref([])

// Pagination
const pagination = ref({
  sortBy: 'updated_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  total: 0,
})

// Computed
const inProgressCount = computed(() => {
  return tickets.value.filter((ticket) => ticket.status === 'in_progress').length
})

const waitingClientCount = computed(() => {
  return tickets.value.filter((ticket) => ticket.status === 'waiting_client').length
})

const myTicketsCount = computed(() => {
  return tickets.value.filter((ticket) => ticket.assigned_to === authStore.user.id).length
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
    name: 'assigned_to',
    label: t('tickets.assignedTo'),
    align: 'left',
    field: 'assigned_to_name',
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
    name: 'last_comment',
    label: t('tickets.inProgress.lastComment'),
    align: 'left',
    field: 'last_comment',
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

// Methods
const loadTickets = async () => {
  loading.value = true
  try {
    const statuses = statusFilter.value ? [statusFilter.value] : ['in_progress', 'waiting_client']

    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      status: statuses,
      search: searchQuery.value,
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending,
    }

    if (showMyTicketsOnly.value) {
      params.assigned_to = authStore.user.id
    }

    const response = await TicketsApi.getTickets(params)
    tickets.value = response.data.tickets
    pagination.value.total = response.data.pagination.total
  } catch (error) {
    console.error('Error loading in progress tickets:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  pagination.value.page = 1
  loadTickets()
}

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  loadTickets()
}

const toggleMyTickets = () => {
  showMyTicketsOnly.value = !showMyTicketsOnly.value
  pagination.value.page = 1
  loadTickets()
}

const setStatusFilter = (status) => {
  statusFilter.value = statusFilter.value === status ? null : status
  pagination.value.page = 1
  loadTickets()
}

const openTicket = (ticketId) => {
  if (openTicketDetail) {
    openTicketDetail(ticketId)
  }
}

const setWaitingClient = async (ticket) => {
  updatingTickets.value.push(ticket.id)
  try {
    await TicketsApi.updateTicket(ticket.id, {
      status: 'waiting_client',
    })

    $q.notify({
      color: 'positive',
      message: t('tickets.inProgress.setWaitingClientSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error setting waiting client:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.inProgress.setWaitingClientError'),
      icon: 'error',
    })
  } finally {
    updatingTickets.value = updatingTickets.value.filter((id) => id !== ticket.id)
  }
}

const resumeWork = async (ticket) => {
  updatingTickets.value.push(ticket.id)
  try {
    await TicketsApi.updateTicket(ticket.id, {
      status: 'in_progress',
    })

    $q.notify({
      color: 'positive',
      message: t('tickets.inProgress.resumeWorkSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error resuming work:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.inProgress.resumeWorkError'),
      icon: 'error',
    })
  } finally {
    updatingTickets.value = updatingTickets.value.filter((id) => id !== ticket.id)
  }
}

const markResolved = async (ticket) => {
  resolvingTickets.value.push(ticket.id)
  try {
    await TicketsApi.updateTicket(ticket.id, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    })

    $q.notify({
      color: 'positive',
      message: t('tickets.inProgress.markResolvedSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error marking resolved:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.inProgress.markResolvedError'),
      icon: 'error',
    })
  } finally {
    resolvingTickets.value = resolvingTickets.value.filter((id) => id !== ticket.id)
  }
}

const assignToMe = async (ticket) => {
  updatingTickets.value.push(ticket.id)
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
  } finally {
    updatingTickets.value = updatingTickets.value.filter((id) => id !== ticket.id)
  }
}

const changePriority = async (ticket, priority) => {
  try {
    await TicketsApi.updateTicket(ticket.id, { priority })

    $q.notify({
      color: 'positive',
      message: t('tickets.priorityChanged'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error changing priority:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.priorityChangeError'),
      icon: 'error',
    })
  }
}

const loadStaff = async () => {
  try {
    const response = await TicketsApi.getStaff()
    if (response.data.success) {
      // Зберігаємо дані працівників для можливого майбутнього використання
      allStaffOptions.value = response.data.staff.map((user) => ({
        label: user.label || `${user.first_name} ${user.last_name}`,
        value: user.id,
        email: user.email,
      }))
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

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    in_progress: 'orange',
    waiting_client: 'purple',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    in_progress: 'play_arrow',
    waiting_client: 'schedule',
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
  const commentDate = new Date(dateString)
  const diffInHours = (now - commentDate) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60))
    return diffInMinutes <= 1
      ? t('common.justNow')
      : t('common.minutesAgo', { count: diffInMinutes })
  } else if (diffInHours < 24) {
    return t('common.hoursAgo', { count: Math.floor(diffInHours) })
  } else {
    return formatDate(dateString)
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Lifecycle
onMounted(() => {
  loadTickets()
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

.last-comment {
  max-width: 200px;
}
</style>
