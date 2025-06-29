<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5">{{ $t('chat.management.title') }}</div>
        <div class="text-subtitle2 text-grey-7">
          {{ $t('chat.management.subtitle') }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          flat
          icon="refresh"
          :label="$t('common.refresh')"
          @click="refreshData"
          :loading="loading"
          class="q-mr-sm"
        />
        <q-btn
          color="primary"
          icon="search"
          :label="$t('chat.management.search')"
          @click="showSearchDialog = true"
        />
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered class="metrics-card bg-blue-1">
          <q-card-section class="text-center">
            <q-icon name="forum" size="32px" color="blue" class="q-mb-sm" />
            <div class="text-h4 text-blue">{{ metrics.active_chats || 0 }}</div>
            <div class="text-caption text-blue-8 text-weight-medium">
              {{ $t('chat.management.activeChats') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered class="metrics-card bg-orange-1">
          <q-card-section class="text-center">
            <q-icon name="assignment_late" size="32px" color="orange" class="q-mb-sm" />
            <div class="text-h4 text-orange">{{ metrics.unassigned_chats || 0 }}</div>
            <div class="text-caption text-orange-8 text-weight-medium">
              {{ $t('chat.management.unassignedChats') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered class="metrics-card bg-red-1">
          <q-card-section class="text-center">
            <q-icon name="mark_chat_unread" size="32px" color="red" class="q-mb-sm" />
            <div class="text-h4 text-red">{{ metrics.unread_messages || 0 }}</div>
            <div class="text-caption text-red-8 text-weight-medium">
              {{ $t('chat.management.unreadMessages') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered class="metrics-card bg-green-1">
          <q-card-section class="text-center">
            <q-icon name="check_circle" size="32px" color="green" class="q-mb-sm" />
            <div class="text-h4 text-green">{{ metrics.closed_today || 0 }}</div>
            <div class="text-caption text-green-8 text-weight-medium">
              {{ $t('chat.management.closedToday') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered class="metrics-card bg-purple-1">
          <q-card-section class="text-center">
            <q-icon name="schedule" size="32px" color="purple" class="q-mb-sm" />
            <div class="text-h4 text-purple">{{ metrics.created_today || 0 }}</div>
            <div class="text-caption text-purple-8 text-weight-medium">
              {{ $t('chat.management.createdToday') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered class="metrics-card bg-indigo-1">
          <q-card-section class="text-center">
            <q-icon name="timer" size="32px" color="indigo" class="q-mb-sm" />
            <div class="text-h4 text-indigo">
              {{ Math.round(metrics.avg_resolution_time_minutes || 0) }}m
            </div>
            <div class="text-caption text-indigo-8 text-weight-medium">
              {{ $t('chat.management.avgResolutionTime') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <div class="col-md-3 col-sm-6 col-12">
            <q-select
              v-model="filter.status"
              :options="statusOptions"
              :label="$t('chat.management.filter.status')"
              emit-value
              map-options
              clearable
              dense
              outlined
              @update:model-value="loadRooms"
            />
          </div>

          <div class="col-md-3 col-sm-6 col-12">
            <q-select
              v-model="filter.assigned_to"
              :options="staffOptions"
              :label="$t('chat.management.filter.assignedTo')"
              emit-value
              map-options
              clearable
              dense
              outlined
              @update:model-value="loadRooms"
            />
          </div>

          <div class="col-md-3 col-sm-6 col-12">
            <q-select
              v-model="filter.room_type"
              :options="roomTypeOptions"
              :label="$t('chat.management.filter.roomType')"
              emit-value
              map-options
              clearable
              dense
              outlined
              @update:model-value="loadRooms"
            />
          </div>

          <div class="col-md-3 col-12">
            <q-input
              v-model="filter.search"
              :label="$t('chat.management.filter.search')"
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

    <!-- Bulk Actions -->
    <div v-if="selectedRooms.length > 0" class="q-mb-md">
      <q-card flat bordered class="bg-blue-1">
        <q-card-section class="q-py-sm">
          <div class="row items-center">
            <div class="col">
              <span class="text-weight-medium text-blue-8">
                {{ $t('chat.management.selectedCount', { count: selectedRooms.length }) }}
              </span>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                dense
                icon="person_add"
                :label="$t('chat.management.bulkAssign')"
                @click="showBulkAssignDialog = true"
                color="blue"
                class="q-mr-sm"
              />
              <q-btn
                flat
                dense
                icon="close"
                :label="$t('chat.management.bulkClose')"
                @click="showBulkCloseDialog = true"
                color="orange"
                class="q-mr-sm"
              />
              <q-btn
                flat
                dense
                icon="delete"
                :label="$t('chat.management.bulkDelete')"
                @click="showBulkDeleteDialog = true"
                color="negative"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner size="40px" color="primary" />
      <div class="q-mt-sm">{{ $t('common.loading') }}</div>
    </div>

    <!-- Chat Rooms Cards -->
    <div v-else-if="chatRooms.length > 0" class="row q-gutter-md">
      <div
        v-for="room in chatRooms"
        :key="room.id"
        class="col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12"
      >
        <q-card
          flat
          bordered
          class="chat-room-card full-height"
          :class="{ 'selected-card': selectedRooms.some((r) => r.id === room.id) }"
        >
          <q-card-section class="q-pb-sm">
            <!-- Header with selection -->
            <div class="row items-center q-mb-sm">
              <div class="col-auto">
                <q-checkbox
                  :model-value="selectedRooms.some((r) => r.id === room.id)"
                  @update:model-value="toggleRoomSelection(room)"
                />
              </div>
              <div class="col">
                <div class="row items-center q-gutter-sm">
                  <q-chip
                    :color="room.room_type === 'ticket' ? 'orange' : 'primary'"
                    text-color="white"
                    size="sm"
                    :icon="room.room_type === 'ticket' ? 'confirmation_number' : 'support_agent'"
                    :label="$t(`chat.management.roomTypes.${room.room_type}`)"
                  />
                  <q-chip
                    :color="getStatusColor(room.room_status)"
                    text-color="white"
                    size="sm"
                    :label="$t(`chat.management.statuses.${room.room_status}`)"
                  />
                </div>
              </div>
              <div class="col-auto">
                <q-btn flat round dense icon="more_vert" size="sm">
                  <q-menu>
                    <q-list style="min-width: 180px">
                      <q-item clickable @click="openChat(room)">
                        <q-item-section avatar>
                          <q-icon name="chat" color="primary" />
                        </q-item-section>
                        <q-item-section>{{ $t('chat.management.openChat') }}</q-item-section>
                      </q-item>

                      <q-separator />

                      <q-item v-if="!room.assigned_staff_id" clickable @click="quickAssign(room)">
                        <q-item-section avatar>
                          <q-icon name="person_add" color="orange" />
                        </q-item-section>
                        <q-item-section>{{ $t('chat.management.assign') }}</q-item-section>
                      </q-item>

                      <q-item v-if="room.assigned_staff_id" clickable @click="quickReassign(room)">
                        <q-item-section avatar>
                          <q-icon name="swap_horiz" color="purple" />
                        </q-item-section>
                        <q-item-section>{{ $t('chat.management.reassign') }}</q-item-section>
                      </q-item>

                      <q-separator />

                      <q-item
                        v-if="room.room_status === 'active'"
                        clickable
                        @click="quickClose(room)"
                      >
                        <q-item-section avatar>
                          <q-icon name="close" color="negative" />
                        </q-item-section>
                        <q-item-section>{{ $t('chat.management.close') }}</q-item-section>
                      </q-item>

                      <q-item clickable @click="quickDelete(room)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>{{ $t('chat.management.delete') }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>

            <!-- Client Info -->
            <div class="row items-center q-mb-sm">
              <q-avatar size="32px" color="primary" text-color="white" class="q-mr-sm">
                <q-icon name="person" />
              </q-avatar>
              <div>
                <div class="text-weight-medium">{{ room.client_name }}</div>
                <div class="text-caption text-grey-6">{{ room.client_email }}</div>
              </div>
            </div>

            <!-- Ticket Info -->
            <div v-if="room.ticket_number" class="q-mb-sm">
              <q-chip
                color="orange"
                text-color="white"
                icon="confirmation_number"
                size="sm"
                :label="`#${room.ticket_number}`"
              />
              <div class="text-caption text-grey-7 q-mt-xs">{{ room.ticket_title }}</div>
            </div>

            <!-- Assignment -->
            <div class="q-mb-sm">
              <div v-if="room.assigned_staff_name" class="row items-center">
                <q-icon name="support_agent" color="green" size="16px" class="q-mr-xs" />
                <span class="text-caption text-green-8">{{ room.assigned_staff_name }}</span>
              </div>
              <div v-else class="row items-center">
                <q-icon name="assignment_late" color="orange" size="16px" class="q-mr-xs" />
                <span class="text-caption text-orange-8">{{
                  $t('chat.management.unassigned')
                }}</span>
              </div>
            </div>

            <!-- Messages Info -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center">
                <q-icon name="chat" color="grey-6" size="16px" class="q-mr-xs" />
                <span class="text-caption text-grey-6">
                  {{ room.total_messages }} {{ $t('chat.management.messages') }}
                </span>
              </div>
              <q-badge
                v-if="room.unread_client_messages > 0"
                color="red"
                :label="room.unread_client_messages"
              />
            </div>

            <!-- Last Message -->
            <div v-if="room.last_message" class="q-mb-sm">
              <div class="text-caption text-grey-8 last-message-preview">
                <q-icon
                  :name="room.last_message.sender_type === 'staff' ? 'support_agent' : 'person'"
                  size="14px"
                  class="q-mr-xs"
                />
                {{ truncateText(room.last_message.message_text, 60) }}
              </div>
            </div>

            <!-- Timestamps -->
            <div class="row items-center justify-between text-caption text-grey-6">
              <div>
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ formatDateTime(room.created_at) }}
              </div>
              <div v-if="room.last_message_at">
                {{ formatRelativeTime(room.last_message_at) }}
              </div>
            </div>
          </q-card-section>

          <!-- Quick Actions -->
          <q-card-actions class="q-pt-none">
            <q-btn
              flat
              size="sm"
              icon="chat"
              :label="$t('chat.management.openChat')"
              @click="openChat(room)"
              color="primary"
            />
            <q-space />
            <q-btn
              v-if="!room.assigned_staff_id"
              flat
              size="sm"
              icon="person_add"
              @click="quickAssign(room)"
              color="orange"
            >
              <q-tooltip>{{ $t('chat.management.assign') }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="room.room_status === 'active'"
              flat
              size="sm"
              icon="close"
              @click="quickClose(room)"
              color="negative"
            >
              <q-tooltip>{{ $t('chat.management.close') }}</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center q-py-xl">
      <q-icon name="forum" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">
        {{ $t('chat.management.noChats') }}
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="row justify-center q-mt-md">
      <q-pagination
        v-model="pagination.page"
        :max="pagination.totalPages"
        :max-pages="6"
        direction-links
        boundary-links
        @update:model-value="onPageChange"
      />
    </div>

    <!-- Chat Dialog -->
    <q-dialog
      v-model="chatDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <staff-chat-dialog
        v-if="selectedChatRoom"
        :room="selectedChatRoom"
        @close="closeChatDialog"
        @room-updated="onRoomUpdated"
      />
    </q-dialog>

    <!-- Bulk Assign Dialog -->
    <q-dialog v-model="showBulkAssignDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.management.bulkAssign') }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="bulkAssignData.staff_id"
            :options="availableStaffOptions"
            :label="$t('chat.management.selectStaff')"
            emit-value
            map-options
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showBulkAssignDialog = false" />
          <q-btn
            color="primary"
            :label="$t('common.assign')"
            @click="performBulkAssign"
            :loading="bulkAssigning"
            :disable="!bulkAssignData.staff_id"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bulk Close Dialog -->
    <q-dialog v-model="showBulkCloseDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.management.bulkClose') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="bulkCloseData.reason"
            :label="$t('chat.management.closeReason')"
            type="textarea"
            outlined
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showBulkCloseDialog = false" />
          <q-btn
            color="negative"
            :label="$t('common.close')"
            @click="performBulkClose"
            :loading="bulkClosing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bulk Delete Dialog -->
    <q-dialog v-model="showBulkDeleteDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('chat.management.bulkDelete') }}</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            {{ $t('chat.management.bulkDeleteWarning') }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showBulkDeleteDialog = false" />
          <q-btn
            color="negative"
            :label="$t('common.delete')"
            @click="performBulkDelete"
            :loading="bulkDeleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Search Dialog -->
    <q-dialog v-model="showSearchDialog">
      <chat-search-dialog @close="showSearchDialog = false" @select-room="openChatFromSearch" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { date, Notify } from 'quasar'
import { ChatApi } from 'src/api/chat'
import StaffChatDialog from 'components/chat/StaffChatDialog.vue'
import ChatSearchDialog from 'components/chat/ChatSearchDialog.vue'

const { t: $t } = useI18n()

// Reactive data
const chatRooms = ref([])
const selectedRooms = ref([])
const metrics = ref({})
const availableStaff = ref([])
const loading = ref(false)
const chatDialog = ref(false)
const selectedChatRoom = ref(null)
const showBulkAssignDialog = ref(false)
const showBulkCloseDialog = ref(false)
const showBulkDeleteDialog = ref(false)
const showSearchDialog = ref(false)
const bulkAssigning = ref(false)
const bulkClosing = ref(false)
const bulkDeleting = ref(false)

const filter = ref({
  status: null,
  assigned_to: null,
  room_type: null,
  search: '',
})

const bulkAssignData = ref({
  staff_id: null,
})

const bulkCloseData = ref({
  reason: '',
})

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
  totalPages: 0,
})

let searchTimeout = null

// Computed
const statusOptions = computed(() => [
  { label: $t('chat.management.statuses.active'), value: 'active' },
  { label: $t('chat.management.statuses.closed'), value: 'closed' },
  { label: $t('chat.management.statuses.archived'), value: 'archived' },
])

const roomTypeOptions = computed(() => [
  { label: $t('chat.management.roomTypes.support'), value: 'support' },
  { label: $t('chat.management.roomTypes.ticket'), value: 'ticket' },
])

const staffOptions = computed(() => [
  { label: $t('chat.management.unassigned'), value: 'unassigned' },
  ...availableStaff.value.map((staff) => ({
    label: `${staff.name} (${staff.active_chats})`,
    value: staff.id,
  })),
])

const availableStaffOptions = computed(() =>
  availableStaff.value.map((staff) => ({
    label: `${staff.name} (${staff.active_chats} активних)`,
    value: staff.id,
  })),
)

// Methods
const loadMetrics = async () => {
  try {
    const response = await ChatApi.getChatMetrics()
    if (response.data.success) {
      metrics.value = response.data.metrics
    }
  } catch (error) {
    console.error('Error loading metrics:', error)
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

const loadRooms = async () => {
  try {
    loading.value = true

    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...filter.value,
    }

    // Remove empty filters
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === '') {
        delete params[key]
      }
    })

    const response = await ChatApi.getRoomsForStaff(params)

    if (response.data.success) {
      chatRooms.value = response.data.rooms
      pagination.value.rowsNumber = response.data.pagination.total
      pagination.value.totalPages = response.data.pagination.totalPages
    }
  } catch (error) {
    console.error('Error loading rooms:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.management.loadError'),
    })
  } finally {
    loading.value = false
  }
}

const onPageChange = (page) => {
  pagination.value.page = page
  loadRooms()
}

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadRooms()
  }, 500)
}

const refreshData = () => {
  loadMetrics()
  loadRooms()
  loadAvailableStaff()
  selectedRooms.value = []
}

const toggleRoomSelection = (room) => {
  const index = selectedRooms.value.findIndex((r) => r.id === room.id)
  if (index >= 0) {
    selectedRooms.value.splice(index, 1)
  } else {
    selectedRooms.value.push(room)
  }
}

const openChat = (room) => {
  selectedChatRoom.value = room
  chatDialog.value = true
}

const openChatFromSearch = (room) => {
  showSearchDialog.value = false
  openChat(room)
}

const closeChatDialog = () => {
  chatDialog.value = false
  selectedChatRoom.value = null
  refreshData()
}

const onRoomUpdated = () => {
  refreshData()
}

const quickAssign = (room) => {
  selectedRooms.value = [room]
  showBulkAssignDialog.value = true
}

const quickReassign = (room) => {
  selectedRooms.value = [room]
  bulkAssignData.value.staff_id = room.assigned_staff_id
  showBulkAssignDialog.value = true
}

const quickClose = (room) => {
  selectedRooms.value = [room]
  showBulkCloseDialog.value = true
}

const quickDelete = (room) => {
  selectedRooms.value = [room]
  showBulkDeleteDialog.value = true
}

const performBulkAssign = async () => {
  try {
    bulkAssigning.value = true

    const response = await ChatApi.bulkAssignRooms({
      room_ids: selectedRooms.value.map((r) => r.id),
      assigned_to: bulkAssignData.value.staff_id,
    })

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.management.bulkAssignSuccess', { count: response.data.updated_count }),
      })

      showBulkAssignDialog.value = false
      selectedRooms.value = []
      bulkAssignData.value.staff_id = null
      refreshData()
    }
  } catch (error) {
    console.error('Error bulk assigning:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.management.bulkAssignError'),
    })
  } finally {
    bulkAssigning.value = false
  }
}

