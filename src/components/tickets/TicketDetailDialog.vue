<template>
  <q-card class="ticket-detail-dialog">
    <!-- Header -->
    <q-card-section class="row items-center q-pb-none bg-primary text-white">
      <div class="col">
        <div class="text-h6" v-if="ticket">#{{ ticket.ticket_number }} - {{ ticket.title }}</div>
        <div class="text-subtitle2" v-if="ticket">
          {{ $t('tickets.createdAt') }}: {{ formatDateTime(ticket.created_at) }}
        </div>
      </div>
      <q-btn flat round dense icon="close" color="white" @click="closeDialog" />
    </q-card-section>

    <!-- Loading -->
    <div v-if="loading" class="q-pa-lg text-center">
      <q-spinner size="40px" color="primary" />
      <div class="q-mt-sm">{{ $t('common.loading') }}</div>
    </div>

    <!-- Content -->
    <div v-else-if="ticket" class="row no-wrap" style="height: 70vh">
      <!-- Left Panel - Ticket Info -->
      <div class="col-4 q-pa-md" style="border-right: 1px solid #e0e0e0">
        <q-scroll-area style="height: 100%">
          <!-- Status & Priority -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.status') }}</div>
            <q-select
              v-model="editableTicket.status"
              :options="statusOptions"
              emit-value
              map-options
              outlined
              dense
              @update:model-value="updateTicketField('status', $event)"
            >
              <template v-slot:selected-item="{ opt }">
                <q-chip
                  :color="getStatusColor(opt.value)"
                  text-color="white"
                  :icon="getStatusIcon(opt.value)"
                  dense
                >
                  {{ opt.label }}
                </q-chip>
              </template>
            </q-select>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.priority') }}</div>
            <q-select
              v-model="editableTicket.priority"
              :options="priorityOptions"
              emit-value
              map-options
              outlined
              dense
              @update:model-value="updateTicketField('priority', $event)"
            >
              <template v-slot:selected-item="{ opt }">
                <q-chip
                  :color="getPriorityColor(opt.value)"
                  text-color="white"
                  :icon="getPriorityIcon(opt.value)"
                  dense
                >
                  {{ opt.label }}
                </q-chip>
              </template>
            </q-select>
          </div>

          <!-- Assigned To -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.assignedTo') }}</div>
            <q-select
              v-model="editableTicket.assigned_to"
              :options="staffOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              clearable
              use-input
              input-debounce="300"
              @filter="filterStaff"
              @update:model-value="updateTicketField('assigned_to', $event)"
            >
              <template v-slot:option="{ opt, itemProps }">
                <q-item v-bind="itemProps">
                  <q-item-section avatar>
                    <q-avatar size="24px">
                      <q-icon name="person" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Ticket Details -->
          <q-separator class="q-my-md" />

          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.client') }}</div>
            <div class="row items-center">
              <q-avatar size="24px" class="q-mr-sm">
                <q-icon name="person" />
              </q-avatar>
              <div>{{ ticket.client_name }}</div>
            </div>
          </div>

          <div class="q-mb-md" v-if="ticket.category_name">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.category') }}</div>
            <q-chip :color="ticket.category_color" text-color="white" dense>
              {{ ticket.category_name }}
            </q-chip>
          </div>

          <div class="q-mb-md" v-if="ticket.object_name">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.object') }}</div>
            <q-chip color="orange" text-color="white" icon="directions_car" dense>
              {{ ticket.object_name }}
            </q-chip>
          </div>

          <!-- Timestamps -->
          <q-separator class="q-my-md" />

          <div class="q-mb-sm">
            <div class="text-caption text-grey-6">{{ $t('tickets.createdAt') }}</div>
            <div>{{ formatDateTime(ticket.created_at) }}</div>
          </div>

          <div class="q-mb-sm" v-if="ticket.resolved_at">
            <div class="text-caption text-grey-6">{{ $t('tickets.resolvedAt') }}</div>
            <div>{{ formatDateTime(ticket.resolved_at) }}</div>
          </div>

          <div class="q-mb-sm" v-if="ticket.closed_at">
            <div class="text-caption text-grey-6">{{ $t('tickets.closedAt') }}</div>
            <div>{{ formatDateTime(ticket.closed_at) }}</div>
          </div>

          <!-- Description -->
          <q-separator class="q-my-md" />

          <div v-if="ticket.description">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.description') }}</div>
            <div class="text-body2 q-pa-md bg-grey-1 rounded-borders">
              {{ ticket.description }}
            </div>
          </div>
        </q-scroll-area>
      </div>

      <!-- Right Panel - Comments -->
      <div class="col-8 column">
        <!-- Comments Header -->
        <div class="q-pa-md" style="border-bottom: 1px solid #e0e0e0">
          <div class="row items-center justify-between">
            <div class="text-h6">
              {{ $t('tickets.comments.title') }}
              <q-chip
                v-if="comments.length > 0"
                :label="comments.length"
                color="primary"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>
            <div class="row q-gutter-sm">
              <q-btn-toggle
                v-model="showInternalComments"
                :options="[
                  { label: $t('tickets.comments.public'), value: false },
                  { label: $t('tickets.comments.all'), value: true },
                ]"
                color="primary"
                size="sm"
              />
              <q-btn
                color="primary"
                icon="add_comment"
                :label="$t('tickets.comments.addComment')"
                @click="showCommentDialog = true"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <q-scroll-area class="col comments-area">
          <div class="q-pa-md">
            <div v-if="loadingComments" class="text-center q-py-md">
              <q-spinner color="primary" size="2em" />
            </div>

            <div v-else-if="filteredComments.length === 0" class="text-center q-py-xl">
              <q-icon name="chat_bubble_outline" size="48px" color="grey-4" />
              <div class="text-grey-6 q-mt-md">
                {{ $t('tickets.comments.noComments') }}
              </div>
            </div>

            <div v-else>
              <div
                v-for="comment in filteredComments"
                :key="comment.id"
                class="comment-item q-mb-md"
                :class="{
                  'comment-mine': comment.created_by_type === 'staff',
                  'comment-internal': comment.is_internal,
                }"
              >
                <div class="comment-header row items-center q-mb-xs">
                  <q-avatar
                    :color="comment.created_by_type === 'client' ? 'primary' : 'secondary'"
                    text-color="white"
                    size="32px"
                    :icon="comment.created_by_type === 'client' ? 'person' : 'support_agent'"
                  />
                  <div class="q-ml-sm">
                    <div class="row items-center q-gutter-sm">
                      <div class="text-weight-medium">
                        {{ comment.author_name || $t('tickets.comments.unknown') }}
                      </div>
                      <q-chip
                        v-if="comment.is_internal"
                        color="orange"
                        text-color="white"
                        size="xs"
                        :label="$t('tickets.comments.internal')"
                        dense
                      />
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ formatDateTime(comment.created_at) }}
                    </div>
                  </div>
                  <q-space />
                  <q-btn
                    v-if="comment.created_by_type === 'staff'"
                    flat
                    round
                    dense
                    size="sm"
                    icon="more_vert"
                  >
                    <q-menu>
                      <q-list>
                        <q-item clickable @click="editComment(comment)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>{{ $t('common.edit') }}</q-item-section>
                        </q-item>
                        <q-item clickable @click="deleteComment(comment)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>{{ $t('common.delete') }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>

                <div class="comment-body q-ml-lg">
                  <div
                    class="comment-text q-pa-md rounded-borders"
                    :class="{
                      'bg-blue-1': comment.created_by_type === 'client',
                      'bg-grey-2': comment.created_by_type === 'staff' && !comment.is_internal,
                      'bg-orange-1': comment.is_internal,
                    }"
                  >
                    {{ comment.comment_text }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </div>
    </div>

    <!-- Add Comment Dialog -->
    <q-dialog v-model="showCommentDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('tickets.comments.addComment') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="addComment" ref="commentForm">
            <q-input
              v-model="newComment.text"
              type="textarea"
              :placeholder="$t('tickets.comments.placeholder')"
              outlined
              rows="4"
              counter
              maxlength="2000"
              :rules="[(val) => !!val?.trim() || $t('tickets.comments.required')]"
              autofocus
            />

            <q-checkbox
              v-model="newComment.isInternal"
              :label="$t('tickets.comments.markAsInternal')"
              color="orange"
              class="q-mt-md"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="grey" @click="cancelComment" />
          <q-btn
            color="primary"
            :label="$t('tickets.comments.submit')"
            :loading="submittingComment"
            :disable="!newComment.text?.trim()"
            icon="send"
            @click="addComment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { TicketsApi } from 'src/api/tickets'
import { date } from 'quasar'

const props = defineProps({
  ticketId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'ticket-updated'])

const { t } = useI18n()
const $q = useQuasar()

// State
const ticket = ref(null)
const editableTicket = ref({})
const comments = ref([])
const loading = ref(false)
const loadingComments = ref(false)
const submittingComment = ref(false)
const showCommentDialog = ref(false)
const showInternalComments = ref(true)
const commentForm = ref(null)

// Form data
const newComment = ref({
  text: '',
  isInternal: false,
})

// Options
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

const filteredComments = computed(() => {
  if (showInternalComments.value) {
    return comments.value
  }
  return comments.value.filter((comment) => !comment.is_internal)
})

// Methods
const loadTicket = async () => {
  loading.value = true
  try {
    const response = await TicketsApi.getTicket(props.ticketId)
    if (response.data.success) {
      ticket.value = response.data.ticket
      editableTicket.value = { ...response.data.ticket }
      await loadComments()
    }
  } catch (error) {
    console.error('Error loading ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.loadError'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  loadingComments.value = true
  try {
    const response = await TicketsApi.getComments(props.ticketId)
    if (response.data.success) {
      comments.value = response.data.comments
    }
  } catch (error) {
    console.error('Error loading comments:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.comments.loadError'),
      icon: 'error',
    })
  } finally {
    loadingComments.value = false
  }
}

const updateTicketField = async (field, value) => {
  try {
    const updateData = { [field]: value }

    // Handle resolved/closed status
    if (field === 'status') {
      if (value === 'resolved') {
        updateData.resolved_at = new Date().toISOString()
      } else if (value === 'closed') {
        updateData.closed_at = new Date().toISOString()
      }
    }

    const response = await TicketsApi.updateTicket(props.ticketId, updateData)

    if (response.data.success) {
      ticket.value = { ...ticket.value, ...response.data.ticket }
      editableTicket.value = { ...editableTicket.value, ...response.data.ticket }

      $q.notify({
        color: 'positive',
        message: t('tickets.updateSuccess'),
        icon: 'check',
      })

      emit('ticket-updated')
    }
  } catch (error) {
    console.error('Error updating ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.updateError'),
      icon: 'error',
    })

    // Revert changes
    editableTicket.value[field] = ticket.value[field]
  }
}

