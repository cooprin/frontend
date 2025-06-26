<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner size="40px" color="primary" />
      <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center q-py-md">
      <q-icon name="error" size="48px" color="negative" />
      <div class="q-mt-sm text-negative">{{ error }}</div>
      <q-btn color="primary" :label="$t('common.retry')" @click="loadTicket" class="q-mt-md" />
    </div>

    <!-- Ticket not found -->
    <div v-else-if="!ticket" class="text-center q-py-md">
      <q-icon name="support_agent" size="48px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">
        {{ $t('portal.pages.tickets.notFound') }}
      </div>
      <q-btn color="primary" :label="$t('common.back')" @click="goBack" class="q-mt-md" />
    </div>

    <!-- Ticket Details -->
    <template v-else>
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="col q-ml-sm">
          <div class="text-h5">#{{ ticket.ticket_number }} - {{ ticket.title }}</div>
          <div class="text-subtitle2 text-grey-7">
            {{ $t('portal.pages.tickets.createdAt') }}: {{ formatDate(ticket.created_at) }}
          </div>
        </div>
        <div class="col-auto">
          <q-chip
            :color="getStatusColor(ticket.status)"
            text-color="white"
            :label="$t(`portal.pages.tickets.statuses.${ticket.status}`)"
            class="q-mr-sm"
          />
          <q-chip
            :color="getPriorityColor(ticket.priority)"
            text-color="white"
            :label="$t(`portal.pages.tickets.priorities.${ticket.priority}`)"
            outline
          />
        </div>
      </div>

      <div class="row q-gutter-md">
        <!-- Left Column - Ticket Info -->
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('portal.pages.tickets.information') }}</div>

              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="confirmation_number" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{
                      $t('portal.pages.tickets.ticketNumber')
                    }}</q-item-label>
                    <q-item-label>{{ ticket.ticket_number }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="priority_high" :color="getPriorityColor(ticket.priority)" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.priority') }}</q-item-label>
                    <q-item-label>
                      {{ $t(`portal.pages.tickets.priorities.${ticket.priority}`) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="info" :color="getStatusColor(ticket.status)" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.status') }}</q-item-label>
                    <q-item-label>
                      {{ $t(`portal.pages.tickets.statuses.${ticket.status}`) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="ticket.category_name">
                  <q-item-section avatar>
                    <q-icon name="category" color="secondary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.category') }}</q-item-label>
                    <q-item-label>
                      {{
                        ticket.category_name.startsWith('tickets.')
                          ? $t(ticket.category_name)
                          : ticket.category_name
                      }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="ticket.object_name">
                  <q-item-section avatar>
                    <q-icon name="directions_car" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.object') }}</q-item-label>
                    <q-item-label>{{ ticket.object_name }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="ticket.assigned_to_name">
                  <q-item-section avatar>
                    <q-icon name="person" color="purple" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.assignedTo') }}</q-item-label>
                    <q-item-label>{{ ticket.assigned_to_name }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="schedule" color="grey-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.createdAt') }}</q-item-label>
                    <q-item-label>{{ formatDateTime(ticket.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="ticket.resolved_at">
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.resolvedAt') }}</q-item-label>
                    <q-item-label>{{ formatDateTime(ticket.resolved_at) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="ticket.closed_at">
                  <q-item-section avatar>
                    <q-icon name="lock" color="grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('portal.pages.tickets.closedAt') }}</q-item-label>
                    <q-item-label>{{ formatDateTime(ticket.closed_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <!-- Description -->
            <q-card-section v-if="ticket.description">
              <div class="text-h6 q-mb-md">{{ $t('portal.pages.tickets.description') }}</div>
              <div class="text-body2 q-pa-md bg-grey-1 rounded-borders">
                {{ ticket.description }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column - Comments -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">
                  {{ $t('portal.pages.tickets.comments.title') }}
                  <q-chip
                    v-if="comments.length > 0"
                    :label="comments.length"
                    color="primary"
                    text-color="white"
                    size="sm"
                    class="q-ml-sm"
                  />
                </div>
                <q-btn
                  color="primary"
                  icon="add_comment"
                  :label="$t('portal.pages.tickets.comments.addComment')"
                  @click="showCommentDialog = true"
                />
              </div>
            </q-card-section>

            <!-- Comments List -->
            <q-scroll-area class="comments-area" style="height: 400px">
              <div class="q-pa-md">
                <div v-if="loadingComments" class="text-center q-py-md">
                  <q-spinner color="primary" size="2em" />
                </div>

                <div v-else-if="comments.length === 0" class="text-center q-py-xl">
                  <q-icon name="chat_bubble_outline" size="48px" color="grey-4" />
                  <div class="text-grey-6 q-mt-md">
                    {{ $t('portal.pages.tickets.comments.noComments') }}
                  </div>
                </div>

                <div v-else>
                  <div
                    v-for="comment in comments"
                    :key="comment.id"
                    class="comment-item q-mb-md"
                    :class="{ 'comment-mine': comment.created_by_type === 'client' }"
                  >
                    <div class="comment-header row items-center q-mb-xs">
                      <q-avatar
                        :color="comment.created_by_type === 'client' ? 'primary' : 'secondary'"
                        text-color="white"
                        size="32px"
                        :icon="comment.created_by_type === 'client' ? 'person' : 'support_agent'"
                      />
                      <div class="q-ml-sm">
                        <div class="text-weight-medium">
                          {{ comment.author_name || $t('portal.pages.tickets.comments.unknown') }}
                        </div>
                        <div class="text-caption text-grey-6">
                          {{ formatDateTime(comment.created_at) }}
                        </div>
                      </div>
                    </div>

                    <div class="comment-body q-ml-lg">
                      <div
                        class="comment-text q-pa-md rounded-borders"
                        :class="comment.created_by_type === 'client' ? 'bg-blue-1' : 'bg-grey-2'"
                      >
                        {{ comment.comment_text }}
                      </div>

                      <!-- Action buttons for own comments -->
                      <div
                        v-if="comment.created_by_type === 'client'"
                        class="comment-actions q-mt-xs text-right"
                      >
                        <q-btn
                          flat
                          dense
                          size="sm"
                          icon="edit"
                          color="primary"
                          :label="$t('common.edit')"
                          @click="editComment(comment)"
                          class="q-mr-xs"
                        />
                        <q-btn
                          flat
                          dense
                          size="sm"
                          icon="delete"
                          color="negative"
                          :label="$t('common.delete')"
                          @click="confirmDeleteComment(comment)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-scroll-area>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Add Comment Dialog -->
    <q-dialog v-model="showCommentDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('portal.pages.tickets.comments.addComment') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="addComment" ref="commentForm">
            <q-input
              v-model="newComment"
              type="textarea"
              :placeholder="$t('portal.pages.tickets.comments.placeholder')"
              outlined
              rows="4"
              counter
              maxlength="2000"
              :rules="[(val) => !!val?.trim() || $t('portal.pages.tickets.comments.required')]"
              autofocus
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="grey" @click="cancelComment" />
          <q-btn
            color="primary"
            :label="$t('portal.pages.tickets.comments.submit')"
            :loading="submittingComment"
            :disable="!newComment?.trim()"
            icon="send"
            @click="addComment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Edit Comment Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('portal.pages.tickets.comments.editComment') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="updateComment" ref="editCommentForm">
            <q-input
              v-model="editingComment.comment_text"
              type="textarea"
              :placeholder="$t('portal.pages.tickets.comments.placeholder')"
              outlined
              rows="4"
              counter
              maxlength="2000"
              :rules="[(val) => !!val?.trim() || $t('portal.pages.tickets.comments.required')]"
              autofocus
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="grey" @click="cancelEdit" />
          <q-btn
            color="primary"
            :label="$t('common.save')"
            :loading="updatingComment"
            :disable="!editingComment.comment_text?.trim()"
            icon="save"
            @click="updateComment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TicketsApi } from 'src/api/tickets'
import { date, Notify } from 'quasar'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()

// Reactive data
const ticket = ref(null)
const comments = ref([])
const loading = ref(false)
const loadingComments = ref(false)
const submittingComment = ref(false)
const error = ref(null)
const newComment = ref('')
const showCommentDialog = ref(false)
const commentForm = ref(null)

const showEditDialog = ref(false)
const editingComment = ref({})
const updatingComment = ref(false)
const editCommentForm = ref(null)

// Methods
const loadTicket = async () => {
  try {
    loading.value = true
    error.value = null

    const ticketId = route.params.id
    const response = await TicketsApi.getTicket(ticketId)

    if (response.data.success) {
      ticket.value = response.data.ticket
      await loadComments()
    } else {
      error.value = response.data.message || $t('portal.pages.tickets.loadError')
    }
  } catch (err) {
    console.error('Error loading ticket:', err)
    if (err.response?.status === 404) {
      error.value = $t('portal.pages.tickets.notFound')
    } else {
      error.value = err.response?.data?.message || $t('portal.pages.tickets.loadError')
    }
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  try {
    loadingComments.value = true

    const response = await TicketsApi.getComments(ticket.value.id)

    if (response.data.success) {
      comments.value = response.data.comments
    }
  } catch (error) {
    console.error('Error loading comments:', error)
    Notify.create({
      type: 'negative',
      message: $t('portal.pages.tickets.comments.loadError'),
    })
  } finally {
    loadingComments.value = false
  }
}

const addComment = async () => {
  if (!newComment.value?.trim()) return

  try {
    submittingComment.value = true

    const response = await TicketsApi.addComment(ticket.value.id, {
      comment_text: newComment.value.trim(),
    })

    if (response.data.success) {
      // Add new comment to list
      comments.value.push(response.data.comment)

      // Clear form and close dialog
      newComment.value = ''
      showCommentDialog.value = false

      // Reset form validation state
      if (commentForm.value) {
        commentForm.value.resetValidation()
      }

      Notify.create({
        type: 'positive',
        message: $t('portal.pages.tickets.comments.addSuccess'),
      })

      // Scroll to bottom of comments
      setTimeout(() => {
        const commentsArea = document.querySelector('.comments-area')
        if (commentsArea) {
          commentsArea.scrollTop = commentsArea.scrollHeight
        }
      }, 100)
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || $t('portal.pages.tickets.comments.addError'),
    })
  } finally {
    submittingComment.value = false
  }
}

const cancelComment = () => {
  newComment.value = ''
  showCommentDialog.value = false

  // Reset form validation state
  if (commentForm.value) {
    commentForm.value.resetValidation()
  }
}

const editComment = (comment) => {
  editingComment.value = { ...comment }
  showEditDialog.value = true
}

const updateComment = async () => {
  if (!editingComment.value.comment_text?.trim()) return

  try {
    updatingComment.value = true

    const response = await TicketsApi.updateComment(editingComment.value.id, {
      comment_text: editingComment.value.comment_text.trim(),
    })

    if (response.data.success) {
      // Update comment in list
      const index = comments.value.findIndex((c) => c.id === editingComment.value.id)
      if (index !== -1) {
        comments.value[index] = { ...comments.value[index], ...response.data.comment }
      }

      // Close dialog
      showEditDialog.value = false

      Notify.create({
        type: 'positive',
        message: $t('portal.pages.tickets.comments.updateSuccess'),
      })
    }
  } catch (error) {
    console.error('Error updating comment:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || $t('portal.pages.tickets.comments.updateError'),
    })
  } finally {
    updatingComment.value = false
  }
}

const cancelEdit = () => {
  editingComment.value = {}
  showEditDialog.value = false

  if (editCommentForm.value) {
    editCommentForm.value.resetValidation()
  }
}

const confirmDeleteComment = (comment) => {
  $q.dialog({
    title: $t('portal.pages.tickets.comments.deleteConfirm'),
    message: $t('portal.pages.tickets.comments.deleteMessage'),
    ok: {
      color: 'negative',
      label: $t('common.delete'),
    },
    cancel: {
      label: $t('common.cancel'),
    },
    persistent: true,
  }).onOk(() => {
    deleteComment(comment.id)
  })
}

const deleteComment = async (commentId) => {
  try {
    const response = await TicketsApi.deleteComment(commentId)

    if (response.data.success) {
      // Remove comment from list
      comments.value = comments.value.filter((c) => c.id !== commentId)

      Notify.create({
        type: 'positive',
        message: $t('portal.pages.tickets.comments.deleteSuccess'),
      })
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || $t('portal.pages.tickets.comments.deleteError'),
    })
  }
}

const goBack = () => {
  router.push({ name: 'portal-tickets' })
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

const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple',
  }
  return colors[priority] || 'grey'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadTicket()
})
</script>

<style scoped>
.comments-area {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.comment-item {
  position: relative;
}

.comment-mine .comment-text {
  background-color: #e3f2fd !important;
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