const performBulkClose = async () => {
  try {
    bulkClosing.value = true

    const response = await ChatApi.bulkCloseRooms({
      room_ids: selectedRooms.value.map((r) => r.id),
      close_reason: bulkCloseData.value.reason,
    })

    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: $t('chat.management.bulkCloseSuccess', { count: response.data.closed_count }),
      })

      showBulkCloseDialog.value = false
      selectedRooms.value = []
      bulkCloseData.value.reason = ''
      refreshData()
    }
  } catch (error) {
    console.error('Error bulk closing:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.management.bulkCloseError'),
    })
  } finally {
    bulkClosing.value = false
  }
}

const performBulkDelete = async () => {
  try {
    bulkDeleting.value = true

    // Delete each room individually since we don't have bulk delete endpoint
    const promises = selectedRooms.value.map((room) => ChatApi.deleteRoom(room.id))

    await Promise.all(promises)

    Notify.create({
      type: 'positive',
      message: $t('chat.management.bulkDeleteSuccess', { count: selectedRooms.value.length }),
    })

    showBulkDeleteDialog.value = false
    selectedRooms.value = []
    refreshData()
  } catch (error) {
    console.error('Error bulk deleting:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.management.bulkDeleteError'),
    })
  } finally {
    bulkDeleting.value = false
  }
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    closed: 'grey',
    archived: 'purple',
  }
  return colors[status] || 'grey'
}

