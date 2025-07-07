<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <!-- Welcome Section -->
      <div class="col-12">
        <q-card class="welcome-card">
          <q-card-section>
            <div class="text-h5 text-weight-bold">
              {{ $t('portal.pages.dashboard.welcome') }}
            </div>
            <div class="text-subtitle1 text-grey-7">
              {{ userStore.user?.name }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistics Cards Row -->
      <div class="col-12">
        <div class="row q-gutter-md">
          <!-- Objects Card -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              class="stat-card stat-card-size"
              :class="{ 'problematic-card': hasProblematicObjects }"
            >
              <q-card-section class="stat-card-content">
                <q-icon name="directions_car" size="48px" color="primary" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ statistics.objectsCount || 0 }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  {{ $t('portal.pages.dashboard.objectsCount') }}
                </div>
                <!-- Problematic objects indicator - показуємо тільки після завантаження -->
                <div v-if="realTimeDataLoaded && problematicObjectsCount > 0" class="q-mt-xs">
                  <q-chip color="negative" text-color="white" icon="warning" size="sm" dense>
                    {{ problematicObjectsCount }}
                    {{ $t('portal.pages.dashboard.problematicObjects') }}
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Unpaid Invoices Card -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card stat-card-size">
              <q-card-section class="stat-card-content">
                <q-icon name="receipt" size="48px" color="orange" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ statistics.unpaidInvoices || 0 }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  {{ $t('portal.pages.dashboard.unpaidInvoices') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Open Tickets Card -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card stat-card-size">
              <q-card-section class="stat-card-content">
                <q-icon name="support_agent" size="48px" color="green" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ statistics.openTickets || 0 }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  {{ $t('portal.pages.dashboard.openTickets') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Last Activity Card -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card stat-card-size">
              <q-card-section class="stat-card-content">
                <q-icon name="schedule" size="48px" color="purple" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ lastActivity }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  {{ $t('portal.pages.dashboard.lastActivity') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-md-6">
        <q-card class="content-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('common.quickActions') }}</div>
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="add"
                :label="$t('tickets.createNew')"
                @click="$router.push('/portal/tickets')"
              />
              <q-btn
                color="secondary"
                icon="chat"
                :label="$t('portal.chat')"
                @click="$router.push('/portal/chat')"
              />
              <q-btn
                color="accent"
                icon="folder"
                :label="$t('portal.myDocuments')"
                @click="$router.push('/portal/documents')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-12 col-md-6">
        <q-card class="content-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('common.recentActivity') }}</div>
            <q-list v-if="recentActivity.length > 0" class="activity-list">
              <q-item v-for="item in recentActivity" :key="item.id">
                <q-item-section avatar>
                  <q-icon :name="item.icon" :color="item.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.title }}</q-item-label>
                  <q-item-label caption>{{ formatDate(item.date) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center text-grey-5 q-py-md">
              {{ $t('portal.messages.noData') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from 'stores/auth'
import { PortalApi } from 'src/api/portal'
import { TicketsApi } from 'src/api/tickets'
import { date } from 'quasar'
import SocketService from 'src/services/socketService'

const userStore = useAuthStore()

const statistics = ref({
  objectsCount: 0,
  unpaidInvoices: 0,
  openTickets: 0,
})

const recentActivity = ref([])
const loading = ref(false)
const objectsRealTimeData = ref([])
const objects = ref([])
const componentId = 'dashboard-page-' + Date.now()
const realTimeDataLoaded = ref(false)

// Helper function to check if object is problematic
const isObjectProblematic = (objectData, baseObjectData) => {
  if (!baseObjectData || baseObjectData.status !== 'active' || objectData.error) return true
  const lowSatellites = objectData.satellites < 5
  const lastMessageMinutes = getLastMessageMinutes(objectData.lastMessage)
  const oldMessage = lastMessageMinutes > 15
  return lowSatellites || oldMessage
}

const getLastMessageMinutes = (lastMessage) => {
  if (!lastMessage) return 999
  const now = new Date()
  const lastMsg = new Date(lastMessage)
  return Math.floor((now - lastMsg) / (1000 * 60))
}

const createEmptyRealTimeData = (object) => {
  return {
    objectId: object.id,
    wialonId: object.wialon_id,
    name: object.name,
    error: 'inactive_object',
    lastMessage: null,
    isMoving: false,
    speed: 0,
    satellites: 0,
    address: 'Object inactive',
    coordinates: { lat: 0, lon: 0 },
    last30min: {
      distance: 0,
      satelliteChanges: 0,
      messageCount: 0,
      speedChart: [],
      satelliteChart: [],
    },
  }
}

// Computed property for problematic objects count
const problematicObjectsCount = computed(() => {
  let count = 0

  // Check real-time objects
  objectsRealTimeData.value.forEach((objectData) => {
    const baseObject = objects.value.find((obj) => obj.id === objectData.objectId)
    if (baseObject && isObjectProblematic(objectData, baseObject)) {
      count++
    }
  })

  // Check inactive objects
  const realTimeObjectIds = objectsRealTimeData.value.map((rtd) => rtd.objectId)
  const inactiveObjects = objects.value.filter((obj) => !realTimeObjectIds.includes(obj.id))

  inactiveObjects.forEach((object) => {
    const emptyData = createEmptyRealTimeData(object)
    if (isObjectProblematic(emptyData, object)) {
      count++
    }
  })

  return count
})

// Computed property to check if objects card should blink
const hasProblematicObjects = computed(() => {
  return realTimeDataLoaded.value && problematicObjectsCount.value > 0
})

const handleObjectsRealTimeUpdate = (data) => {
  if (data && data.objectsData) {
    objectsRealTimeData.value = data.objectsData
  }
}

const connectToSocket = () => {
  SocketService.subscribe('objects:realtime_updated', handleObjectsRealTimeUpdate, componentId)
}

const disconnectFromSocket = () => {
  SocketService.unsubscribeAll(componentId)
}

// Load real-time data via HTTP
const loadRealTimeData = async () => {
  try {
    const response = await PortalApi.getObjectsRealTimeData()
    if (response.data.success) {
      objectsRealTimeData.value = response.data.objectsData
    }
  } catch (err) {
    console.error('Error loading real-time data:', err)
  } finally {
    realTimeDataLoaded.value = true
  }
}

// Load objects data
const loadObjects = async () => {
  try {
    const response = await PortalApi.getObjects()
    if (response.data.success) {
      objects.value = response.data.objects
    }
  } catch (err) {
    console.error('Error loading objects:', err)
  }
}

const lastActivity = computed(() => {
  if (recentActivity.value.length > 0) {
    const latest = recentActivity.value[0]
    return date.formatDate(latest.date, 'DD.MM')
  }
  return '-'
})

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const loadDashboardData = async () => {
  try {
    loading.value = true

    // Load profile to get objects count
    const profileResponse = await PortalApi.getProfile()
    if (profileResponse.data.success) {
      statistics.value.objectsCount = profileResponse.data.client.objects_count || 0
    }

    // Load unpaid invoices count
    const invoicesResponse = await PortalApi.getInvoices({ status: 'issued', limit: 100 })
    if (invoicesResponse.data.success) {
      // Фільтруємо тільки ті, що дійсно неоплачені
      const unpaidCount = invoicesResponse.data.invoices.filter(
        (invoice) => !invoice.payment_date,
      ).length
      statistics.value.unpaidInvoices = unpaidCount
    }

    // Load open tickets count
    const ticketsResponse = await TicketsApi.getTickets({
      status: ['open', 'in_progress', 'waiting_client'],
      limit: 5,
    })
    if (ticketsResponse.data.success) {
      statistics.value.openTickets = ticketsResponse.data.pagination?.total || 0

      // Use recent tickets as activity
      recentActivity.value = ticketsResponse.data.tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        date: ticket.created_at,
        icon: 'support_agent',
        color: 'primary',
      }))
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadDashboardData()

  // Load objects and real-time data
  await loadObjects()
  await loadRealTimeData()

  // Connect to socket for updates
  connectToSocket()
})

onUnmounted(() => {
  disconnectFromSocket()
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
}

/* Фіксовані розміри для всіх статистичних карток */
.stat-card-size {
  width: 100%;
  height: 200px;
}

.stat-card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Фіксовані розміри для контентних карток */
.content-card {
  height: 300px;
  width: 100%;
}

.activity-list {
  max-height: 200px;
  overflow-y: auto;
}

.problematic-card {
  animation: problematicPulse 2s infinite;
  border: 2px solid #f44336;
}

@keyframes problematicPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .stat-card-size {
    height: 160px;
  }
  .content-card {
    height: 250px;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .stat-card-size {
    height: 180px;
  }
  .content-card {
    height: 280px;
  }
}
</style>
