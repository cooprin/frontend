<template>
  <q-card class="staff-chat-dialog full-height">
    <!-- Header -->
    <q-card-section class="bg-primary text-white q-pa-md">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6">
            <q-icon
              :name="room.room_type === 'ticket' ? 'confirmation_number' : 'support_agent'"
              class="q-mr-sm"
            />
            {{ getRoomTitle() }}
          </div>
          <div class="text-caption">
            {{ $t('chat.staff.client') }}: {{ room.client_name }} ({{ room.client_email }})
          </div>
          <div v-if="room.ticket_number" class="text-caption">
            {{ $t('chat.staff.ticket') }}: #{{ room.ticket_number }} - {{ room.ticket_title }}
          </div>
        </div>

        <div class="col-auto">
          <q-btn flat round icon="more_vert" @click="showRoomActions = true">
            <q-menu v-model="showRoomActions">
              <q-list style="min-width: 200px">
                <q-item clickable @click="refreshMessages">
                  <q-item-section avatar>
                    <q-icon name="refresh" />
                  </q-item-section>
                  <q-item-section>{{ $t('common.refresh') }}</q-item-section>
                </q-item>

                <q-separator />

                <q-item v-if="!room.assigned_staff_id" clickable @click="showAssignDialog = true">
                  <q-item-section avatar>
                    <q-icon name="person_add" />
                  </q-item-section>
                  <q-item-section>{{ $t('chat.staff.assignToMe') }}</q-item-section>
                </q-item>

                <q-item v-if="room.assigned_staff_id" clickable @click="showReassignDialog = true">
                  <q-item-section avatar>
                    <q-icon name="swap_horiz" />
                  </q-item-section>
                  <q-item-section>{{ $t('chat.staff.reassign') }}</q-item-section>
                </q-item>

                <q-item v-if="room.room_type === 'support'" clickable @click="convertToTicket">
                  <q-item-section avatar>
                    <q-icon name="confirmation_number" />
                  </q-item-section>
                  <q-item-section>{{ $t('chat.staff.convertToTicket') }}</q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  v-if="room.room_status === 'active'"
                  clickable
                  @click="showCloseDialog = true"
                >
                  <q-item-section avatar>
                    <q-icon name="close" color="negative" />
                  </q-item-section>
                  <q-item-section>{{ $t('chat.staff.closeChat') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat round icon="close" @click="$emit('close')" />
        </div>
      </div>
    </q-card-section>

    <!-- Room Info -->
    <q-card-section class="bg-grey-1 q-py-sm">
      <div class="row items-center q-gutter-md">
        <div class="col-auto">
          <q-chip
            :color="room.room_status === 'active' ? 'green' : 'grey'"
            text-color="white"
            size="sm"
            :label="$t(`chat.management.statuses.${room.room_status}`)"
          />
        </div>

        <div class="col-auto" v-if="room.assigned_staff_name">
          <div class="text-caption text-grey-7">{{ $t('chat.staff.assignedTo') }}:</div>
          <div class="text-weight-medium">{{ room.assigned_staff_name }}</div>
        </div>

        <div class="col-auto" v-else>
          <div class="text-orange text-weight-medium">{{ $t('chat.management.unassigned') }}</div>
        </div>

        <div class="col-auto">
          <div class="text-caption text-grey-7">{{ $t('chat.staff.created') }}:</div>
          <div>{{ formatDateTime(room.created_at) }}</div>
        </div>

        <div class="col-auto" v-if="room.last_message_at">
          <div class="text-caption text-grey-7">{{ $t('chat.staff.lastActivity') }}:</div>
          <div>{{ formatDateTime(room.last_message_at) }}</div>
        </div>
      </div>
    </q-card-section>

    <!-- Messages Area -->
    <q-scroll-area ref="messagesScroll" class="col chat-messages-area" @scroll="onScroll">
      <div class="q-pa-md">
        <!-- Loading more messages -->
        <div v-if="loadingMessages" class="text-center q-py-md">
          <q-spinner size="24px" color="primary" />
        </div>

        <!-- Messages -->
        <div
          v-for="(message, msgIndex) in messages"
          :key="message.id"
          class="message-container"
          :class="{ 'message-staff': message.sender_type === 'staff' }"
        >
          <!-- Date separator -->
          <div v-if="shouldShowDateSeparator(msgIndex)" class="text-center q-py-sm">
            <q-chip
              size="sm"
              color="grey-4"
              text-color="grey-8"
              :label="formatMessageDate(message.created_at)"
            />
          </div>

          <!-- Message bubble -->
          <div class="message-bubble-container">
            <div
              class="message-bubble"
              :class="{
                'message-bubble-staff': message.sender_type === 'staff',
                'message-bubble-client': message.sender_type === 'client',
              }"
            >
              <!-- Sender name -->
              <div class="message-sender text-caption text-weight-medium q-mb-xs">
                <q-icon
                  :name="message.sender_type === 'staff' ? 'support_agent' : 'person'"
                  size="14px"
                  class="q-mr-xs"
                />
                {{ message.sender_name }}
                <span v-if="message.sender_type === 'staff'" class="text-grey-6 q-ml-xs">
                  ({{ $t('chat.staff.staff') }})
                </span>
              </div>

              <!-- Message text -->
              <div class="message-text">
                {{ message.message_text }}
              </div>

              <!-- Message time and status -->
              <div class="message-time text-caption text-grey-6 q-mt-xs row items-center">
                <span>{{ formatMessageTime(message.created_at) }}</span>
                <q-space />
                <div v-if="message.sender_type === 'client'" class="message-status">
                  <q-icon
                    :name="message.is_read ? 'done_all' : 'done'"
                    size="14px"
                    :color="message.is_read ? 'blue' : 'grey'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty messages state -->
        <div v-if="!loadingMessages && messages.length === 0" class="text-center q-py-xl">
          <q-icon name="chat_bubble_outline" size="64px" color="grey-4" />
          <div class="text-grey-6 q-mt-md">
            {{ $t('chat.staff.noMessages') }}
          </div>
        </div>
      </div>
    </q-scroll-area>

    <!-- Message Input -->
    <q-card-section
      v-if="room.room_status === 'active'"
      class="chat-input-section q-pa-md bg-white"
    >
      <div class="row q-gutter-sm">
        <!-- Message input -->
        <div class="col">
          <q-input
            v-model="newMessage"
            :placeholder="$t('chat.staff.typeMessage')"
            outlined
            dense
            autogrow
            :max-height="100"
            @keydown.enter.prevent="sendMessage"
            :disable="sendingMessage"
          />
        </div>

        <!-- Send button -->
        <div class="col-auto">
          <q-btn
            round
            color="primary"
            icon="send"
            @click="sendMessage"
            :disable="!newMessage.trim() || sendingMessage"
            :loading="sendingMessage"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Closed chat notice -->
    <q-card-section v-else class="bg-grey-3 text-center q-py-md">
      <q-icon name="lock" size="24px" color="grey-6" />
      <div class="text-grey-7 q-mt-sm">
        {{ $t('chat.staff.chatClosed') }}
        <span v-if="room.closed_at">
          {{ formatDateTime(room.closed_at) }}
        </span>
      </div>
    </q-card-section>

    <!-- Assign Dialog -->
    <q-dialog v-model="showAssignDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.staff.assignChat') }}</div>
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

    <!-- Reassign Dialog -->
    <q-dialog v-model="showReassignDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.staff.reassignChat') }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="reassignData.staff_id"
            :options="availableStaffOptions"
            :label="$t('chat.staff.selectStaff')"
            emit-value
            map-options
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showReassignDialog = false" />
          <q-btn
            color="primary"
            :label="$t('common.reassign')"
            @click="reassignChat"
            :loading="reassigning"
            :disable="!reassignData.staff_id"
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
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { date, Notify } from 'quasar'
import { ChatApi } from 'src/api/chat'
import SocketService from 'src/services/socketService'

const { t: $t } = useI18n()
const authStore = useAuthStore()

// Props
const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
})