const formatDateTime = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const formatRelativeTime = (dateString) => {
  const now = new Date()
  const messageDate = new Date(dateString)
  const diffMinutes = Math.floor((now - messageDate) / (1000 * 60))

  if (diffMinutes < 1) return $t('common.justNow')
  if (diffMinutes < 60) return $t('common.minutesAgo', { minutes: diffMinutes })
  if (diffMinutes < 1440) return $t('common.hoursAgo', { hours: Math.floor(diffMinutes / 60) })

  return date.formatDate(messageDate, 'DD.MM HH:mm')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Handle URL parameters for direct room access
const handleUrlParameters = () => {
  const route = useRoute()
  const openRoomId = route.query.openRoom

  if (openRoomId) {
    const room = chatRooms.value.find((r) => r.id == openRoomId)
    if (room) {
      openChat(room)
    } else {
      loadSpecificRoom(openRoomId)
    }
  }
}

const loadSpecificRoom = async (roomId) => {
  try {
    const response = await ChatApi.getRoomsForStaff({
      room_id: roomId,
      limit: 1,
    })

    if (response.data.success && response.data.rooms.length > 0) {
      const room = response.data.rooms[0]
      openChat(room)
    } else {
      Notify.create({
        type: 'warning',
        message: $t('chat.management.roomNotFound'),
      })
    }
  } catch (error) {
    console.error('Error loading specific room:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.management.loadError'),
    })
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  await nextTick()
  handleUrlParameters()
})
</script>

<style scoped>
.metrics-card {
  min-height: 120px;
  transition: transform 0.2s;
}

.metrics-card:hover {
  transform: translateY(-2px);
}

.chat-room-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.chat-room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.selected-card {
  border-color: #1976d2 !important;
  background: #f3f8ff !important;
}

.last-message-preview {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
  border-left: 3px solid #e0e0e0;
}

/* Dark mode support */
.body--dark .selected-card {
  border-color: #90caf9 !important;
  background: rgba(25, 118, 210, 0.1) !important;
}

.body--dark .last-message-preview {
  background: #424242;
  border-left-color: #616161;
}
</style>
