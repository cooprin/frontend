<template>
  <q-page padding>
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-md">
          <div class="col-auto">
            <div class="text-h5">
              {{ $t('portal.pages.tickets.title') }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="add"
              :label="$t('portal.pages.tickets.createNew')"
              @click="showCreateDialog = true"
            />
          </div>
        </div>

        <!-- Filters -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('tickets.filters.status')"
                  clearable
                  emit-value
                  map-options
                  dense
                  @update:model-value="loadTickets"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="filters.priority"
                  :options="priorityOptions"
                  :label="$t('tickets.filters.priority')"
                  clearable
                  emit-value
                  map-options
                  dense
                  @update:model-value="loadTickets"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="filters.category_id"
                  :options="categoryOptions"
                  :label="$t('tickets.filters.category')"
                  clearable
                  emit-value
                  map-options
                  dense
                  @update:model-value="loadTickets"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="40px" color="primary" />
          <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
        </div>

        <!-- Tickets List -->
        <div v-else-if="tickets.length > 0">
          <q-card
            v-for="ticket in tickets"
            :key="ticket.id"
            class="ticket-card q-mb-md"
            bordered
            clickable
            @click="goToTicketDetails(ticket.id)"
          >
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="row items-center q-gutter-sm">
                    <div class="text-h6 text-weight-bold">#{{ ticket.ticket_number }}</div>
                    <q-chip
                      :color="getStatusColor(ticket.status)"
                      text-color="white"
                      :label="$t(`tickets.statuses.${ticket.status}`)"
                      dense
                    />
                    <q-chip
                      :color="getPriorityColor(ticket.priority)"
                      text-color="white"
                      :label="$t(`tickets.priorities.${ticket.priority}`)"
                      dense
                      outline
                    />
                  </div>
                  <div class="text-subtitle1 q-mt-sm">
                    {{ ticket.title }}
                  </div>
                  <div class="text-body2 text-grey-7 q-mt-xs">
                    {{ truncateText(ticket.description, 100) }}
                  </div>
                </div>
                <div class="col-auto text-right">
                  <div class="text-caption text-grey-6">
                    {{ formatDate(ticket.created_at) }}
                  </div>
                  <div v-if="ticket.comments_count > 0" class="text-caption text-grey-6 q-mt-xs">
                    <q-icon name="chat" size="16px" />
                    {{ ticket.comments_count }} {{ $t('tickets.comments.title').toLowerCase() }}
                  </div>
                </div>
              </div>

              <!-- Category and Object -->
              <div class="row q-gutter-sm q-mt-sm">
                <q-chip
                  v-if="ticket.category_name"
                  size="sm"
                  :style="{ backgroundColor: ticket.category_color }"
                  text-color="white"
                  :label="
                    ticket.category_name.startsWith('tickets.')
                      ? $t(ticket.category_name)
                      : ticket.category_name
                  "
                />
                <q-chip
                  v-if="ticket.object_name"
                  size="sm"
                  color="grey-5"
                  text-color="grey-8"
                  icon="directions_car"
                  :label="ticket.object_name"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Pagination -->
          <div class="row justify-center q-mt-md" v-if="pagination.totalPages > 1">
            <q-pagination
              v-model="pagination.page"
              :max="pagination.totalPages"
              :max-pages="6"
              boundary-links
              @update:model-value="loadTickets"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="support_agent" size="80px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">
            {{ $t('portal.pages.tickets.noTickets') }}
          </div>
          <q-btn
            color="primary"
            :label="$t('portal.pages.tickets.createNew')"
            @click="showCreateDialog = true"
            class="q-mt-md"
          />
        </div>
      </div>
    </div>

    <!-- Create Ticket Dialog -->
    <TicketCreateDialog
      v-model="showCreateDialog"
      :categories="categories"
      :objects="userObjects"
      :preselected-object-id="$route.query.object_id"
      @created="onTicketCreated"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TicketsApi } from 'src/api/tickets'
import { PortalApi } from 'src/api/portal'
import { date, Notify } from 'quasar'
import TicketCreateDialog from 'components/portal/TicketCreateDialog.vue'

const router = useRouter()
const route = useRoute()
const { t: $t } = useI18n()

const tickets = ref([])
const categories = ref([])
const userObjects = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)

const filters = ref({
  status: null,
  priority: null,
  category_id: null,
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

// Options for filters
const statusOptions = computed(() => [
  { label: 'Відкрита', value: 'open' },
  { label: 'В роботі', value: 'in_progress' },
  { label: 'Очікує клієнта', value: 'waiting_client' },
  { label: 'Вирішена', value: 'resolved' },
  { label: 'Закрита', value: 'closed' },
])

const priorityOptions = computed(() => [
  { label: 'Низький', value: 'low' },
  { label: 'Середній', value: 'medium' },
  { label: 'Високий', value: 'high' },
  { label: 'Терміновий', value: 'urgent' },
])

const categoryOptions = computed(() =>
  categories.value.map((cat) => ({
    label: cat.name.startsWith('tickets.') ? $t(cat.name) : cat.name,
    value: cat.id,
  })),
)

const getStatusColor = (status) => {
  const colors = {
    open: 'blue',
    in_progress: 'orange',
    waiting_client: 'purple',
    resolved: 'green',
    closed: 'grey',
    cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple',
  }
  return colors[priority] || 'grey'
}

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const goToTicketDetails = (ticketId) => {
  router.push({ name: 'portal-ticket-details', params: { id: ticketId } })
}

const loadTickets = async () => {
  try {
    loading.value = true

    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value,
    }

    const response = await TicketsApi.getTickets(params)

    if (response.data.success) {
      tickets.value = response.data.tickets
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Error loading tickets:', error)
    Notify.create({
      type: 'negative',
      message: 'Помилка завантаження заявок',
    })
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await TicketsApi.getCategories()
    if (response.data.success) {
      categories.value = response.data.categories
    }
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const loadUserObjects = async () => {
  try {
    const response = await PortalApi.getObjects()
    if (response.data.success) {
      userObjects.value = response.data.objects
    }
  } catch (error) {
    console.error('Error loading objects:', error)
  }
}

const onTicketCreated = () => {
  showCreateDialog.value = false
  loadTickets()
  Notify.create({
    type: 'positive',
    message: 'Заявку успішно створено',
  })
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadUserObjects(), loadTickets()])

  // Check if we need to show create dialog
  if (route.query.action === 'create') {
    showCreateDialog.value = true
  }
})
</script>

<style scoped>
.ticket-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
