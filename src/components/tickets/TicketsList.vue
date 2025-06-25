<template>
  <div>
    <!-- Filters -->
    <TicketFilters v-model:filters="filters" @filter-change="onFilterChange" class="q-mb-md" />

    <!-- Table -->
    <q-table
      :rows="tickets"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="onRequest"
      :rows-per-page-options="pagination.rowsPerPageOptions"
      :rows-per-page-label="$t('common.rowsPerPage')"
      :selected-rows-label="$t('common.selectedRows')"
      :pagination-label="paginationLabel"
      @update:pagination="onRequest"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          icon="add"
          :label="$t('tickets.create')"
          @click="createTicketDialog = true"
        />
      </template>

      <template v-slot:body-cell-ticket_number="props">
        <q-td :props="props">
          <q-btn
            flat
            no-caps
            color="primary"
            :label="props.row.ticket_number"
            @click="$emit('ticket-selected', props.row.id)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-chip :color="getPriorityColor(props.row.priority)" text-color="white" dense>
            {{ $t(`tickets.priorities.${props.row.priority}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip :color="getStatusColor(props.row.status)" text-color="white" dense>
            {{ $t(`tickets.statuses.${props.row.status}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-category_name="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-icon
              :name="getCategoryIcon(props.row.category_color)"
              :color="props.row.category_color || 'grey'"
              size="xs"
              class="q-mr-xs"
            />
            {{ props.row.category_name || '-' }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-assigned_to_name="props">
        <q-td :props="props">
          <div v-if="props.row.assigned_to_name" class="row items-center">
            <q-avatar size="24px" class="q-mr-xs">
              <q-icon name="person" />
            </q-avatar>
            {{ props.row.assigned_to_name }}
          </div>
          <q-btn
            v-else
            flat
            dense
            color="primary"
            icon="person_add"
            :label="$t('tickets.assignToMe')"
            @click="assignToMe(props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-comments_count="props">
        <q-td :props="props" class="text-center">
          <q-chip v-if="props.row.comments_count > 0" color="blue-grey" text-color="white" dense>
            {{ props.row.comments_count }}
          </q-chip>
          <span v-else class="text-grey">0</span>
        </q-td>
      </template>

      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          {{ formatDate(props.row.created_at) }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="visibility"
            @click="$emit('ticket-selected', props.row.id)"
          >
            <q-tooltip>{{ $t('tickets.view') }}</q-tooltip>
          </q-btn>

          <q-btn-dropdown flat round dense color="primary" icon="more_vert">
            <q-list>
              <q-item clickable v-close-popup @click="quickStatusChange(props.row, 'in_progress')">
                <q-item-section avatar>
                  <q-icon name="play_arrow" color="orange" />
                </q-item-section>
                <q-item-section>{{ $t('tickets.startWork') }}</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="quickStatusChange(props.row, 'resolved')">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="green" />
                </q-item-section>
                <q-item-section>{{ $t('tickets.markResolved') }}</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="assignToMe(props.row)">
                <q-item-section avatar>
                  <q-icon name="person_add" color="blue" />
                </q-item-section>
                <q-item-section>{{ $t('tickets.assignToMe') }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-td>
      </template>
    </q-table>

    <!-- Create Ticket Dialog -->
    <q-dialog v-model="createTicketDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('tickets.create') }}</div>
        </q-card-section>

        <q-card-section>
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

            <q-select
              v-model="newTicket.category_id"
              :options="categoryOptions"
              :label="$t('tickets.category')"
              outlined
              dense
              emit-value
              map-options
            />

            <q-input
              v-model="newTicket.title"
              :label="$t('tickets.ticketTitle')"
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

            <q-select
              v-model="newTicket.priority"
              :options="priorityOptions"
              :label="$t('tickets.priority')"
              outlined
              dense
              emit-value
              map-options
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn
                color="primary"
                type="submit"
                :label="$t('common.create')"
                :loading="creating"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { TicketsApi } from 'src/api/tickets'
import TicketFilters from './TicketFilters.vue'

const props = defineProps({
  statusFilter: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['ticket-selected'])

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// State
const loading = ref(false)
const creating = ref(false)
const tickets = ref([])
const createTicketDialog = ref(false)

const filters = ref({
  search: '',
  category_id: '',
  priority: '',
  assigned_to: '',
})

const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 10, 15, 20, 25, 50],
})

// New ticket form
const newTicket = ref({
  client_id: '',
  category_id: '',
  title: '',
  description: '',
  priority: 'medium',
})

// Options
const clientOptions = ref([])
const categoryOptions = ref([])

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
    label: t('tickets.ticketTitle'),
    align: 'left',
    field: 'title',
    sortable: true,
  },
  {
    name: 'client_name',
    label: t('tickets.client'),
    align: 'left',
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'category_name',
    label: t('tickets.category'),
    align: 'left',
    field: 'category_name',
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
    name: 'status',
    label: t('tickets.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'assigned_to_name',
    label: t('tickets.assignedTo'),
    align: 'left',
    field: 'assigned_to_name',
    sortable: true,
  },
  {
    name: 'comments_count',
    label: t('tickets.comments.title'),
    align: 'center',
    field: 'comments_count',
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
const fetchTickets = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...filters.value,
    }

    // Add status filter from props
    if (props.statusFilter.length > 0) {
      params.status = props.statusFilter.join(',')
    }

    const response = await TicketsApi.getTickets(params)
    tickets.value = response.data.tickets
    pagination.value.rowsNumber = response.data.pagination.total
  } catch (error) {
    console.error('Error fetching tickets:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await TicketsApi.getCategories()
    categoryOptions.value = response.data.categories.map((cat) => ({
      label: t(`tickets.categories.${cat.name}`),
      value: cat.id,
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
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
    // This would be a clients API call
    // const response = await ClientsApi.searchClients(val)
    // For now, mock data
    update(() => {
      clientOptions.value = [{ label: `Client ${val}`, value: 'client1' }]
    })
  } catch (error) {
    console.error('Error searching clients:', error)
  }
}

const createTicket = async () => {
  creating.value = true
  try {
    await TicketsApi.createTicket(newTicket.value)
    createTicketDialog.value = false
    newTicket.value = {
      client_id: '',
      category_id: '',
      title: '',
      description: '',
      priority: 'medium',
    }
    await fetchTickets()
    $q.notify({
      color: 'positive',
      message: t('tickets.createSuccess'),
      icon: 'check',
    })
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

const assignToMe = async (ticket) => {
  try {
    await TicketsApi.updateTicket(ticket.id, {
      assigned_to: authStore.user.id,
    })
    await fetchTickets()
    $q.notify({
      color: 'positive',
      message: t('tickets.assignSuccess'),
      icon: 'check',
    })
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
    await TicketsApi.updateTicket(ticket.id, {
      status: newStatus,
    })
    await fetchTickets()
    $q.notify({
      color: 'positive',
      message: t('tickets.updateSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error updating ticket status:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.updateError'),
      icon: 'error',
    })
  }
}

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

const getCategoryIcon = () => {
  return 'folder'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  await fetchTickets()
}

const onFilterChange = () => {
  pagination.value.page = 1
  fetchTickets()
}

// Watch for status filter changes
watch(
  () => props.statusFilter,
  () => {
    fetchTickets()
  },
  { immediate: true },
)

// Initial load
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
:deep(.q-table) thead tr {
  background: var(--q-primary);
}

:deep(.q-table) thead tr th {
  color: white !important;
  font-weight: 600 !important;
}

:deep(.q-table) tbody tr:hover {
  background: rgba(var(--q-primary), 0.1);
}
</style>