// Emits
const emit = defineEmits(['close', 'room-updated'])

// Reactive data
const messages = ref([])
const newMessage = ref('')
const loadingMessages = ref(false)
const sendingMessage = ref(false)
const showRoomActions = ref(false)
const showAssignDialog = ref(false)
const showReassignDialog = ref(false)
const showCloseDialog = ref(false)
const assigning = ref(false)
const reassigning = ref(false)
const closing = ref(false)
const availableStaff = ref([])

const assignData = ref({
  staff_id: authStore.user?.id || null,
})

const reassignData = ref({
  staff_id: null,
})

const closeData = ref({
  reason: '',
})

// Refs
const messagesScroll = ref(null)

// Component ID для відписки від подій
const componentId = 'staff-chat-dialog-' + Date.now()

// Computed
const availableStaffOptions = computed(() =>
  availableStaff.value.map((staff) => ({
    label: `${staff.name} (${staff.active_chats} активних)`,
    value: staff.id,
  })),
)

// Methods
const loadMessages = async (loadMore = false) => {
  try {
    loadingMessages.value = true

    const params = {
      page: loadMore ? Math.ceil(messages.value.length / 20) + 1 : 1,
      limit: 20,
    }

    const response = await ChatApi.getMessages(props.room.id, params)

    if (response.data.success) {
      if (loadMore) {
        messages.value = [...response.data.messages, ...messages.value]
      } else {
        messages.value = response.data.messages
        await nextTick()
        scrollToBottom()
      }
    }
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    loadingMessages.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  try {
    sendingMessage.value = true

    const messageData = {
      message_text: newMessage.value.trim(),
    }

    const response = await ChatApi.sendMessage(props.room.id, messageData)

    if (response.data.success) {
      // Повідомлення додасться через Socket.io подію
      newMessage.value = ''
      scrollToBottom()

      await ChatApi.markAsRead(props.room.id)
    }
  } catch (error) {
    console.error('Error sending message:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.staff.sendError'),
    })
  } finally {
    sendingMessage.value = false
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

const assignChat = async () => {
  try {
    assigning.value = true

    const response = await ChatApi.assignRoom(props.room.id, assignData.value.staff_id)

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.staff.assignSuccess'),
      })

      showAssignDialog.value = false
      emit('room-updated')
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

const reassignChat = async () => {
  try {
    reassigning.value = true

    const response = await ChatApi.assignRoom(props.room.id, reassignData.value.staff_id)

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.staff.reassignSuccess'),
      })

      showReassignDialog.value = false
      emit('room-updated')
    }
  } catch (error) {
    console.error('Error reassigning chat:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.staff.reassignError'),
    })
  } finally {
    reassigning.value = false
  }
}

