<template>
  <q-page padding>
    <div class="row">
      <div class="col-12">
        <div class="text-h5 q-mb-md">
          {{ $t('portal.pages.objects.title') }}
        </div>

        <!-- Controls row -->
        <div class="row items-center q-mb-md">
          <div class="col">
            <q-chip v-if="isSocketConnected" color="positive" text-color="white" icon="wifi" dense>
              {{ $t('portal.pages.objects.liveConnection') }}
            </q-chip>
          </div>
          <div class="col-auto">
            <!-- Filter button -->
            <q-btn
              :color="showOnlyProblematic ? 'negative' : 'grey-6'"
              :icon="showOnlyProblematic ? 'warning' : 'filter_list'"
              :label="
                showOnlyProblematic
                  ? $t('portal.pages.objects.filterProblematic')
                  : $t('portal.pages.objects.filterAll')
              "
              @click="toggleProblematicFilter"
              outline
              dense
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="40px" color="primary" />
          <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
        </div>

        <!-- Objects List -->
        <div v-else-if="objects.length > 0">
          <!-- Check if we have any objects to show after filtering -->
          <div
            v-if="
              filteredObjectsRealTimeData.length === 0 &&
              filteredInactiveObjects.length === 0 &&
              showOnlyProblematic
            "
            class="text-center q-py-xl"
          >
            <q-icon name="check_circle" size="80px" color="positive" />
            <div class="text-h6 text-positive q-mt-md">
              {{ $t('portal.pages.objects.noProblematicObjects') }}
            </div>
          </div>

          <!-- Show filtered objects -->
          <div v-else class="row q-gutter-md">
            <!-- Real-time Cards for active objects -->
            <div
              v-for="objectData in filteredObjectsRealTimeData"
              :key="objectData.objectId"
              class="col-12 col-md-6 col-lg-4"
            >
              <ObjectRealTimeCard
                :object-data="objectData"
                :base-object-data="getBaseObjectData(objectData.objectId)"
                @create-ticket="createTicketForObject"
              />
            </div>

            <!-- Basic cards for inactive objects (without real-time data) -->
            <div
              v-for="object in filteredInactiveObjects"
              :key="'inactive-' + object.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <ObjectRealTimeCard
                :object-data="createEmptyRealTimeData(object)"
                :base-object-data="object"
                @create-ticket="createTicketForObject"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="directions_car_filled" size="80px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">
            {{ $t('portal.pages.objects.noObjects') }}
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center q-py-md">
          <q-icon name="error" size="48px" color="negative" />
          <div class="q-mt-sm text-negative">{{ error }}</div>
          <q-btn color="primary" :label="$t('common.retry')" @click="loadObjects" class="q-mt-md" />
        </div>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PortalApi } from 'src/api/portal'
import ObjectRealTimeCard from 'src/components/portal/ObjectRealTimeCard.vue'
import { useI18n } from 'vue-i18n'
import SocketService from 'src/services/socketService'

const router = useRouter()
const { t } = useI18n()

// Reactive data
const objects = ref([])
const loading = ref(false)
const error = ref(null)
const objectsRealTimeData = ref([])
const isSocketConnected = ref(false)
const showOnlyProblematic = ref(false)
const componentId = 'objects-page-' + Date.now()

// Helper function to check if object is problematic
const isObjectProblematic = (objectData, baseObjectData) => {
  if (baseObjectData.status !== 'active' || objectData.error) return true
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

// Computed filtered objects
const filteredObjectsRealTimeData = computed(() => {
  if (!showOnlyProblematic.value) {
    return objectsRealTimeData.value
  }

  return objectsRealTimeData.value.filter((objectData) => {
    const baseObject = getBaseObjectData(objectData.objectId)
    return isObjectProblematic(objectData, baseObject)
  })
})

const filteredInactiveObjects = computed(() => {
  if (!showOnlyProblematic.value) {
    return inactiveObjects.value
  }

  return inactiveObjects.value.filter((object) => {
    const emptyData = createEmptyRealTimeData(object)
    return isObjectProblematic(emptyData, object)
  })
})

const handleObjectsRealTimeUpdate = (data) => {
  if (data && data.objectsData) {
    objectsRealTimeData.value = data.objectsData
  }
}

const connectToSocket = () => {
  isSocketConnected.value = SocketService.isConnected()
  SocketService.subscribe('objects:realtime_updated', handleObjectsRealTimeUpdate, componentId)
  SocketService.subscribe(
    'connection:status_changed',
    (data) => {
      isSocketConnected.value = data.connected
    },
    componentId,
  )
}

const disconnectFromSocket = () => {
  SocketService.unsubscribeAll(componentId)
  isSocketConnected.value = false
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
  }
}

// Load basic objects data
const loadObjects = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await PortalApi.getObjects()

    if (response.data.success) {
      objects.value = response.data.objects
    } else {
      error.value = response.data.message || "Помилка завантаження об'єктів"
    }
  } catch (err) {
    console.error('Error loading objects:', err)
    error.value = err.response?.data?.message || "Помилка завантаження об'єктів"
  } finally {
    loading.value = false
  }
}

// Computed properties
const inactiveObjects = computed(() => {
  const realTimeObjectIds = objectsRealTimeData.value.map((rtd) => rtd.objectId)
  return objects.value.filter((obj) => !realTimeObjectIds.includes(obj.id))
})

// Helper methods
const getBaseObjectData = (objectId) => {
  return objects.value.find((obj) => obj.id === objectId) || {}
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
    address: t('portal.pages.objects.inactiveObject'),
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

// Toggle filter
const toggleProblematicFilter = () => {
  showOnlyProblematic.value = !showOnlyProblematic.value
}

// Ticket creation methods
const createTicketForObject = (objectData) => {
  const baseObject = objects.value.find((obj) => obj.id === objectData.objectId)

  if (baseObject) {
    router.push({
      name: 'portal-tickets',
      query: {
        action: 'create',
        object_id: baseObject.id,
        object_name: baseObject.name,
      },
    })
  }
}

// Lifecycle hooks
onMounted(async () => {
  await loadObjects()

  // Load real-time data immediately
  await loadRealTimeData()

  // Load real-time data only for active objects
  const activeObjects = objects.value.filter((obj) => obj.status === 'active')
  if (activeObjects.length > 0) {
    connectToSocket()
  }
})

onUnmounted(() => {
  disconnectFromSocket()
})
</script>

<style scoped>
.object-card {
  transition: all 0.3s ease;
}

.object-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-item-label {
  font-size: 0.9rem;
}

.q-item-label[caption] {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
