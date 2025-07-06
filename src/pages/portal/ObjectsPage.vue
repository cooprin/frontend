<template>
  <q-page padding>
    <div class="row">
      <div class="col-12">
        <div class="text-h5 q-mb-md">
          {{ $t('portal.pages.objects.title') }}
        </div>

        <!-- Auto-refresh indicator -->
        <div class="row items-center q-mb-md">
          <div class="col">
            <q-chip
              v-if="autoRefreshInterval"
              color="positive"
              text-color="white"
              icon="autorenew"
              dense
            >
              {{ $t('portal.pages.objects.autoRefresh') }}
            </q-chip>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              color="primary"
              icon="refresh"
              :loading="loadingRealTime"
              @click="loadObjectsRealTimeData"
              size="sm"
            >
              <q-tooltip>{{ $t('portal.pages.objects.refreshData') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
        <!-- Real-time Error State -->
        <div v-if="realTimeError && objects.length > 0" class="q-mt-md">
          <q-banner class="bg-warning text-dark" rounded>
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            {{ $t('portal.pages.objects.realTimeError') }}: {{ realTimeError }}
            <template v-slot:action>
              <q-btn
                flat
                color="dark"
                :label="$t('common.retry')"
                @click="loadObjectsRealTimeData"
                :loading="loadingRealTime"
              />
            </template>
          </q-banner>
        </div>
        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="40px" color="primary" />
          <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
        </div>

        <!-- Objects List -->
        <div v-else-if="objects.length > 0" class="row q-gutter-md">
          <!-- Real-time Cards for active objects -->
          <div
            v-for="objectData in objectsRealTimeData"
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
            v-for="object in inactiveObjects"
            :key="'inactive-' + object.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <ObjectRealTimeCard
              :object-data="createEmptyRealTimeData(object)"
              :base-object-data="object"
              @create-ticket="createTicketForObjectBasic"
            />
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

const router = useRouter()
const { t } = useI18n()

// Reactive data
const objects = ref([])
const loading = ref(false)
const error = ref(null)
const objectsRealTimeData = ref([])
const loadingRealTime = ref(false)
const realTimeError = ref(null)
const autoRefreshInterval = ref(null)

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

// Load real-time data for active objects
const loadObjectsRealTimeData = async () => {
  try {
    loadingRealTime.value = true
    realTimeError.value = null

    const response = await PortalApi.getObjectsRealTimeData()

    if (response.data.success) {
      objectsRealTimeData.value = response.data.objectsData
    } else {
      realTimeError.value = response.data.message || 'Помилка завантаження real-time даних'
    }
  } catch (err) {
    console.error('Error loading objects real-time data:', err)
    realTimeError.value = err.response?.data?.message || 'Помилка завантаження real-time даних'
  } finally {
    loadingRealTime.value = false
  }
}

// Auto-refresh management
const startAutoRefresh = () => {
  // Clear previous interval if exists
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }

  // Start auto-refresh every minute
  autoRefreshInterval.value = setInterval(() => {
    const activeObjects = objects.value.filter((obj) => obj.status === 'active')
    if (activeObjects.length > 0) {
      loadObjectsRealTimeData()
    }
  }, 60000) // 60 seconds
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

// Computed properties
const inactiveObjects = computed(() => {
  const realTimeObjectIds = objectsRealTimeData.value.map((rtd) => rtd.objectId)
  return objects.value
    .filter((obj) => obj.status !== 'active' || !realTimeObjectIds.includes(obj.id))
    .filter((obj) => !realTimeObjectIds.includes(obj.id))
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

// Ticket creation methods
const createTicketForObject = (objectData) => {
  // Find corresponding base object
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

const createTicketForObjectBasic = (objectData) => {
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

  // Load real-time data only for active objects
  const activeObjects = objects.value.filter((obj) => obj.status === 'active')
  if (activeObjects.length > 0) {
    await loadObjectsRealTimeData()
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
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
