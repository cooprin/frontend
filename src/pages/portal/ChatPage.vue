<template>
  <q-page class="chat-page">
    <!-- Loading State -->
    <div v-if="loading" class="full-height flex flex-center">
      <div class="text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-grey-7">{{ $t('portal.pages.chat.loading') }}</div>
      </div>
    </div>

    <!-- No Active Chat - Create Chat Screen -->
    <div v-else-if="!activeRoom" class="full-height flex flex-center">
      <div class="text-center" style="max-width: 500px">
        <q-icon name="support_agent" size="80px" color="primary" />

        <div class="text-h5 q-mt-md">{{ $t('portal.pages.chat.welcome') }}</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm q-mb-lg">
          {{ $t('portal.pages.chat.welcomeDesc') }}
        </div>

        <q-btn
          color="primary"
          size="lg"
          icon="chat"
          :label="$t('portal.pages.chat.startChat')"
          @click="createNewChat"
          :loading="creatingChat"
          class="q-mb-xl"
        />

        <!-- FAQ or Quick Actions -->
        <div class="q-mt-xl">
          <div class="text-h6 q-mb-md">{{ $t('portal.pages.chat.commonQuestions') }}</div>
          <div class="row q-gutter-md justify-center">
            <q-btn
              flat
              color="primary"
              icon="help"
              :label="$t('portal.pages.chat.generalHelp')"
              @click="createChatWithMessage($t('portal.pages.chat.generalHelpMessage'))"
              :loading="creatingChat"
            />
            <q-btn
              flat
              color="primary"
              icon="build"
              :label="$t('portal.pages.chat.technicalIssue')"
              @click="createChatWithMessage($t('portal.pages.chat.technicalIssueMessage'))"
              :loading="creatingChat"
            />
            <q-btn
              flat
              color="primary"
              icon="payment"
              :label="$t('portal.pages.chat.billing')"
              @click="createChatWithMessage($t('portal.pages.chat.billingMessage'))"
              :loading="creatingChat"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Active Chat Interface -->
    <div v-else class="chat-interface full-height column">
      <!-- Chat Header -->
      <q-card-section class="bg-primary text-white q-pa-md chat-header">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">
              <q-icon name="support_agent" class="q-mr-sm" />
              {{ $t('portal.pages.chat.supportChat') }}
            </div>
            <div class="text-caption">
              <span v-if="activeRoom.assigned_staff_name">
                {{ $t('portal.pages.chat.assignedTo') }}: {{ activeRoom.assigned_staff_name }}
                <q-icon name="circle" size="8px" color="green" class="q-ml-xs" />
                {{ $t('portal.pages.chat.online') }}
              </span>
              <span v-else>{{ $t('portal.pages.chat.waitingForAssignment') }}</span>
            </div>
          </div>
          <div class="col-auto">
            <q-btn flat round icon="refresh" @click="refreshMessages" :loading="loadingMessages">
              <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
            </q-btn>
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
                  class="message-sender text-caption q-mb-xs"
                >
                  <q-icon name="support_agent" size="14px" class="q-mr-xs" />
                  {{ message.sender_name }}
                </div>

                <!-- Message text -->
                <div class="message-text">
                  {{ message.message_text }}
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
      </q-scroll-area>

      <!-- Message Input -->
      <q-card-section class="chat-input-section q-pa-md bg-white">
        <div class="row q-gutter-sm">
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
      </q-card-section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { date, Notify } from 'quasar'
import { ChatApi } from 'src/api/chat'
import SocketService from 'src/services/socketService'

const { t: $t } = useI18n()

// Reactive data
const activeRoom = ref(null)
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const loadingMessages = ref(false)
const sendingMessage = ref(false)
const creatingChat = ref(false)
const isTyping = ref(false)

// Refs
const messagesScroll = ref(null)

// Component ID для відписки від подій
const componentId = 'chat-page-portal-' + Date.now()
let typingTimeout = null

// Methods
const loadActiveChat = async () => {
  try {
    loading.value = true
    const response = await ChatApi.getActiveChat()

    if (response.data.success) {
      if (response.data.hasActiveChat) {
        activeRoom.value = response.data.activeRoom
        await loadMessages()

        // Join chat room
        SocketService.joinChatRoom(activeRoom.value.id)

        // Mark messages as read
        markRoomAsRead(activeRoom.value.id)
      }
    }
  } catch (error) {
    console.error('Error loading active chat:', error)
    Notify.create({
      type: 'negative',
      message: $t('portal.pages.chat.loadError'),
    })
  } finally {
    loading.value = false
  }
}

