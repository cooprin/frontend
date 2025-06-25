<template>
  <div class="full-height column">
    <!-- Header -->
    <div class="q-pa-md bg-grey-1">
      <div class="text-h6">{{ $t('tickets.comments.title') }}</div>
    </div>

    <!-- Comments List -->
    <div class="col scroll">
      <div v-if="loading" class="q-pa-md text-center">
        <q-spinner color="primary" size="2em" />
      </div>

      <div v-else-if="comments.length === 0" class="q-pa-md text-center text-grey">
        <q-icon name="chat_bubble_outline" size="3em" />
        <div class="q-mt-md">{{ $t('tickets.comments.noComments') }}</div>
      </div>

      <div v-else class="q-pa-md">
        <div v-for="comment in comments" :key="comment.id" class="comment-item q-mb-md">
          <q-card
            flat
            bordered
            :class="{
              'bg-blue-1': comment.created_by_type === 'staff' && !comment.is_internal,
              'bg-orange-1': comment.created_by_type === 'staff' && comment.is_internal,
              'bg-green-1': comment.created_by_type === 'client',
            }"
          >
            <q-card-section>
              <!-- Comment Header -->
              <div class="row items-center q-mb-sm">
                <q-avatar size="32px" class="q-mr-sm">
                  <q-icon
                    :name="comment.created_by_type === 'client' ? 'person' : 'support_agent'"
                    :color="comment.created_by_type === 'client' ? 'green' : 'blue'"
                  />
                </q-avatar>

                <div class="col">
                  <div class="text-weight-bold">
                    {{ comment.author_name }}
                    <q-chip
                      v-if="comment.is_internal"
                      size="sm"
                      color="orange"
                      text-color="white"
                      :label="$t('tickets.comments.internal')"
                      class="q-ml-sm"
                    />
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatDate(comment.created_at) }}
                  </div>
                </div>

                <!-- Comment Actions -->
                <div class="q-gutter-xs">
                  <q-btn
                    v-if="canEditComment(comment)"
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    icon="edit"
                    @click="editComment(comment)"
                  >
                    <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="canDeleteComment(comment)"
                    flat
                    round
                    dense
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="deleteComment(comment)"
                  >
                    <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Comment Text -->
              <div class="text-body1 whitespace-pre-wrap">
                {{ comment.comment_text }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Add Comment Form -->
    <div class="q-pa-md bg-grey-1 border-top">
      <q-form @submit="addComment" class="column q-gutter-sm">
        <q-input
          v-model="newComment.text"
          :label="$t('tickets.comments.addComment')"
          outlined
          dense
          type="textarea"
          rows="3"
          :rules="[(val) => !!val?.trim() || $t('common.validation.required')]"
        />

        <div class="row items-center justify-between">
          <q-checkbox
            v-model="newComment.is_internal"
            :label="$t('tickets.comments.internal')"
            color="orange"
          />

          <div class="q-gutter-sm">
            <q-btn flat :label="$t('common.cancel')" @click="clearCommentForm" :disable="adding" />
            <q-btn
              color="primary"
              type="submit"
              :label="editingComment ? $t('common.update') : $t('tickets.comments.add')"
              :loading="adding"
              :disable="!newComment.text?.trim()"
            />
          </div>
        </div>
      </q-form>
    </div>

    <!-- Edit Comment Dialog -->
    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('tickets.comments.edit') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="updateComment" class="q-gutter-md">
            <q-input
              v-model="editingComment.comment_text"
              :label="$t('tickets.comments.text')"
              outlined
              dense
              type="textarea"
              rows="4"
              :rules="[(val) => !!val?.trim() || $t('common.validation.required')]"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="$t('common.cancel')" v-close-popup />
              <q-btn
                color="primary"
                type="submit"
                :label="$t('common.update')"
                :loading="updating"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { TicketsApi } from 'src/api/tickets'

const props = defineProps({
  ticketId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['comment-added'])

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// State
const loading = ref(false)
const adding = ref(false)
const updating = ref(false)
const comments = ref([])
const editDialog = ref(false)

const newComment = ref({
  text: '',
  is_internal: false,
})

const editingComment = ref(null)

// Methods
const fetchComments = async () => {
  loading.value = true
  try {
    const response = await TicketsApi.getComments(props.ticketId)
    comments.value = response.data.comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const addComment = async () => {
  if (!newComment.value.text?.trim()) return

  adding.value = true
  try {
    const commentData = {
      comment_text: newComment.value.text.trim(),
      is_internal: newComment.value.is_internal,
    }

    await TicketsApi.addComment(props.ticketId, commentData)

    clearCommentForm()
    await fetchComments()
    emit('comment-added')

    $q.notify({
      color: 'positive',
      message: t('tickets.comments.addSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.comments.addError'),
      icon: 'error',
    })
  } finally {
    adding.value = false
  }
}

const editComment = (comment) => {
  editingComment.value = { ...comment }
  editDialog.value = true
}

const updateComment = async () => {
  if (!editingComment.value?.comment_text?.trim()) return

  updating.value = true
  try {
    await TicketsApi.updateComment(editingComment.value.id, {
      comment_text: editingComment.value.comment_text.trim(),
    })

    editDialog.value = false
    editingComment.value = null
    await fetchComments()

    $q.notify({
      color: 'positive',
      message: t('tickets.comments.updateSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.comments.updateError'),
      icon: 'error',
    })
  } finally {
    updating.value = false
  }
}

const deleteComment = (comment) => {
  $q.dialog({
    title: t('tickets.comments.deleteConfirm'),
    message: t('tickets.comments.deleteMessage'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await TicketsApi.deleteComment(comment.id)
      await fetchComments()

      $q.notify({
        color: 'positive',
        message: t('tickets.comments.deleteSuccess'),
        icon: 'check',
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      $q.notify({
        color: 'negative',
        message: t('tickets.comments.deleteError'),
        icon: 'error',
      })
    }
  })
}

const clearCommentForm = () => {
  newComment.value = {
    text: '',
    is_internal: false,
  }
}

// Permission methods
const canEditComment = (comment) => {
  // Staff can edit their own comments, clients can edit their own comments
  if (authStore.userType === 'staff') {
    return comment.created_by_type === 'staff' && comment.created_by === authStore.user?.id
  }
  return comment.created_by_type === 'client' && comment.created_by === authStore.user?.clientId
}

const canDeleteComment = (comment) => {
  // Only staff can delete comments, and only their own
  return (
    authStore.userType === 'staff' &&
    comment.created_by_type === 'staff' &&
    comment.created_by === authStore.user?.id
  )
}

// Utility methods
const formatDate = (date) => {
  const now = new Date()
  const commentDate = new Date(date)
  const diffInHours = (now - commentDate) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60))
    return diffInMinutes <= 1
      ? t('common.justNow')
      : t('common.minutesAgo', { count: diffInMinutes })
  } else if (diffInHours < 24) {
    return t('common.hoursAgo', { count: Math.floor(diffInHours) })
  } else {
    return commentDate.toLocaleString()
  }
}

// Initial load
onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.full-height {
  height: 100%;
}

.scroll {
  overflow-y: auto;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark .border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.comment-item {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Comment colors */
.bg-blue-1 {
  background-color: #e3f2fd;
}

.bg-orange-1 {
  background-color: #fff3e0;
}

.bg-green-1 {
  background-color: #e8f5e8;
}

.body--dark .bg-blue-1 {
  background-color: rgba(33, 150, 243, 0.1);
}

.body--dark .bg-orange-1 {
  background-color: rgba(255, 152, 0, 0.1);
}

.body--dark .bg-green-1 {
  background-color: rgba(76, 175, 80, 0.1);
}
</style>
