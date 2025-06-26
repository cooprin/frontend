<template>
  <div>
    <!-- Header with search -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ $t('tickets.new.title') }}</div>
      <div class="row q-gutter-sm">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('tickets.new.searchPlaceholder')"
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
          color="primary"
          icon="add"
          :label="$t('tickets.create')"
          @click="showCreateDialog = true"
        />
        <q-btn
          color="secondary"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="loadTickets"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Statistics chips -->
    <div class="row q-gutter-sm q-mb-md">
      <q-chip color="blue" text-color="white" icon="confirmation_number">
        {{ $t('tickets.new.total') }}: {{ pagination.total }}
      </q-chip>
      <q-chip color="red" text-color="white" icon="priority_high">
        {{ $t('tickets.new.urgent') }}: {{ urgentCount }}
      </q-chip>
      <q-chip color="orange" text-color="white" icon="warning">
        {{ $t('tickets.new.high') }}: {{ highPriorityCount }}
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

      <template v-slot:body-cell-client="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="24px" class="q-mr-sm">
              <q-icon name="person" />
            </q-avatar>
            <div>
              <div class="text-body2">{{ props.row.client_name }}</div>
              <div class="text-caption text-grey-6" v-if="props.row.client_email">
                {{ props.row.client_email }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-chip
            :color="getPriorityColor(props.row.priority)"
            text-color="white"
            :icon="getPriorityIcon(props.row.priority)"
            dense
          >
            {{ $t(`tickets.priorities.${props.row.priority}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          <div class="text-body2">{{ formatDate(props.row.created_at) }}</div>
          <div class="text-caption text-grey-6">{{ formatTime(props.row.created_at) }}</div>
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
              flat
              round
              dense
              color="blue"
              icon="person_add"
              @click="assignToMe(props.row)"
              :loading="assigningTickets.includes(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.assignToMe') }}</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              color="orange"
              icon="play_arrow"
              @click="startWork(props.row)"
              :loading="startingTickets.includes(props.row.id)"
            >
              <q-tooltip>{{ $t('tickets.startWork') }}</q-tooltip>
            </q-btn>

            <q-btn-dropdown flat round dense color="grey-6" icon="more_vert">
              <q-list>
                <q-item clickable v-close-popup @click="changePriority(props.row, 'urgent')">
                  <q-item-section avatar>
                    <q-icon name="priority_high" color="red" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.markUrgent') }}</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="changePriority(props.row, 'high')">
                  <q-item-section avatar>
                    <q-icon name="warning" color="orange" />
                  </q-item-section>
                  <q-item-section>{{ $t('tickets.markHigh') }}</q-item-section>
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
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('tickets.create') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <q-form @submit="createTicket" class="q-gutter-md">
            <q-select
              v-model="newTicket.client_id"
              :options="clientOptions"
              :label="$t('tickets.client')"
              outlined
              dense
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterClients"
              :rules="[(val) => !!val || $t('common.validation.required')]"
            />

            <q-input
              v-model="newTicket.title"
              :label="$t('tickets.title')"
              outlined
              dense
              :rules="[(val) => !!val || $t('common.validation.required')]"
            />

            <q-input
              v-model="newTicket.description"
              :label="$t('tickets.description')"
              outlined
              dense
              type="textarea"
              rows="4"
              :rules="[(val) => !!val || $t('common.validation.required')]"
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="newTicket.priority"
                  :options="priorityOptions"
                  :label="$t('tickets.priority')"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col">
                <q-select
                  v-model="newTicket.category_id"
                  :options="categoryOptions"
                  :label="$t('tickets.category')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            :label="$t('common.create')"
            color="primary"
            @click="createTicket"
            :loading="creating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
const creating = ref(false)
const tickets = ref([])
const searchQuery = ref('')
const showCreateDialog = ref(false)
const assigningTickets = ref([])
const startingTickets = ref([])

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  total: 0,
})

// New ticket form
const newTicket = ref({
  client_id: '',
  title: '',
  description: '',
  priority: 'medium',
  category_id: '',
})

// Options
const clientOptions = ref([])
const categoryOptions = ref([])

// Computed
const urgentCount = computed(() => {
  return tickets.value.filter((ticket) => ticket.priority === 'urgent').length
})

const highPriorityCount = computed(() => {
  return tickets.value.filter((ticket) => ticket.priority === 'high').length
})

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
    name: 'priority',
    label: t('tickets.priority'),
    align: 'center',
    field: 'priority',
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
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      status: ['open'],
      search: searchQuery.value,
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending,
    }

    const response = await TicketsApi.getTickets(params)
    tickets.value = response.data.tickets
    pagination.value.total = response.data.pagination.total
  } catch (error) {
    console.error('Error loading new tickets:', error)
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

const openTicket = (ticketId) => {
  if (openTicketDetail) {
    openTicketDetail(ticketId)
  }
}

const assignToMe = async (ticket) => {
  assigningTickets.value.push(ticket.id)
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
    assigningTickets.value = assigningTickets.value.filter((id) => id !== ticket.id)
  }
}

const startWork = async (ticket) => {
  startingTickets.value.push(ticket.id)
  try {
    const updateData = {
      status: 'in_progress',
    }

    // Also assign to current user if not assigned
    if (!ticket.assigned_to) {
      updateData.assigned_to = authStore.user.id
    }

    await TicketsApi.updateTicket(ticket.id, updateData)

    $q.notify({
      color: 'positive',
      message: t('tickets.startWorkSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error starting work on ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.startWorkError'),
      icon: 'error',
    })
  } finally {
    startingTickets.value = startingTickets.value.filter((id) => id !== ticket.id)
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

const createTicket = async () => {
  creating.value = true
  try {
    await TicketsApi.createTicket(newTicket.value)

    showCreateDialog.value = false
    newTicket.value = {
      client_id: '',
      title: '',
      description: '',
      priority: 'medium',
      category_id: '',
    }

    $q.notify({
      color: 'positive',
      message: t('tickets.createSuccess'),
      icon: 'check',
    })

    await loadTickets()
  } catch (error) {
    console.error('Error creating ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.createError'),
      icon: 'error',
    })
  } finally {
    creating.value = false
  }
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

// Utility methods
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
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const formatTime = (dateString) => {
  return date.formatDate(dateString, 'HH:mm')
}

// Lifecycle
onMounted(() => {
  loadTickets()
  loadCategories()
})
</script>

<style scoped>
:deep(.q-table) tbody tr:hover {
  background: rgba(25, 118, 210, 0.04);
}

.q-chip {
  font-weight: 500;
}
</style>
