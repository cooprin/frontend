<template>
  <q-card class="full-height">
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>
        <div class="row items-center">
          <q-icon name="confirmation_number" class="q-mr-sm" />
          <span v-if="ticket">{{ ticket.ticket_number }}</span>
          <q-skeleton v-else type="text" width="150px" />
        </div>
      </q-toolbar-title>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-toolbar>

    <div v-if="loading" class="q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md">{{ $t('common.loading') }}</div>
    </div>

    <div v-else-if="ticket" class="full-height">
      <q-splitter v-model="splitterModel" horizontal class="full-height">
        <!-- Ticket Info -->
        <template v-slot:before>
          <div class="q-pa-md">
            <!-- Header Info -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-sm">{{ ticket.title }}</div>

                    <div class="row q-col-gutter-sm q-mb-md">
                      <!-- Status -->
                      <div class="col-auto">
                        <q-select
                          v-model="editableTicket.status"
                          :options="statusOptions"
                          :label="$t('tickets.status')"
                          outlined
                          dense
                          emit-value
                          map-options
                          @update:model-value="updateTicketField('status', $event)"
                        />
                      </div>

                      <!-- Priority -->
                      <div class="col-auto">
                        <q-select
                          v-model="editableTicket.priority"
                          :options="priorityOptions"
                          :label="$t('tickets.priority')"
                          outlined
                          dense
                          emit-value
                          map-options
                          @update:model-value="updateTicketField('priority', $event)"
                        />
                      </div>

                      <!-- Assigned To -->
                      <div class="col-auto">
                        <q-select
                          v-model="editableTicket.assigned_to"
                          :options="staffOptions"
                          :label="$t('tickets.assignedTo')"
                          outlined
                          dense
                          emit-value
                          map-options
                          clearable
                          use-input
                          input-debounce="300"
                          @filter="filterStaff"
                          @update:model-value="updateTicketField('assigned_to', $event)"
                        >
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section avatar>
                                <q-avatar size="24px">
                                  <q-icon name="person" />
                                </q-avatar>
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{ scope.opt.label }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                    </div>

                    <!-- Info badges -->
                    <div class="row q-col-gutter-sm">
                      <div class="col-auto">
                        <q-chip
                          :color="getStatusColor(ticket.status)"
                          text-color="white"
                          icon="info"
                        >
                          {{ $t(`tickets.statuses.${ticket.status}`) }}
                        </q-chip>
                      </div>

                      <div class="col-auto">
                        <q-chip
                          :color="getPriorityColor(ticket.priority)"
                          text-color="white"
                          icon="priority_high"
                        >
                          {{ $t(`tickets.priorities.${ticket.priority}`) }}
                        </q-chip>
                      </div>

                      <div class="col-auto" v-if="ticket.category_name">
                        <q-chip color="blue-grey" text-color="white" icon="folder">
                          {{ ticket.category_name }}
                        </q-chip>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Client and Object Info -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.clientInfo') }}</div>
                    <div class="text-body1">{{ ticket.client_name }}</div>
                    <div class="text-caption text-grey">{{ ticket.client_email }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6" v-if="ticket.object_name">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.object') }}</div>
                    <div class="text-body1">{{ ticket.object_name }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Description -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.description') }}</div>
                <div class="text-body1 whitespace-pre-wrap">{{ ticket.description }}</div>
              </q-card-section>
            </q-card>

            <!-- Timestamps -->
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-4">
                <div class="text-caption text-grey">{{ $t('tickets.createdAt') }}</div>
                <div class="text-body2">{{ formatDate(ticket.created_at) }}</div>
              </div>

              <div class="col-12 col-md-4" v-if="ticket.resolved_at">
                <div class="text-caption text-grey">{{ $t('tickets.resolvedAt') }}</div>
                <div class="text-body2">{{ formatDate(ticket.resolved_at) }}</div>
              </div>

              <div class="col-12 col-md-4" v-if="ticket.closed_at">
                <div class="text-caption text-grey">{{ $t('tickets.closedAt') }}</div>
                <div class="text-body2">{{ formatDate(ticket.closed_at) }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Comments Section -->
        <template v-slot:after>
          <TicketComments :ticket-id="ticketId" @comment-added="onCommentAdded" />
        </template>
      </q-splitter>
    </div>

    <div v-else class="q-pa-lg text-center">
      <q-icon name="error" size="3em" color="negative" />
      <div class="q-mt-md text-h6">{{ $t('tickets.notFound') }}</div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { TicketsApi } from 'src/api/tickets'
import TicketComments from './TicketComments.vue'

const props = defineProps({
  ticketId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'ticket-updated'])

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// State
const loading = ref(false)
const ticket = ref(null)
const editableTicket = ref({})
const splitterModel = ref(60)
const staffOptions = ref([])
const allStaffOptions = ref([])

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

// Methods
const fetchTicket = async () => {
  loading.value = true
  try {
    const response = await TicketsApi.getTicket(props.ticketId)
    ticket.value = response.data.ticket
    editableTicket.value = {
      status: ticket.value.status,
      priority: ticket.value.priority,
      assigned_to: ticket.value.assigned_to,
    }
  } catch (error) {
    console.error('Error fetching ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.notFound'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const fetchStaff = async () => {
  try {
    // This would be a staff/users API call
    // For now, mock data
    allStaffOptions.value = [
      { label: 'John Doe', value: 'user1' },
      { label: 'Jane Smith', value: 'user2' },
      {
        label: authStore.user?.first_name + ' ' + authStore.user?.last_name,
        value: authStore.user?.id,
      },
    ]
    staffOptions.value = [...allStaffOptions.value]
  } catch (error) {
    console.error('Error fetching staff:', error)
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

const updateTicketField = async (field, value) => {
  try {
    const updateData = { [field]: value }
    await TicketsApi.updateTicket(props.ticketId, updateData)

    // Update local ticket data
    ticket.value[field] = value

    emit('ticket-updated')

    $q.notify({
      color: 'positive',
      message: t('tickets.updateSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error updating ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.updateError'),
      icon: 'error',
    })

    // Revert the change
    editableTicket.value[field] = ticket.value[field]
  }
}

const onCommentAdded = () => {
  // Could refresh ticket data if needed
  emit('ticket-updated')
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

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// Watch for ticket ID changes
watch(
  () => props.ticketId,
  () => {
    if (props.ticketId) {
      fetchTicket()
    }
  },
  { immediate: true },
)

// Initial load
onMounted(() => {
  fetchStaff()
})
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.full-height {
  height: 100vh;
}

:deep(.q-splitter__separator) {
  background: var(--q-primary);
}

:deep(.q-splitter__before),
:deep(.q-splitter__after) {
  overflow-y: auto;
}
</style>
