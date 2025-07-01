<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner size="40px" color="primary" />
      <div class="q-mt-sm">{{ $t('common.loading') }}</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center q-py-md">
      <q-icon name="error" size="48px" color="negative" />
      <div class="q-mt-sm text-negative">{{ error }}</div>
      <q-btn color="primary" :label="$t('common.retry')" @click="loadRoom" class="q-mt-md" />
    </div>

    <!-- Room not found -->
    <div v-else-if="!room" class="text-center q-py-md">
      <q-icon name="forum" size="48px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">
        {{ $t('chat.management.roomNotFound') }}
      </div>
      <q-btn color="primary" :label="$t('common.back')" @click="goBack" class="q-mt-md" />
    </div>

    <!-- Room Details -->
    <template v-else>
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="col q-ml-sm">
          <div class="text-h5">
            <q-icon
              :name="room.room_type === 'ticket' ? 'confirmation_number' : 'support_agent'"
              class="q-mr-sm"
            />
            {{ getRoomTitle() }}
          </div>
          <div class="text-subtitle2 text-grey-7">
            {{ $t('chat.staff.client') }}: {{ room.client_name }} ({{ room.client_email }})
          </div>
        </div>
        <div class="col-auto">
          <q-chip
            :color="getStatusColor(room.room_status)"
            text-color="white"
            :label="$t(`chat.management.statuses.${room.room_status}`)"
            class="q-mr-sm"
          />
          <q-btn
            color="primary"
            icon="chat"
            :label="$t('chat.management.openFullChat')"
            @click="openFullChat"
          />
        </div>
      </div>

      <!-- Room Info Cards -->
      <div class="row q-gutter-md q-mb-md">
        <!-- Basic Info -->
        <div class="col-md-4 col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('chat.management.roomInfo') }}</div>

              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="person" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.staff.client') }}</q-item-label>
                    <q-item-label>{{ room.client_name }}</q-item-label>
                    <q-item-label caption>{{ room.client_email }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="info" :color="getStatusColor(room.room_status)" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.management.status') }}</q-item-label>
                    <q-item-label>
                      {{ $t(`chat.management.statuses.${room.room_status}`) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="category" color="secondary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.management.roomType') }}</q-item-label>
                    <q-item-label>
                      {{ $t(`chat.management.roomTypes.${room.room_type}`) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="room.ticket_number">
                  <q-item-section avatar>
                    <q-icon name="confirmation_number" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.staff.ticket') }}</q-item-label>
                    <q-item-label>#{{ room.ticket_number }}</q-item-label>
                    <q-item-label caption>{{ room.ticket_title }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="room.assigned_staff_name">
                  <q-item-section avatar>
                    <q-icon name="support_agent" color="green" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.staff.assignedTo') }}</q-item-label>
                    <q-item-label>{{ room.assigned_staff_name }}</q-item-label>
                    <q-item-label caption>{{ room.assigned_staff_email }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-else>
                  <q-item-section avatar>
                    <q-icon name="assignment_late" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.staff.assignedTo') }}</q-item-label>
                    <q-item-label class="text-orange">{{
                      $t('chat.management.unassigned')
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="schedule" color="grey-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.staff.created') }}</q-item-label>
                    <q-item-label>{{ formatDateTime(room.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="room.last_message_at">
                  <q-item-section avatar>
                    <q-icon name="chat" color="blue" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ $t('chat.staff.lastActivity') }}</q-item-label>
                    <q-item-label>{{ formatDateTime(room.last_message_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- Statistics -->
        <div class="col-md-4 col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('chat.management.statistics') }}</div>

              <div class="row q-gutter-md">
                <div class="col-5">
                  <q-card flat class="bg-blue-1 text-center q-pa-md">
                    <q-icon name="chat" size="24px" color="blue" />
                    <div class="text-h6 text-blue q-mt-xs">{{ room.total_messages || 0 }}</div>
                    <div class="text-caption text-blue-8">
                      {{ $t('chat.management.totalMessages') }}
                    </div>
                  </q-card>
                </div>

                <div class="col-5">
                  <q-card flat class="bg-red-1 text-center q-pa-md">
                    <q-icon name="mark_chat_unread" size="24px" color="red" />
                    <div class="text-h6 text-red q-mt-xs">
                      {{ room.unread_client_messages || 0 }}
                    </div>
                    <div class="text-caption text-red-8">
                      {{ $t('chat.management.unreadMessages') }}
                    </div>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick Actions -->
        <div class="col-md-4 col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('chat.management.quickActions') }}</div>

              <div class="column q-gutter-sm">
                <q-btn
                  color="primary"
                  icon="chat"
                  :label="$t('chat.management.openFullChat')"
                  @click="openFullChat"
                />

                <q-btn
                  v-if="!room.assigned_staff_id"
                  color="orange"
                  icon="person_add"
                  :label="$t('chat.management.assignToMe')"
                  @click="assignToMe"
                  :loading="assigning"
                />

                <q-btn
                  v-if="room.assigned_staff_id"
                  color="purple"
                  icon="swap_horiz"
                  :label="$t('chat.management.reassign')"
                  @click="showAssignDialog = true"
                />

                <q-btn
                  v-if="room.room_status === 'active'"
                  color="negative"
                  icon="close"
                  :label="$t('chat.management.closeChat')"
                  @click="showCloseDialog = true"
                />

                <q-btn
                  color="negative"
                  icon="delete"
                  :label="$t('chat.management.deleteChat')"
                  @click="showDeleteDialog = true"
                  outline
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Last Messages Preview -->
      <q-card flat bordered v-if="room.last_message">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('chat.management.lastMessage') }}</div>

          <div class="message-preview">
            <div class="row items-center q-mb-sm">
              <q-avatar
                :color="room.last_message.sender_type === 'client' ? 'primary' : 'secondary'"
                text-color="white"
                size="32px"
                :icon="room.last_message.sender_type === 'client' ? 'person' : 'support_agent'"
              />
              <div class="q-ml-sm">
                <div class="text-weight-medium">{{ room.last_message.sender_name }}</div>
                <div class="text-caption text-grey-6">
                  {{ formatDateTime(room.last_message.created_at) }}
                </div>
              </div>
            </div>

            <div class="message-text q-pa-md bg-grey-1 rounded-borders">
              {{ room.last_message.message_text }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>

    <!-- Assign Dialog -->
    <q-dialog v-model="showAssignDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.staff.reassignChat') }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="assignData.staff_id"
            :options="availableStaffOptions"
            :label="$t('chat.staff.selectStaff')"
            emit-value
            map-options
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showAssignDialog = false" />
          <q-btn
            color="primary"
            :label="$t('common.assign')"
            @click="assignChat"
            :loading="assigning"
            :disable="!assignData.staff_id"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Close Dialog -->
    <q-dialog v-model="showCloseDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.staff.closeChat') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="closeData.reason"
            :label="$t('chat.staff.closeReason')"
            type="textarea"
            outlined
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showCloseDialog = false" />
          <q-btn
            color="negative"
            :label="$t('common.close')"
            @click="closeChat"
            :loading="closing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.management.deleteChat') }}</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            {{ $t('chat.management.deleteWarning') }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showDeleteDialog = false" />
          <q-btn
            color="negative"
            :label="$t('common.delete')"
            @click="deleteChat"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Full Chat Dialog -->
    <q-dialog
      v-model="chatDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <staff-chat-dialog
        v-if="room"
        :room="room"
        @close="chatDialog = false"
        @room-updated="loadRoom"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { ChatApi } from 'src/api/chat'
import { date, Notify } from 'quasar'
import StaffChatDialog from 'components/chat/StaffChatDialog.vue'

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const room = ref(null)
const loading = ref(false)
const error = ref(null)
const showAssignDialog = ref(false)
const showCloseDialog = ref(false)
const showDeleteDialog = ref(false)
const chatDialog = ref(false)
const assigning = ref(false)
const closing = ref(false)
const deleting = ref(false)
const availableStaff = ref([])

const assignData = ref({
  staff_id: null,
})

const closeData = ref({
  reason: '',
})

// Computed
const availableStaffOptions = computed(() =>
  availableStaff.value.map((staff) => ({
    label: `${staff.name} (${staff.active_chats} активних)`,
    value: staff.id,
  })),
)

// Methods
const loadRoom = async () => {
  try {
    loading.value = true
    error.value = null

    const roomId = route.params.roomId
    const response = await ChatApi.getRoomsForStaff({
      room_id: roomId,
      limit: 1,
    })

    if (response.data.success && response.data.rooms.length > 0) {
      room.value = response.data.rooms[0]
    } else {
      error.value = $t('chat.management.roomNotFound')
    }
  } catch (err) {
    console.error('Error loading room:', err)
    if (err.response?.status === 404) {
      error.value = $t('chat.management.roomNotFound')
    } else {
      error.value = err.response?.data?.message || $t('chat.management.loadError')
    }
  } finally {
    loading.value = false
  }
}

const loadAvailableStaff = async () => {
  try {
    const response = await ChatApi.getAvailableStaff()
    if (response.data.success) {
      availableStaff.value = response.data.staff
    }
  } catch (error) {
    console.error('Error loading staff:', error)
  }
}

const openFullChat = () => {
  chatDialog.value = true
}

const assignToMe = async () => {
  try {
    assigning.value = true

    const response = await ChatApi.assignRoom(room.value.id, authStore.user.id)

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.staff.assignSuccess'),
      })

      await loadRoom()
    }
  } catch (error) {
    console.error('Error assigning chat:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.staff.assignError'),
    })
  } finally {
    assigning.value = false
  }
}

const assignChat = async () => {
  try {
    assigning.value = true

    const response = await ChatApi.assignRoom(room.value.id, assignData.value.staff_id)

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.staff.reassignSuccess'),
      })

      showAssignDialog.value = false
      await loadRoom()
    }
  } catch (error) {
    console.error('Error reassigning chat:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.staff.reassignError'),
    })
  } finally {
    assigning.value = false
  }
}

const closeChat = async () => {
  try {
    closing.value = true

    const response = await ChatApi.closeRoom(room.value.id)

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.staff.closeSuccess'),
      })

      showCloseDialog.value = false
      await loadRoom()
    }
  } catch (error) {
    console.error('Error closing chat:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.staff.closeError'),
    })
  } finally {
    closing.value = false
  }
}

const deleteChat = async () => {
  try {
    deleting.value = true

    const response = await ChatApi.deleteRoom(room.value.id)

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.management.deleteSuccess'),
      })

      // Redirect back to chat management
      router.push({ name: 'chat' })
    }
  } catch (error) {
    console.error('Error deleting chat:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.management.deleteError'),
    })
  } finally {
    deleting.value = false
    showDeleteDialog.value = false
  }
}

const goBack = () => {
  router.push({ name: 'chat' })
}

// Utility methods
const getRoomTitle = () => {
  if (room.value.room_type === 'ticket' && room.value.ticket_number) {
    return `${$t('chat.staff.ticket')} #${room.value.ticket_number}`
  }
  return $t('chat.staff.supportChat')
}

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    closed: 'grey',
    archived: 'purple',
  }
  return colors[status] || 'grey'
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadRoom()
  loadAvailableStaff()
})
</script>

<style scoped>
.message-preview {
  max-width: 100%;
}

.message-text {
  word-wrap: break-word;
  line-height: 1.5;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .message-text {
    font-size: 14px;
  }
}
</style>
