<template>
  <q-page class="chat-page">
    <div class="row no-wrap full-height">
      <!-- Sidebar with chat rooms -->
      <div class="col-4 chat-sidebar">
        <q-card flat class="full-height">
          <!-- Header -->
          <q-card-section class="bg-primary text-white q-pa-md">
            <div class="text-h6">{{ $t('portal.pages.chat.title') }}</div>
            <div class="text-caption">{{ $t('portal.pages.chat.support') }}</div>
          </q-card-section>

          <!-- New Chat Button -->
          <q-card-section class="q-pa-md">
            <q-btn
              color="primary"
              icon="add_comment"
              :label="$t('portal.pages.chat.newChat')"
              class="full-width"
              @click="createNewChat"
              :loading="creatingChat"
            />
          </q-card-section>

          <!-- Rooms List -->
          <q-scroll-area class="chat-rooms-list">
            <q-list>
              <q-item
                v-for="room in chatRooms"
                :key="room.id"
                clickable
                v-ripple
                :active="selectedRoom?.id === room.id"
                active-class="bg-blue-1"
                @click="selectRoom(room)"
                class="chat-room-item"
              >
                <q-item-section avatar>
                  <q-avatar
                    :color="room.room_type === 'ticket' ? 'orange' : 'primary'"
                    text-color="white"
                    :icon="room.room_type === 'ticket' ? 'confirmation_number' : 'support_agent'"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ getRoomTitle(room) }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-7">
                    {{ room.last_message_preview || $t('portal.pages.chat.noMessages') }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ formatRoomDate(room.last_message_at || room.created_at) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="column items-end">
                    <!-- Unread badge -->
                    <q-badge
                      v-if="room.unread_staff_messages > 0"
                      color="red"
                      :label="room.unread_staff_messages"
                      rounded
                    />
                    <!-- Online indicator -->
                    <q-icon
                      v-if="room.assigned_staff_name"
                      name="circle"
                      size="8px"
                      :color="room.staff_online ? 'green' : 'grey'"
                      class="q-mt-xs"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Empty state -->
            <div v-if="!loading && chatRooms.length === 0" class="text-center q-pa-md">
              <q-icon name="chat" size="48px" color="grey-4" />
              <div class="text-grey-6 q-mt-sm">{{ $t('portal.pages.chat.noChats') }}</div>
            </div>
          </q-scroll-area>
        </q-card>
      </div>

      <!-- Chat Messages Area -->
      <div class="col-8 chat-main">
        <q-card flat class="full-height column">
          <!-- Chat Header -->
          <q-card-section
            v-if="selectedRoom"
            class="bg-grey-1 q-pa-md chat-header row items-center"
          >
            <div class="col">
              <div class="text-h6">{{ getRoomTitle(selectedRoom) }}</div>
              <div class="text-caption text-grey-7">
                <span v-if="selectedRoom.assigned_staff_name">
                  {{ $t('portal.pages.chat.assignedTo') }}: {{ selectedRoom.assigned_staff_name }}
                  <q-icon
                    name="circle"
                    size="8px"
                    :color="selectedRoom.staff_online ? 'green' : 'grey'"
                    class="q-ml-xs"
                  />
                  {{
                    selectedRoom.staff_online
                      ? $t('portal.pages.chat.online')
                      : $t('portal.pages.chat.offline')
                  }}
                </span>
                <span v-else>{{ $t('portal.pages.chat.waitingForAssignment') }}</span>
              </div>
            </div>
            <div class="col-auto">
              <q-btn flat round icon="more_vert" @click="showRoomMenu = true">
                <q-menu v-model="showRoomMenu">
                  <q-list style="min-width: 200px">
                    <q-item clickable @click="refreshMessages">
                      <q-item-section avatar>
                        <q-icon name="refresh" />
                      </q-item-section>
                      <q-item-section>{{ $t('common.refresh') }}</q-item-section>
                    </q-item>
                    <q-item
                      v-if="selectedRoom.room_type === 'support'"
                      clickable
                      @click="convertToTicket"
                    >
                      <q-item-section avatar>
                        <q-icon name="confirmation_number" />
                      </q-item-section>
                      <q-item-section>{{ $t('portal.pages.chat.convertToTicket') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>

          <!-- Messages Area -->
          <q-scroll-area ref="messagesScroll" class="col chat-messages-area" @scroll="onScroll">
            <div v-if="selectedRoom" class="q-pa-md">
              <!-- Loading more messages -->
              <div v-if="loadingMessages" class="text-center q-py-md">
                <q-spinner size="24px" color="primary" />
              </div>

              <!-- Messages -->
              <div
                v-for="(message, msgIndex) in messages"
                :key="message.id"
                class="message-container"
                :class="{ 'message-mine': message.sender_type === 'client' }"
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
                      'message-bubble-mine': message.sender_type === 'client',
                      'message-bubble-theirs': message.sender_type === 'staff',
                    }"
                  >
                    <!-- Sender name for staff messages -->
                    <div
                      v-if="message.sender_type === 'staff' && message.sender_name"
                      class="message-sender text-caption text-grey-7 q-mb-xs"
                    >
                      {{ message.sender_name }}
                    </div>

                    <!-- Message text -->
                    <div class="message-text">
                      {{ message.message_text }}
                    </div>

                    <!-- Files -->
                    <div v-if="message.files_count > 0" class="message-files q-mt-sm">
                      <q-chip
                        v-for="file in message.files"
                        :key="file.id"
                        size="sm"
                        color="blue-1"
                        text-color="blue-8"
                        icon="attach_file"
                        :label="file.original_name"
                        clickable
                        @click="downloadFile(file)"
                      />
                    </div>

                    <!-- Message time -->
                    <div class="message-time text-caption text-grey-6 q-mt-xs">
                      {{ formatMessageTime(message.created_at) }}
                      <q-icon
                        v-if="message.sender_type === 'client'"
                        :name="message.is_read ? 'done_all' : 'done'"
                        size="14px"
                        :color="message.is_read ? 'blue' : 'grey'"
                        class="q-ml-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isTyping" class="typing-indicator q-pa-md">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="text-caption text-grey-6 q-ml-sm">
                  {{ $t('portal.pages.chat.typing') }}
                </span>
              </div>

              <!-- Empty messages state -->
              <div v-if="!loadingMessages && messages.length === 0" class="text-center q-py-xl">
                <q-icon name="chat_bubble_outline" size="64px" color="grey-4" />
                <div class="text-grey-6 q-mt-md">
                  {{ $t('portal.pages.chat.startConversation') }}
                </div>
              </div>
            </div>

            <!-- No room selected -->
            <div v-else class="full-height flex flex-center">
              <div class="text-center">
                <q-icon name="forum" size="80px" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">
                  {{ $t('portal.pages.chat.selectRoom') }}
                </div>
                <div class="text-grey-5 q-mt-sm">
                  {{ $t('portal.pages.chat.selectRoomDesc') }}
                </div>
              </div>
            </div>
          </q-scroll-area>

          <!-- Message Input -->
          <q-card-section v-if="selectedRoom" class="chat-input-section q-pa-md bg-white">
            <div class="row q-gutter-sm">
              <!-- File upload button -->
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  icon="attach_file"
                  color="grey-7"
                  @click="$refs.fileInput.click()"
                  :disable="sendingMessage"
                >
                  <q-tooltip>{{ $t('portal.pages.chat.attachFile') }}</q-tooltip>
                </q-btn>
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                  style="display: none"
                  @change="handleFileSelect"
                />
              </div>

              <!-- Message input -->
              <div class="col">
                <q-input
                  v-model="newMessage"
                  :placeholder="$t('portal.pages.chat.typeMessage')"
                  outlined
                  dense
                  autogrow
                  :max-height="100"
                  @keydown.enter.prevent="sendMessage"
                  @input="handleTyping"
                  :disable="sendingMessage"
                  class="chat-input"
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

            <!-- Selected files preview -->
            <div v-if="selectedFiles.length > 0" class="q-mt-sm">
              <div class="text-caption text-grey-7 q-mb-xs">
                {{ $t('portal.pages.chat.selectedFiles') }}:
              </div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  removable
                  @remove="removeFile(index)"
                  color="blue-1"
                  text-color="blue-8"
                  icon="attach_file"
                  :label="file.name"
                  size="sm"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { date, Notify } from 'quasar'
import { ChatApi } from 'src/api/chat'
import { useRoute } from 'vue-router'
import SocketService from 'src/services/socketService'

const { t: $t } = useI18n()

// Reactive data
const chatRooms = ref([])
const selectedRoom = ref(null)
const messages = ref([])
const newMessage = ref('')
const selectedFiles = ref([])
const loading = ref(false)
const loadingMessages = ref(false)
const sendingMessage = ref(false)
const creatingChat = ref(false)
const showRoomMenu = ref(false)
const isTyping = ref(false)

// Refs
const messagesScroll = ref(null)
const fileInput = ref(null)

// Component ID для відписки від подій
const componentId = 'chat-page-' + Date.now()
let typingTimeout = null

// Methods
const loadChatRooms = async () => {
  try {
    loading.value = true
    const response = await ChatApi.getRooms()

    if (response.data.success) {
      chatRooms.value = response.data.rooms
    }
  } catch (error) {
    console.error('Error loading chat rooms:', error)
    Notify.create({
      type: 'negative',
      message: $t('portal.pages.chat.loadError'),
    })
  } finally {
    loading.value = false
  }
}

const selectRoom = async (room) => {
  if (selectedRoom.value?.id === room.id) return

  // Покидаємо попередню кімнату
  if (selectedRoom.value?.id) {
    SocketService.leaveChatRoom(selectedRoom.value.id)
  }

  selectedRoom.value = room
  messages.value = []
  await loadMessages()

  // Приєднуємося до нової кімнати
  SocketService.joinChatRoom(room.id)

  // Mark messages as read
  markRoomAsRead(room.id)
}

const loadMessages = async (loadMore = false) => {
  if (!selectedRoom.value) return

  try {
    loadingMessages.value = true

    const params = {
      page: loadMore ? Math.ceil(messages.value.length / 20) + 1 : 1,
      limit: 20,
    }

    const response = await ChatApi.getMessages(selectedRoom.value.id, params)

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
  if (!newMessage.value.trim() && selectedFiles.value.length === 0) return
  if (!selectedRoom.value) return

  try {
    sendingMessage.value = true

    const formData = new FormData()
    formData.append('message_text', newMessage.value.trim())

    selectedFiles.value.forEach((file) => {
      formData.append(`files`, file)
    })

    const response = await ChatApi.sendMessage(selectedRoom.value.id, formData)

    if (response.data.success) {
      // Повідомлення додасться через Socket.io подію
      newMessage.value = ''
      selectedFiles.value = []
      scrollToBottom()

      updateRoomInList(selectedRoom.value.id, {
        last_message_at: response.data.message.created_at,
        last_message_preview: response.data.message.message_text,
      })
    }
  } catch (error) {
    console.error('Error sending message:', error)
    Notify.create({
      type: 'negative',
      message: $t('portal.pages.chat.sendError'),
    })
  } finally {
    sendingMessage.value = false
  }
}

const createNewChat = async () => {
  try {
    creatingChat.value = true

    const response = await ChatApi.createRoom({
      room_type: 'support',
    })

    if (response.data.success) {
      chatRooms.value.unshift(response.data.room)
      selectRoom(response.data.room)

      Notify.create({
        type: 'positive',
        message: $t('portal.pages.chat.chatCreated'),
      })
    }
  } catch (error) {
    console.error('Error creating chat:', error)
    Notify.create({
      type: 'negative',
      message: $t('portal.pages.chat.createError'),
    })
  } finally {
    creatingChat.value = false
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
  event.target.value = ''
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const handleTyping = () => {
  if (SocketService.isConnected() && selectedRoom.value?.id) {
    SocketService.startTyping(selectedRoom.value.id)

    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      if (SocketService.isConnected() && selectedRoom.value?.id) {
        SocketService.stopTyping(selectedRoom.value.id)
      }
    }, 3000)
  }
}

const markRoomAsRead = async (roomId) => {
  try {
    await ChatApi.markAsRead(roomId)

    const room = chatRooms.value.find((r) => r.id === roomId)
    if (room) {
      room.unread_staff_messages = 0
    }
  } catch (error) {
    console.error('Error marking room as read:', error)
  }
}

const updateRoomInList = (roomId, updates) => {
  const roomIndex = chatRooms.value.findIndex((r) => r.id === roomId)
  if (roomIndex !== -1) {
    Object.assign(chatRooms.value[roomIndex], updates)

    const room = chatRooms.value.splice(roomIndex, 1)[0]
    chatRooms.value.unshift(room)
  }
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

const refreshMessages = () => {
  loadMessages()
}

const convertToTicket = async () => {
  console.log('Convert to ticket:', selectedRoom.value)
}

const downloadFile = (file) => {
  console.log('Download file:', file)
}

// Socket.io event handlers через SocketService
const handleNewMessage = (data) => {
  if (data.room_id === selectedRoom.value?.id) {
    const existingMessage = messages.value.find((m) => m.id === data.message.id)
    if (!existingMessage) {
      messages.value.push(data.message)
      nextTick(() => {
        scrollToBottom()
      })
    }

    updateRoomInList(data.room_id, {
      last_message_at: data.message.created_at,
      last_message_preview: data.message.message_text,
    })
  }
}

const handleUserTyping = (data) => {
  if (data.userType === 'staff') {
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
    }, 5000)
  }
}

const handleUserStoppedTyping = (data) => {
  if (data.userType === 'staff') {
    isTyping.value = false
  }
}

// Utility methods
const getRoomTitle = (room) => {
  if (room.room_type === 'ticket' && room.ticket_number) {
    return `${$t('tickets.ticketNumber')} #${room.ticket_number}`
  }
  return $t('portal.pages.chat.supportChat')
}

const formatRoomDate = (dateString) => {
  if (!dateString) return ''

  const messageDate = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.isSameDate(messageDate, today, 'day')) {
    return date.formatDate(messageDate, 'HH:mm')
  } else if (date.isSameDate(messageDate, yesterday, 'day')) {
    return $t('common.yesterday')
  } else {
    return date.formatDate(messageDate, 'DD.MM')
  }
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

const handleUrlParameters = () => {
  const route = useRoute()
  const openRoomId = route.query.openRoom

  console.log('Handling URL params:', { openRoomId, roomsCount: chatRooms.value.length })

  if (openRoomId) {
    const room = chatRooms.value.find((r) => r.id == openRoomId)
    console.log('Found room:', room)

    if (room) {
      selectRoom(room)
    } else {
      console.log(
        'Room not found, available rooms:',
        chatRooms.value.map((r) => r.id),
      )

      // Спробувати завантажити конкретну кімнату, якщо не знайдена
      loadSpecificRoom(openRoomId)
    }
  }
}

const loadSpecificRoom = async (roomId) => {
  try {
    // Перезавантажуємо список кімнат і пробуємо знайти потрібну
    await loadChatRooms()

    const room = chatRooms.value.find((r) => r.id == roomId)
    if (room) {
      selectRoom(room)
    } else {
      Notify.create({
        type: 'warning',
        message: $t('portal.pages.chat.roomNotFound') || 'Chat room not found',
      })
    }
  } catch (error) {
    console.error('Error loading specific room:', error)
    Notify.create({
      type: 'negative',
      message: $t('portal.pages.chat.loadError'),
    })
  }
}

// Lifecycle
onMounted(async () => {
  await loadChatRooms()

  // Підписуємося на Socket.io події через SocketService
  SocketService.subscribe('chat:new_message', handleNewMessage, componentId)
  SocketService.subscribe('chat:user_typing', handleUserTyping, componentId)
  SocketService.subscribe('chat:user_stopped_typing', handleUserStoppedTyping, componentId)

  await nextTick()
  handleUrlParameters()
})

onUnmounted(() => {
  // Покидаємо поточну кімнату
  if (selectedRoom.value?.id) {
    SocketService.leaveChatRoom(selectedRoom.value.id)
  }

  // Очищуємо timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Відписуємося від всіх подій цього компонента
  SocketService.unsubscribeAll(componentId)
})
</script>

<style scoped>
.chat-page {
  height: calc(100vh - 150px);
}

.chat-sidebar {
  border-right: 1px solid #e0e0e0;
  max-width: 320px;
  min-width: 280px;
}

.chat-rooms-list {
  height: calc(100% - 120px);
}

.chat-room-item {
  border-bottom: 1px solid #f5f5f5;
}

.chat-main {
  min-height: 0;
}

.chat-header {
  border-bottom: 1px solid #e0e0e0;
  min-height: 70px;
}

.chat-messages-area {
  background: #f8f9fa;
  min-height: 300px;
}

.message-container {
  margin-bottom: 16px;
}

.message-container.message-mine {
  display: flex;
  justify-content: flex-end;
}

.message-bubble-container {
  max-width: 70%;
}

.message-mine .message-bubble-container {
  margin-left: auto;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message-bubble-mine {
  background: #1976d2;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble-theirs {
  background: white;
  color: #000;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.message-sender {
  font-weight: 500;
}

.message-text {
  line-height: 1.4;
}

.message-time {
  text-align: right;
  margin-top: 4px;
}

.message-bubble-theirs .message-time {
  text-align: left;
}

.message-files .q-chip {
  margin: 2px;
}

.chat-input-section {
  border-top: 1px solid #e0e0e0;
  background: white;
}

.chat-input {
  background: white;
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Dark mode support */
.body--dark .chat-sidebar {
  border-right-color: #424242;
}

.body--dark .chat-header {
  background: #424242 !important;
  border-bottom-color: #616161;
}

.body--dark .chat-messages-area {
  background: #303030;
}

.body--dark .message-bubble-theirs {
  background: #424242;
  color: white;
  border-color: #616161;
}

.body--dark .chat-input-section {
  background: #424242 !important;
  border-top-color: #616161;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chat-sidebar {
    max-width: none;
    min-width: none;
  }

  .message-bubble-container {
    max-width: 85%;
  }
}
</style>
