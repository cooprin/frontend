<template>
  <div class="notification-bell">
    <q-btn flat round dense icon="notifications">
      <q-badge
        v-if="unreadCount > 0"
        color="red"
        floating
        :label="unreadCount > 99 ? '99+' : unreadCount"
      />

      <q-menu
        v-model="showNotifications"
        max-width="400px"
        max-height="500px"
        anchor="bottom right"
        self="top right"
        :offset="[0, 8]"
        @before-show="loadNotifications"
      >
        <q-card class="notification-menu">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('notifications.title') }}</div>
            <q-space />
            <q-btn
              v-if="unreadCount > 0"
              flat
              dense
              size="sm"
              :label="$t('notifications.markAllRead')"
              @click="markAllAsRead"
              :loading="markingAllRead"
            />
          </q-card-section>

          <q-separator />

          <q-scroll-area style="height: 400px" class="q-pa-none">
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner color="primary" size="2em" />
            </div>

            <div v-else-if="notifications.length === 0" class="text-center q-pa-lg">
              <q-icon name="notifications_none" size="48px" color="grey-4" />
              <div class="text-grey-6 q-mt-sm">{{ $t('notifications.empty') }}</div>
            </div>

            <q-list v-else separator>
              <q-item
                v-for="notification in notifications"
                :key="notification.id"
                clickable
                @click="handleNotificationClick(notification)"
                :class="{ 'bg-blue-1': !notification.is_read }"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="getNotificationIcon(notification.notification_type)"
                    :color="getNotificationColor(notification.notification_type)"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ notification.title }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-7">
                    {{ notification.message }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ formatDate(notification.created_at) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side v-if="!notification.is_read">
                  <q-icon name="circle" color="blue" size="8px" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>

          <q-separator />

          <q-card-actions class="q-pa-md">
            <q-btn
              flat
              class="full-width"
              color="primary"
              :label="$t('notifications.viewAll')"
              @click="viewAllNotifications"
            />
          </q-card-actions>
        </q-card>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { date, Notify } from 'quasar'
import { NotificationsApi } from 'src/api/notifications'

const { t: $t } = useI18n()
const router = useRouter()

// Reactive data
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const markingAllRead = ref(false)
const showNotifications = ref(false)

// Polling interval
let pollInterval = null

// Methods
const loadNotifications = async () => {
  try {
    loading.value = true
    const response = await NotificationsApi.getNotifications({ limit: 10 })

    if (response.data.success) {
      notifications.value = response.data.notifications
    }
  } catch (error) {
    console.error('Error loading notifications:', error)
    Notify.create({
      type: 'negative',
      message: 'Помилка завантаження сповіщень',
    })
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const response = await NotificationsApi.getUnreadCount()

    if (response.data.success) {
      unreadCount.value = response.data.counts.unread_count || 0
    }
  } catch (error) {
    console.error('Error loading unread count:', error)
  }
}

// Функція більше не потрібна, використовуємо @before-show

const markAllAsRead = async () => {
  try {
    markingAllRead.value = true
    const response = await NotificationsApi.markAllAsRead()

    if (response.data.success) {
      notifications.value.forEach((n) => {
        n.is_read = true
        n.read_at = new Date().toISOString()
      })
      unreadCount.value = 0

      Notify.create({
        type: 'positive',
        message: $t('notifications.allMarkedRead'),
      })
    }
  } catch (error) {
    console.error('Error marking all as read:', error)
    Notify.create({
      type: 'negative',
      message: $t('notifications.markError'),
    })
  } finally {
    markingAllRead.value = false
  }
}

const handleNotificationClick = async (notification) => {
  // Позначити як прочитане
  if (!notification.is_read) {
    try {
      await NotificationsApi.markAsRead(notification.id)
      notification.is_read = true
      notification.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Навігація залежно від типу сповіщення
  showNotifications.value = false

  if (
    ['new_ticket', 'ticket_assigned', 'ticket_updated', 'ticket_comment'].includes(
      notification.notification_type,
    )
  ) {
    if (notification.entity_id) {
      router.push({
        name: 'ticket-details',
        params: { id: notification.entity_id },
      })
    }
  } else if (['new_chat_message', 'chat_assigned'].includes(notification.notification_type)) {
    // Отримуємо room_id з data сповіщення
    const roomId = notification.data?.room_id

    if (roomId) {
      // Навігація до chat management з автовідкриттям чату
      router.push({
        name: 'chat',
        query: {
          openRoom: roomId,
        },
      })
    } else {
      // Fallback - просто відкрити chat management
      router.push({ name: 'chat' })
    }
  } else {
    // Для інших типів - на загальну сторінку сповіщень
    viewAllNotifications()
  }
}

const viewAllNotifications = () => {
  showNotifications.value = false
  router.push({ name: 'notifications' })
}

const getNotificationIcon = (type) => {
  const icons = {
    new_ticket: 'confirmation_number',
    ticket_assigned: 'assignment_ind',
    ticket_updated: 'update',
    ticket_resolved: 'check_circle',
    ticket_comment: 'comment',
    new_chat_message: 'chat',
    chat_assigned: 'support_agent',
    chat_closed: 'chat_bubble_outline',
    new_invoice: 'receipt',
    payment_received: 'payment',
  }
  return icons[type] || 'notifications'
}

const getNotificationColor = (type) => {
  const colors = {
    new_ticket: 'blue',
    ticket_assigned: 'orange',
    ticket_updated: 'purple',
    ticket_resolved: 'green',
    ticket_comment: 'blue',
    new_chat_message: 'primary',
    chat_assigned: 'orange',
    chat_closed: 'grey',
    new_invoice: 'amber',
    payment_received: 'green',
  }
  return colors[type] || 'grey'
}

const formatDate = (dateString) => {
  const now = new Date()
  const notificationDate = new Date(dateString)
  const diffMinutes = Math.floor((now - notificationDate) / (1000 * 60))

  if (diffMinutes < 1) return $t('common.justNow')
  if (diffMinutes < 60) return $t('common.minutesAgo', { minutes: diffMinutes })
  if (diffMinutes < 1440) return $t('common.hoursAgo', { hours: Math.floor(diffMinutes / 60) })

  return date.formatDate(notificationDate, 'DD.MM.YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadUnreadCount()

  // Polling кожні 30 секунд
  pollInterval = setInterval(() => {
    loadUnreadCount()
  }, 30000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

// Expose methods for parent components
defineExpose({
  loadUnreadCount,
  loadNotifications,
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.notification-menu {
  min-width: 350px;
  max-width: 400px;
}

.q-item.bg-blue-1 {
  background-color: #e3f2fd !important;
}

/* Dark mode support */
.body--dark .q-item.bg-blue-1 {
  background-color: rgba(33, 150, 243, 0.1) !important;
}
</style>
