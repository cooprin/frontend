<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5">{{ $t('notifications.title') }}</div>
        <div class="text-subtitle2 text-grey-7">
          {{ $t('notifications.subtitle') }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          v-if="hasUnreadNotifications"
          color="primary"
          :label="$t('notifications.markAllRead')"
          icon="done_all"
          @click="markAllAsRead"
          :loading="markingAllRead"
          class="q-mr-sm"
        />
        <q-btn flat icon="refresh" @click="refreshNotifications" :loading="loading" />
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <div class="col-md-3 col-sm-6 col-12">
            <q-select
              v-model="filter.type"
              :options="typeOptions"
              :label="$t('notifications.filter.type')"
              emit-value
              map-options
              clearable
              dense
              outlined
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-12">
            <q-select
              v-model="filter.status"
              :options="statusOptions"
              :label="$t('notifications.filter.status')"
              emit-value
              map-options
              clearable
              dense
              outlined
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-4 col-12">
            <q-input
              v-model="filter.search"
              :label="$t('notifications.filter.search')"
              dense
              outlined
              clearable
              @update:model-value="onSearchChange"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Notifications List -->
    <q-card flat bordered>
      <q-card-section class="q-pa-none">
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md">{{ $t('notifications.loading') }}</div>
        </div>

        <div v-else-if="notifications.length === 0" class="text-center q-pa-xl">
          <q-icon name="notifications_none" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">
            {{ $t('notifications.empty') }}
          </div>
          <div class="text-grey-5 q-mt-sm">
            {{ $t('notifications.emptyDesc') }}
          </div>
        </div>

        <q-list v-else separator>
          <q-item
            v-for="notification in notifications"
            :key="notification.id"
            clickable
            @click="handleNotificationClick(notification)"
            :class="{ 'bg-blue-1': !notification.is_read }"
            class="notification-item"
          >
            <q-item-section avatar>
              <q-avatar
                :color="getNotificationColor(notification.notification_type)"
                text-color="white"
                :icon="getNotificationIcon(notification.notification_type)"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ notification.title }}
              </q-item-label>
              <q-item-label caption class="text-grey-7 q-mt-xs">
                {{ notification.message }}
              </q-item-label>
              <q-item-label caption class="text-grey-6 q-mt-xs">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ formatDateTime(notification.created_at) }}
                <span v-if="notification.entity_display_name" class="q-ml-md">
                  <q-icon name="link" size="14px" class="q-mr-xs" />
                  {{ notification.entity_display_name }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column items-end">
                <q-chip
                  :color="getTypeChipColor(notification.notification_type)"
                  text-color="white"
                  :label="$t(`notifications.types.${notification.notification_type}`)"
                  size="sm"
                  class="q-mb-xs"
                />
                <div class="row items-center">
                  <q-icon
                    v-if="!notification.is_read"
                    name="circle"
                    color="blue"
                    size="8px"
                    class="q-mr-sm"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    :icon="notification.is_read ? 'mark_email_read' : 'mark_email_unread'"
                    @click.stop="toggleReadStatus(notification)"
                  >
                    <q-tooltip>
                      {{
                        notification.is_read
                          ? $t('notifications.markUnread')
                          : $t('notifications.markRead')
                      }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- Pagination -->
      <q-card-section v-if="pagination.totalPages > 1" class="q-pt-none">
        <div class="row justify-center">
          <q-pagination
            v-model="pagination.page"
            :max="pagination.totalPages"
            :max-pages="6"
            direction-links
            boundary-links
            @update:model-value="onPageChange"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { date, Notify } from 'quasar'
import { NotificationsApi } from 'src/api/notifications'

const { t: $t } = useI18n()
const router = useRouter()

// Reactive data
const notifications = ref([])
const loading = ref(false)
const markingAllRead = ref(false)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

const filter = ref({
  type: null,
  status: null,
  search: '',
})

let searchTimeout = null

// Computed
const hasUnreadNotifications = computed(() => {
  return notifications.value.some((n) => !n.is_read)
})

const typeOptions = computed(() => [
  { label: $t('notifications.types.new_ticket'), value: 'new_ticket' },
  { label: $t('notifications.types.ticket_assigned'), value: 'ticket_assigned' },
  { label: $t('notifications.types.ticket_updated'), value: 'ticket_updated' },
  { label: $t('notifications.types.ticket_comment'), value: 'ticket_comment' },
  { label: $t('notifications.types.new_chat_message'), value: 'new_chat_message' },
  { label: $t('notifications.types.chat_assigned'), value: 'chat_assigned' },
])

const statusOptions = computed(() => [
  { label: $t('notifications.status.unread'), value: 'unread' },
  { label: $t('notifications.status.read'), value: 'read' },
])

// Methods
const loadNotifications = async (page = 1) => {
  try {
    loading.value = true

    const params = {
      page,
      limit: pagination.value.limit,
    }

    if (filter.value.type) params.type = filter.value.type
    if (filter.value.status) params.status = filter.value.status
    if (filter.value.search && filter.value.search.trim())
      params.search = filter.value.search.trim()

    const response = await NotificationsApi.getNotifications(params)

    if (response.data.success) {
      notifications.value = response.data.notifications
      pagination.value = {
        ...pagination.value,
        ...response.data.pagination,
      }
    }
  } catch (error) {
    console.error('Error loading notifications:', error)
    Notify.create({
      type: 'negative',
      message: $t('notifications.loadError'),
    })
  } finally {
    loading.value = false
  }
}

const refreshNotifications = () => {
  loadNotifications(pagination.value.page)
}

const onFilterChange = () => {
  pagination.value.page = 1
  loadNotifications(1)
}

const markAllAsRead = async () => {
  try {
    markingAllRead.value = true
    const response = await NotificationsApi.markAllAsRead()

    if (response.data.success) {
      notifications.value.forEach((n) => {
        n.is_read = true
        n.read_at = new Date().toISOString()
      })

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

const toggleReadStatus = async (notification) => {
  try {
    if (!notification.is_read) {
      await NotificationsApi.markAsRead(notification.id)
      notification.is_read = true
      notification.read_at = new Date().toISOString()
    }
  } catch (error) {
    console.error('Error toggling read status:', error)
    Notify.create({
      type: 'negative',
      message: $t('notifications.markError'),
    })
  }
}

const handleNotificationClick = async (notification) => {
  await toggleReadStatus(notification)

  // Навігація залежно від типу
  switch (notification.notification_type) {
    case 'new_ticket':
    case 'ticket_assigned':
    case 'ticket_updated':
    case 'ticket_comment':
      if (notification.entity_id) {
        router.push({
          name: 'ticket-details',
          params: { id: notification.entity_id },
        })
      }
      break
    case 'new_chat_message':
    case 'chat_assigned':
      router.push({ name: 'chat' })
      break
  }
}

const onPageChange = (page) => {
  loadNotifications(page)
}

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadNotifications(1)
  }, 500)
}

// Utility methods
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
  }
  return colors[type] || 'grey'
}

const getTypeChipColor = (type) => {
  const colors = {
    new_ticket: 'blue-7',
    ticket_assigned: 'orange-7',
    ticket_updated: 'purple-7',
    ticket_resolved: 'green-7',
    ticket_comment: 'blue-6',
    new_chat_message: 'primary',
    chat_assigned: 'orange-6',
    chat_closed: 'grey-6',
  }
  return colors[type] || 'grey-6'
}

const formatDateTime = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notification-item {
  min-height: 80px;
}

.notification-item.bg-blue-1 {
  background-color: #e3f2fd !important;
}

/* Dark mode support */
.body--dark .notification-item.bg-blue-1 {
  background-color: rgba(33, 150, 243, 0.1) !important;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.body--dark .notification-item:hover {
  background-color: #424242;
}
</style>