const addComment = async () => {
  if (!newComment.value.text?.trim()) return

  try {
    submittingComment.value = true

    const response = await TicketsApi.addComment(props.ticketId, {
      comment_text: newComment.value.text.trim(),
      is_internal: newComment.value.isInternal,
    })

    if (response.data.success) {
      comments.value.push(response.data.comment)
      newComment.value = { text: '', isInternal: false }
      showCommentDialog.value = false

      if (commentForm.value) {
        commentForm.value.resetValidation()
      }

      $q.notify({
        color: 'positive',
        message: t('tickets.comments.addSuccess'),
        icon: 'check',
      })

      // Scroll to bottom
      setTimeout(() => {
        const commentsArea = document.querySelector('.comments-area')
        if (commentsArea) {
          commentsArea.scrollTop = commentsArea.scrollHeight
        }
      }, 100)
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.comments.addError'),
      icon: 'error',
    })
  } finally {
    submittingComment.value = false
  }
}

const cancelComment = () => {
  newComment.value = { text: '', isInternal: false }
  showCommentDialog.value = false
  if (commentForm.value) {
    commentForm.value.resetValidation()
  }
}

const editComment = () => {
  // TODO: Implement edit comment
  $q.notify({
    color: 'info',
    message: 'Edit comment functionality coming soon',
    icon: 'info',
  })
}

