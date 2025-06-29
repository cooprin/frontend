<template>
  <q-card style="min-width: 600px; max-width: 800px">
    <!-- Header -->
    <q-card-section class="bg-primary text-white">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6">{{ $t('chat.search.title') }}</div>
        </div>
        <div class="col-auto">
          <q-btn flat round icon="close" @click="$emit('close')" />
        </div>
      </div>
    </q-card-section>

    <!-- Search Input -->
    <q-card-section>
      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            v-model="searchQuery"
            :placeholder="$t('chat.search.placeholder')"
            outlined
            autofocus
            @update:model-value="onSearchChange"
            :loading="searching"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-auto">
          <q-select
            v-model="searchType"
            :options="searchTypeOptions"
            :label="$t('chat.search.searchIn')"
            emit-value
            map-options
            outlined
            dense
            style="min-width: 150px"
            @update:model-value="performSearch"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Search Results -->
    <q-card-section style="max-height: 500px" class="q-pa-none">
      <!-- Loading -->
      <div v-if="searching" class="text-center q-pa-xl">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-grey-7">{{ $t('chat.search.searching') }}</div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!searchQuery || searchQuery.length < 2" class="text-center q-pa-xl">
        <q-icon name="search" size="64px" color="grey-4" />
        <div class="text-grey-6 q-mt-md">{{ $t('chat.search.enterQuery') }}</div>
        <div class="text-caption text-grey-5 q-mt-sm">
          {{ $t('chat.search.minChars') }}
        </div>
      </div>

      <!-- No results -->
      <div
        v-else-if="
          !searching && searchResults.rooms.length === 0 && searchResults.messages.length === 0
        "
        class="text-center q-pa-xl"
      >
        <q-icon name="search_off" size="64px" color="grey-4" />
        <div class="text-grey-6 q-mt-md">{{ $t('chat.search.noResults') }}</div>
        <div class="text-caption text-grey-5 q-mt-sm">
          {{ $t('chat.search.tryDifferent') }}
        </div>
      </div>

      <!-- Results -->
      <div v-else>
        <!-- Chat Rooms Results -->
        <div v-if="searchResults.rooms.length > 0">
          <q-separator />
          <q-item-label header class="text-weight-bold text-primary q-px-md">
            <q-icon name="forum" class="q-mr-sm" />
            {{ $t('chat.search.chatRooms') }} ({{ searchResults.rooms.length }})
          </q-item-label>

          <q-list>
            <q-item
              v-for="room in searchResults.rooms"
              :key="`room-${room.id}`"
              clickable
              v-ripple
              @click="selectRoom(room)"
              class="search-result-item"
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
                  {{ room.client_name }}
                  <q-chip
                    v-if="room.room_status !== 'active'"
                    size="sm"
                    :color="getStatusColor(room.room_status)"
                    text-color="white"
                    :label="$t(`chat.management.statuses.${room.room_status}`)"
                    class="q-ml-sm"
                  />
                </q-item-label>

                <q-item-label caption class="text-grey-7">
                  {{ room.client_email }}
                </q-item-label>

                <q-item-label v-if="room.ticket_number" caption class="text-orange-8">
                  {{ $t('chat.search.ticket') }}: #{{ room.ticket_number }} -
                  {{ room.ticket_title }}
                </q-item-label>

                <q-item-label caption class="text-grey-6">
                  {{ $t('chat.search.created') }}: {{ formatDateTime(room.created_at) }}
                  <span v-if="room.assigned_staff_name" class="q-ml-md">
                    {{ $t('chat.search.assignedTo') }}: {{ room.assigned_staff_name }}
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="arrow_forward_ios" color="grey-5" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Messages Results -->
        <div v-if="searchResults.messages.length > 0">
          <q-separator v-if="searchResults.rooms.length > 0" />
          <q-item-label header class="text-weight-bold text-primary q-px-md">
            <q-icon name="message" class="q-mr-sm" />
            {{ $t('chat.search.messages') }} ({{ searchResults.messages.length }})
          </q-item-label>

          <q-list>
            <q-item
              v-for="message in searchResults.messages"
              :key="`message-${message.id}`"
              clickable
              v-ripple
              @click="selectMessage(message)"
              class="search-result-item"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="message.sender_type === 'staff' ? 'green' : 'blue'"
                  text-color="white"
                  :icon="message.sender_type === 'staff' ? 'support_agent' : 'person'"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ message.sender_name }}
                  <q-chip
                    size="sm"
                    :color="message.sender_type === 'staff' ? 'green' : 'blue'"
                    text-color="white"
                    :label="$t(`chat.search.${message.sender_type}`)"
                    class="q-ml-sm"
                  />
                </q-item-label>

                <q-item-label class="message-preview">
                  {{ highlightSearchTerm(message.message_text) }}
                </q-item-label>

                <q-item-label caption class="text-grey-7">
                  {{ $t('chat.search.client') }}: {{ message.client_name }}
                  <span v-if="message.room_type === 'ticket'" class="q-ml-md text-orange-8">
                    {{ $t('chat.search.inTicket') }}
                  </span>
                </q-item-label>

                <q-item-label caption class="text-grey-6">
                  {{ formatDateTime(message.created_at) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="arrow_forward_ios" color="grey-5" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>

    <!-- Search Stats -->
    <q-card-section
      v-if="searchResults.rooms.length > 0 || searchResults.messages.length > 0"
      class="bg-grey-2 q-py-sm"
    >
      <div class="text-caption text-grey-7 text-center">
        {{
          $t('chat.search.foundResults', {
            rooms: searchResults.rooms.length,
            messages: searchResults.messages.length,
          })
        }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { date, Notify } from 'quasar'
import { ChatApi } from 'src/api/chat'

const { t: $t } = useI18n()

// Emits
const emit = defineEmits(['close', 'select-room'])

// Reactive data
const searchQuery = ref('')
const searchType = ref('all')
const searching = ref(false)
const searchResults = ref({
  rooms: [],
  messages: [],
})

let searchTimeout = null

// Computed
const searchTypeOptions = computed(() => [
  { label: $t('chat.search.types.all'), value: 'all' },
  { label: $t('chat.search.types.rooms'), value: 'rooms' },
  { label: $t('chat.search.types.messages'), value: 'messages' },
])

// Methods
const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (searchQuery.value.length < 2) {
    searchResults.value = { rooms: [], messages: [] }
    return
  }

  searchTimeout = setTimeout(() => {
    performSearch()
  }, 500)
}

const performSearch = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) return

  try {
    searching.value = true

    const response = await ChatApi.searchChats({
      query: searchQuery.value,
      search_type: searchType.value,
      limit: 20,
    })

    if (response.data.success) {
      searchResults.value = response.data.results
    }
  } catch (error) {
    console.error('Error searching chats:', error)
    Notify.create({
      type: 'negative',
      message: $t('chat.search.error'),
    })
  } finally {
    searching.value = false
  }
}

const selectRoom = (room) => {
  emit('select-room', room)
}

const selectMessage = (message) => {
  // Find the room and emit it
  // In a real implementation, you might need to fetch the full room data
  const room = {
    id: message.room_id,
    client_name: message.client_name,
    room_type: message.room_type,
  }
  emit('select-room', room)
}

const highlightSearchTerm = (text) => {
  if (!searchQuery.value) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
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
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}
</script>

<style scoped>
.search-result-item {
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.message-preview {
  font-size: 14px;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-preview :deep(mark) {
  background-color: #fff3cd;
  padding: 1px 2px;
  border-radius: 2px;
}

/* Dark mode support */
.body--dark .search-result-item:hover {
  background-color: #424242;
}

.body--dark .message-preview :deep(mark) {
  background-color: #8a6d3b;
  color: white;
}
</style>