const createNewChat = async () => {
  try {
    creatingChat.value = true

    const response = await ChatApi.createRoom({
      room_type: 'support',
    })

    if (response.data.success) {
      activeRoom.value = response.data.room
      messages.value = []

      // Join new chat room
      SocketService.joinChatRoom(activeRoom.value.id)

      Notify.create({
        type: 'positive',
        message: $t('portal.pages.chat.chatCreated'),
      })
    }
  } catch (error) {
    console.error('Error creating chat:', error)

    if (error.response?.status === 400 && error.response?.data?.existingRoomId) {
      // Already has active chat, load it
      await loadActiveChat()
      Notify.create({
        type: 'info',
        message: $t('portal.pages.chat.alreadyHasChat'),
      })
    } else {
      Notify.create({
        type: 'negative',
        message: $t('portal.pages.chat.createError'),
      })
    }
  } finally {
    creatingChat.value = false
  }
}

const createChatWithMessage = async (initialMessage) => {
  await createNewChat()

  if (activeRoom.value && initialMessage) {
    newMessage.value = initialMessage
    await nextTick()
    sendMessage()
  }
}

const loadMessages = async (loadMore = false) => {
  if (!activeRoom.value) return

  try {
    loadingMessages.value = true

    const params = {
      page: loadMore ? Math.ceil(messages.value.length / 20) + 1 : 1,
      limit: 20,
    }

    const response = await ChatApi.getMessages(activeRoom.value.id, params)

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
  if (!activeRoom.value) return

  try {
    sendingMessage.value = true

    const formData = new FormData()
    formData.append('message_text', newMessage.value.trim())

    const response = await ChatApi.sendMessage(activeRoom.value.id, formData)

    if (response.data.success) {
      // Clear input
      newMessage.value = ''
      scrollToBottom()
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

const handleTyping = () => {
  if (SocketService.isConnected() && activeRoom.value?.id) {
    SocketService.startTyping(activeRoom.value.id)

    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      if (SocketService.isConnected() && activeRoom.value?.id) {
        SocketService.stopTyping(activeRoom.value.id)
      }
    }, 3000)
  }
}

const markRoomAsRead = async (roomId) => {
  try {
    await ChatApi.markAsRead(roomId)
  } catch (error) {
    console.error('Error marking room as read:', error)
  }
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

// Socket.io event handlers
const handleNewMessage = (data) => {
  if (data.room_id === activeRoom.value?.id) {
    const existingMessage = messages.value.find((m) => m.id === data.message.id)
    if (!existingMessage) {
      messages.value.push(data.message)
      nextTick(() => {
        scrollToBottom()
      })

      // Auto-mark as read if from staff
      if (data.message.sender_type === 'staff') {
        markRoomAsRead(activeRoom.value.id)
      }
    }
  }
}

const handleUserTyping = (data) => {
  if (data.userType === 'staff' && data.room_id === activeRoom.value?.id) {
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
    }, 5000)
  }
}

const handleUserStoppedTyping = (data) => {
  if (data.userType === 'staff' && data.room_id === activeRoom.value?.id) {
    isTyping.value = false
  }
}

const handleChatDeleted = (data) => {
  if (data.room_id === activeRoom.value?.id) {
    activeRoom.value = null
    messages.value = []
    Notify.create({
      type: 'info',
      message: $t('portal.pages.chat.chatDeleted'),
    })
  }
}

// Utility methods
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

// Handle URL parameters for direct access
const handleUrlParameters = () => {
  // If has active chat, URL params are not needed
  // The page will automatically load the active chat
}

// Lifecycle
onMounted(async () => {
  await loadActiveChat()

  // Subscribe to Socket.io events
  SocketService.subscribe('chat:new_message', handleNewMessage, componentId)
  SocketService.subscribe('chat:user_typing', handleUserTyping, componentId)
  SocketService.subscribe('chat:user_stopped_typing', handleUserStoppedTyping, componentId)
  SocketService.subscribe('chat:deleted', handleChatDeleted, componentId)

  await nextTick()
  handleUrlParameters()
})

onUnmounted(() => {
  // Leave current room
  if (activeRoom.value?.id) {
    SocketService.leaveChatRoom(activeRoom.value.id)
  }

  // Clear timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Unsubscribe from all events
  SocketService.unsubscribeAll(componentId)
})
</script>

<style scoped>
.chat-page {
  height: calc(100vh - 150px);
}

.chat-interface {
  height: 100%;
}

.chat-header {
  min-height: 70px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  opacity: 0.8;
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
</style>