const deleteComment = async (comment) => {
  try {
    await $q.dialog({
      title: t('common.confirmDelete'),
      message: t('tickets.comments.deleteConfirm'),
      cancel: true,
      persistent: true,
    })

    await TicketsApi.deleteComment(comment.id)

    comments.value = comments.value.filter((c) => c.id !== comment.id)

    $q.notify({
      color: 'positive',
      message: t('tickets.comments.deleteSuccess'),
      icon: 'check',
    })
  } catch (error) {
    if (error !== false) {
      // User didn't cancel
      console.error('Error deleting comment:', error)
      $q.notify({
        color: 'negative',
        message: t('tickets.comments.deleteError'),
        icon: 'error',
      })
    }
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

const closeDialog = () => {
  emit('close')
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

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadTicket()
  loadStaff()
})

// Watch for ticket ID changes
watch(
  () => props.ticketId,
  () => {
    if (props.ticketId) {
      loadTicket()
    }
  },
)
</script>

<style scoped>
.ticket-detail-dialog {
  width: 95vw;
  height: 85vh;
  max-width: none;
  max-height: none;
}

.comments-area {
  border-top: 1px solid #e0e0e0;
}

.comment-item {
  position: relative;
}

.comment-mine .comment-text {
  background-color: #e3f2fd !important;
}

.comment-internal .comment-text {
  background-color: #fff3e0 !important;
  border-left: 4px solid #ff9800;
}

.comment-text {
  max-width: 100%;
  word-wrap: break-word;
  line-height: 1.5;
}

.comment-header {
  margin-bottom: 8px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .comment-text {
    font-size: 14px;
  }

  .comment-body {
    margin-left: 40px !important;
  }
}
</style>
