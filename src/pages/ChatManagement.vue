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
        <q-card flat bordered class="metrics-card">
          <q-card-section class="text-center">
            <div class="text-h4 text-primary">{{ metrics.active_chats || 0 }}</div>
            <div class="text-caption text-grey-7">{{ $t('chat.management.activeChats') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-orange">{{ metrics.unassigned_chats || 0 }}</div>
            <div class="text-caption text-grey-7">{{ $t('chat.management.unassignedChats') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-red">{{ metrics.unread_messages || 0 }}</div>
            <div class="text-caption text-grey-7">{{ $t('chat.management.unreadMessages') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-green">{{ metrics.closed_today || 0 }}</div>
            <div class="text-caption text-grey-7">{{ $t('chat.management.closedToday') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-blue">{{ metrics.created_today || 0 }}</div>
            <div class="text-caption text-grey-7">{{ $t('chat.management.createdToday') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-2 col-sm-4 col-6">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-purple">
              {{
                metrics.avg_resolution_time_minutes
                  ? Math.round(metrics.avg_resolution_time_minutes)
                  : 0
              }}м
            </div>
            <div class="text-caption text-grey-7">
              {{ $t('chat.management.avgResolutionTime') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-gutter-md">
      <!-- Chat Rooms List -->
      <div class="col-md-8 col-12">
        <q-card flat bordered>
          <!-- Filters -->
          <q-card-section class="q-pb-none">
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

          <!-- Bulk Actions -->
          <q-card-section v-if="selectedRooms.length > 0" class="bg-blue-1 q-py-sm">
            <div class="row items-center">
              <div class="col">
                <span class="text-weight-medium">
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
                  class="q-mr-sm"
                />
                <q-btn
                  flat
                  dense
                  icon="close"
                  :label="$t('chat.management.bulkClose')"
                  @click="showBulkCloseDialog = true"
                  color="negative"
                />
              </div>
            </div>
          </q-card-section>

          <!-- Rooms Table -->
          <q-table
            :rows="chatRooms"
            :columns="tableColumns"
            :loading="loading"
            :pagination="tablePagination"
            @request="onTableRequest"
            selection="multiple"
            v-model:selected="selectedRooms"
            row-key="id"
            flat
            :rows-per-page-options="[10, 20, 50]"
          >
            <template v-slot:body-cell-client="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.client_name }}</div>
                <div class="text-caption text-grey-7">{{ props.row.client_email }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.room_type === 'ticket' ? 'orange' : 'primary'"
                  text-color="white"
                  size="sm"
                  :icon="props.row.room_type === 'ticket' ? 'confirmation_number' : 'support_agent'"
                  :label="$t(`chat.management.roomTypes.${props.row.room_type}`)"
                />
                <div v-if="props.row.ticket_number" class="text-caption q-mt-xs">
                  #{{ props.row.ticket_number }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="getStatusColor(props.row.room_status)"
                  text-color="white"
                  size="sm"
                  :label="$t(`chat.management.statuses.${props.row.room_status}`)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-assigned="props">
              <q-td :props="props">
                <div v-if="props.row.assigned_staff_name" class="text-weight-medium">
                  {{ props.row.assigned_staff_name }}
                </div>
                <div v-else class="text-grey-6 text-italic">
                  {{ $t('chat.management.unassigned') }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-messages="props">
              <q-td :props="props">
                <div class="text-center">
                  <div class="text-weight-medium">{{ props.row.total_messages }}</div>
                  <q-badge
                    v-if="props.row.unread_client_messages > 0"
                    color="red"
                    :label="props.row.unread_client_messages"
                    class="q-mt-xs"
                  />
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-last_message="props">
              <q-td :props="props">
                <div v-if="props.row.last_message" class="last-message">
                  <div class="text-caption text-grey-8">
                    {{ truncateText(props.row.last_message.message_text, 50) }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ formatDateTime(props.row.last_message.created_at) }}
                  </div>
                </div>
                <div v-else class="text-grey-6 text-italic text-caption">
                  {{ $t('chat.management.noMessages') }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat round dense icon="chat" @click="openChat(props.row)" color="primary">
                  <q-tooltip>{{ $t('chat.management.openChat') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="!props.row.assigned_staff_id"
                  flat
                  round
                  dense
                  icon="person_add"
                  @click="quickAssign(props.row)"
                  color="orange"
                >
                  <q-tooltip>{{ $t('chat.management.assign') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.room_status === 'active'"
                  flat
                  round
                  dense
                  icon="close"
                  @click="quickClose(props.row)"
                  color="negative"
                >
                  <q-tooltip>{{ $t('chat.management.close') }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- Staff Workload -->
      <div class="col-md-4 col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('chat.management.staffWorkload') }}</div>

            <q-list>
              <q-item v-for="staff in staffWorkload" :key="staff.id" dense>
                <q-item-section avatar>
                  <q-avatar size="32px" color="primary" text-color="white">
                    {{ getInitials(staff.staff_name) }}
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ staff.staff_name }}</q-item-label>
                  <q-item-label caption>{{ staff.email }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-right">
                    <div class="text-weight-medium">{{ staff.active_chats }}</div>
                    <q-badge
                      v-if="staff.unread_messages > 0"
                      color="red"
                      :label="staff.unread_messages"
                      class="q-mt-xs"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
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
const staffWorkload = ref([])
const availableStaff = ref([])
const loading = ref(false)
const chatDialog = ref(false)
const selectedChatRoom = ref(null)
const showBulkAssignDialog = ref(false)
const showBulkCloseDialog = ref(false)
const showSearchDialog = ref(false)
const bulkAssigning = ref(false)
const bulkClosing = ref(false)

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

const tablePagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
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

const tableColumns = computed(() => [
  {
    name: 'client',
    label: $t('chat.management.table.client'),
    field: 'client_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: $t('chat.management.table.type'),
    field: 'room_type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'status',
    label: $t('chat.management.table.status'),
    field: 'room_status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'assigned',
    label: $t('chat.management.table.assigned'),
    field: 'assigned_staff_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'messages',
    label: $t('chat.management.table.messages'),
    field: 'total_messages',
    align: 'center',
    sortable: true,
  },
  {
    name: 'last_message',
    label: $t('chat.management.table.lastMessage'),
    field: 'last_message',
    align: 'left',
    style: 'max-width: 200px',
  },
  {
    name: 'created_at',
    label: $t('chat.management.table.created'),
    field: 'created_at',
    align: 'center',
    sortable: true,
    format: (val) => formatDateTime(val),
  },
  {
    name: 'actions',
    label: $t('common.actions'),
    field: 'actions',
    align: 'center',
  },
])

// Methods
const loadMetrics = async () => {
  try {
    const response = await ChatApi.getChatMetrics()
    if (response.data.success) {
      metrics.value = response.data.metrics
      staffWorkload.value = response.data.staff_workload || []
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
      page: tablePagination.value.page,
      limit: tablePagination.value.rowsPerPage,
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
      tablePagination.value.rowsNumber = response.data.pagination.total
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

const onTableRequest = (props) => {
  tablePagination.value.page = props.pagination.page
  tablePagination.value.rowsPerPage = props.pagination.rowsPerPage
  loadRooms()
}

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    tablePagination.value.page = 1
    loadRooms()
  }, 500)
}

const refreshData = () => {
  loadMetrics()
  loadRooms()
  loadAvailableStaff()
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

const quickClose = (room) => {
  selectedRooms.value = [room]
  showBulkCloseDialog.value = true
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

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Handle URL parameters for direct room access
const handleUrlParameters = () => {
  const route = useRoute()
  const openRoomId = route.query.openRoom

  if (openRoomId) {
    // Знайти кімнату в списку та відкрити її
    const room = chatRooms.value.find((r) => r.id == openRoomId)
    if (room) {
      openChat(room)
    } else {
      // Якщо кімната не знайдена в поточному списку, спробувати завантажити її
      loadSpecificRoom(openRoomId)
    }
  }
}

const loadSpecificRoom = async (roomId) => {
  try {
    // Завантажити конкретну кімнату по ID
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
  // Спочатку завантажуємо дані
  await refreshData() // це завантажує loadRooms()

  // Потім обробляємо URL параметри
  await nextTick()
  handleUrlParameters()
})
</script>

<style scoped>
.last-message {
  max-width: 200px;
}

.q-table tbody td {
  vertical-align: top;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .last-message {
    max-width: 150px;
  }
}
/* Вирівнювання карток метрик */
.row.q-gutter-md .col-md-2 {
  display: flex;
}

.row.q-gutter-md .col-md-2 .q-card {
  width: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
}

.row.q-gutter-md .col-md-2 .q-card .q-card-section {
  width: 100%;
  padding: 16px;
}

/* Забезпечуємо однаковий розмір для всіх карток метрик */
.metrics-card {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metrics-card .q-card-section {
  width: 100%;
  text-align: center;
}

/* Вирівнювання тексту в картках */
.metrics-card .text-h4 {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 8px;
}

.metrics-card .text-caption {
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>