const closeChat = async () => {
  try {
    closing.value = true

    const response = await ChatApi.closeRoom(props.room.id)

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.staff.closeSuccess'),
      })

      showCloseDialog.value = false
      emit('room-updated')
      emit('close')
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

const convertToTicket = () => {
  console.log('Convert to ticket:', props.room)
}

const refreshMessages = () => {
  loadMessages()
}

const scrollToBottom = () => {
  if (messagesScroll.value) {
    nextTick(() => {
      const scrollArea = messagesScroll.value
      const scrollTarget = scrollArea.getScrollTarget()
      scrollArea.setScrollPosition('vertical', scrollTarget.scrollHeight, 300)
    })
  }
}

const onScroll = (info) => {
  if (info.verticalPercentage === 0 && messages.value.length >= 20 && !loadingMessages.value) {
    loadMessages(true)
  }
}

// Socket.io event handlers через SocketService
const handleNewMessage = (data) => {
  if (data.room_id === props.room.id) {
    const existingMessage = messages.value.find((m) => m.id === data.message.id)
    if (!existingMessage) {
      messages.value.push(data.message)
      nextTick(() => {
        scrollToBottom()
      })
    }
  }
}

const handleUserTyping = (data) => {
  console.log(`${data.userName} is typing...`)
}

const handleUserStoppedTyping = (data) => {
  console.log(`${data.userName} stopped typing`)
}

// Utility methods
const getRoomTitle = () => {
  if (props.room.room_type === 'ticket' && props.room.ticket_number) {
    return `${$t('chat.staff.ticket')} #${props.room.ticket_number}`
  }
  return $t('chat.staff.supportChat')
}

const formatDateTime = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const formatMessageDate = (dateString) => {
  const messageDate = new Date(dateString)
  const today = new Date()

  if (date.isSameDate(messageDate, today, 'day')) {
    return $t('common.today')
  } else {
    return date.formatDate(messageDate, 'DD MMMM YYYY')
  }
}

const formatMessageTime = (dateString) => {
  return date.formatDate(dateString, 'HH:mm')
}

const shouldShowDateSeparator = (messageIndex) => {
  if (messageIndex === 0) return true

  const currentMessage = messages.value[messageIndex]
  const previousMessage = messages.value[messageIndex - 1]

  const currentDate = new Date(currentMessage.created_at)
  const previousDate = new Date(previousMessage.created_at)

  return !date.isSameDate(currentDate, previousDate, 'day')
}

// Lifecycle
onMounted(() => {
  loadMessages()
  loadAvailableStaff()

  // Підписуємося на Socket.io події через SocketService
  SocketService.subscribe('chat:new_message', handleNewMessage, componentId)
  SocketService.subscribe('chat:user_typing', handleUserTyping, componentId)
  SocketService.subscribe('chat:user_stopped_typing', handleUserStoppedTyping, componentId)

  // Приєднуємося до кімнати чату
  SocketService.joinChatRoom(props.room.id)

  // Mark messages as read when opening
  ChatApi.markAsRead(props.room.id)
})

onUnmounted(() => {
  // Покидаємо кімнату чату
  SocketService.leaveChatRoom(props.room.id)

  // Відписуємося від всіх подій цього компонента
  SocketService.unsubscribeAll(componentId)
})
</script>

<style scoped>
.staff-chat-dialog {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-messages-area {
  background: #f8f9fa;
  flex: 1;
  min-height: 0;
}

.message-container {
  margin-bottom: 16px;
}

.message-container.message-staff {
  display: flex;
  justify-content: flex-end;
}

.message-bubble-container {
  max-width: 70%;
}

.message-staff .message-bubble-container {
  margin-left: auto;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message-bubble-staff {
  background: #1976d2;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble-client {
  background: white;
  color: #000;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.message-sender {
  opacity: 0.9;
}

.message-text {
  line-height: 1.4;
}

.message-time {
  margin-top: 4px;
}

.message-files .q-chip {
  margin: 2px;
}

.chat-input-section {
  border-top: 1px solid #e0e0e0;
}

/* Dark mode support */
.body--dark .chat-messages-area {
  background: #303030;
}

.body--dark .message-bubble-client {
  background: #424242;
  color: white;
  border-color: #616161;
}

.body--dark .chat-input-section {
  background: #424242 !important;
  border-top-color: #616161;
}
</style>
