<template>
  <q-card class="object-realtime-card" :class="{ 'card-alert': hasAlert }" bordered>
    <q-card-section>
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="text-h6 text-weight-bold">
            {{ objectData.name }}
          </div>
        </div>
        <div class="col-auto q-gutter-xs">
          <!-- System Status -->
          <q-chip
            :color="getSystemStatusColor(systemStatus)"
            text-color="white"
            :label="$t(`portal.statuses.${systemStatus}`)"
            dense
          />
          <!-- Movement Status (only for active objects with real-time data) -->
          <q-chip
            v-if="!objectData.error"
            :color="objectData.isMoving ? 'green' : 'grey'"
            text-color="white"
            :icon="objectData.isMoving ? 'directions_car' : 'stop'"
            :label="
              objectData.isMoving
                ? $t('portal.pages.objects.moving')
                : $t('portal.pages.objects.stopped')
            "
            dense
          />
        </div>
      </div>

      <!-- Real-time Data (only for active objects without errors) -->
      <div v-if="systemStatus === 'active' && !objectData.error">
        <!-- Current Status -->
        <div class="row q-gutter-sm q-mb-md">
          <div class="col-6">
            <q-card flat class="bg-blue-1 text-center q-pa-sm">
              <div class="text-h5 text-weight-bold text-blue-8">{{ objectData.speed }}</div>
              <div class="text-caption">{{ $t('portal.pages.objects.kmh') }}</div>
            </q-card>
          </div>
          <div class="col-6">
            <q-card flat :class="`bg-${getSatelliteColor()}-1 text-center q-pa-sm`">
              <div class="text-h5 text-weight-bold" :class="`text-${getSatelliteColor()}-8`">
                {{ objectData.satellites }}
              </div>
              <div class="text-caption">{{ $t('portal.pages.objects.satellites') }}</div>
            </q-card>
          </div>
        </div>

        <!-- Location -->
        <q-item dense class="q-pa-none q-mb-sm">
          <q-item-section avatar>
            <q-icon name="location_on" color="red" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('portal.pages.objects.currentLocation') }}</q-item-label>
            <q-item-label class="text-caption">{{ objectData.address }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Last Message -->
        <q-item dense class="q-pa-none q-mb-md">
          <q-item-section avatar>
            <q-icon name="schedule" :color="getLastMessageColor()" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('portal.pages.objects.lastMessage') }}</q-item-label>
            <q-item-label class="text-caption" :class="`text-${getLastMessageColor()}`">
              {{
                objectData.lastMessage
                  ? formatDateTime(objectData.lastMessage)
                  : $t('portal.pages.objects.noData')
              }}
              <span v-if="objectData.lastMessage" class="text-weight-bold">
                ({{ getLastMessageAgo() }})
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- 30 Minutes Stats -->
        <q-separator class="q-mb-md" />
        <div class="text-subtitle2 q-mb-sm">{{ $t('portal.pages.objects.stats30min') }}:</div>

        <div class="row q-gutter-xs q-mb-md">
          <div class="col">
            <q-card flat class="bg-orange-1 text-center q-pa-xs">
              <div class="text-weight-bold text-orange-8">{{ objectData.last30min.distance }}</div>
              <div class="text-caption">{{ $t('portal.pages.objects.km') }}</div>
            </q-card>
          </div>
          <div class="col">
            <q-card flat class="bg-purple-1 text-center q-pa-xs">
              <div class="text-weight-bold text-purple-8">
                {{ objectData.last30min.satelliteChanges }}
              </div>
              <div class="text-caption">{{ $t('portal.pages.objects.gpsChanges') }}</div>
            </q-card>
          </div>
          <div class="col">
            <q-card flat class="bg-teal-1 text-center q-pa-xs">
              <div class="text-weight-bold text-teal-8">
                {{ objectData.last30min.messageCount }}
              </div>
              <div class="text-caption">{{ $t('portal.pages.objects.messages') }}</div>
            </q-card>
          </div>
        </div>

        <!-- Mini Charts - TODO: Uncomment when recharts is fixed -->
        <!-- Charts will be added later -->
      </div>

      <!-- Error State (for active objects with errors) -->
      <div v-else-if="systemStatus === 'active' && objectData.error" class="text-center q-py-md">
        <q-icon name="error" color="negative" size="32px" />
        <div class="text-caption text-negative q-mt-xs">
          {{ $t('portal.pages.objects.dataUnavailable') }}
        </div>
      </div>

      <!-- System Information (always shown) -->
      <q-separator v-if="systemStatus === 'active'" class="q-mb-md" />
      <div class="text-subtitle2 q-mb-sm">{{ $t('portal.pages.objects.systemInfo') }}:</div>

      <q-list dense>
        <q-item>
          <q-item-section avatar>
            <q-icon name="fingerprint" color="grey-6" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Wialon ID</q-item-label>
            <q-item-label>{{ baseObjectData.wialon_id }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="baseObjectData.description">
          <q-item-section avatar>
            <q-icon name="description" color="grey-6" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('common.description') }}</q-item-label>
            <q-item-label>{{ baseObjectData.description }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Tariff Info -->
        <q-item v-if="baseObjectData.tariff_name">
          <q-item-section avatar>
            <q-icon name="attach_money" color="green-6" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('portal.pages.objects.tariff') }}</q-item-label>
            <q-item-label>
              {{ baseObjectData.tariff_name }}
              <span v-if="baseObjectData.tariff_price" class="text-weight-bold text-green-8">
                ({{ formatPrice(baseObjectData.tariff_price) }}
                {{ $t('portal.pages.objects.monthly') }})
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="baseObjectData.tariff_from">
          <q-item-section avatar>
            <q-icon name="event" color="grey-6" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('common.from') }}</q-item-label>
            <q-item-label>{{ formatDate(baseObjectData.tariff_from) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        flat
        color="primary"
        icon="support_agent"
        :label="$t('tickets.createNew')"
        @click="createTicket"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  objectData: {
    type: Object,
    required: true,
  },
  baseObjectData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['create-ticket'])

// System status from base object data
const systemStatus = computed(() => props.baseObjectData.status || 'inactive')

// Alert conditions
const hasAlert = computed(() => {
  if (systemStatus.value !== 'active' || props.objectData.error) return false

  const lowSatellites = props.objectData.satellites < 4
  const oldMessage = getLastMessageMinutes() > 15

  return lowSatellites || oldMessage
})

// Satellite color based on count
const getSatelliteColor = () => {
  const count = props.objectData.satellites
  if (count >= 8) return 'green'
  if (count >= 4) return 'orange'
  return 'red'
}

// Last message color and time calculation
const getLastMessageMinutes = () => {
  if (!props.objectData.lastMessage) return 999
  const now = new Date()
  const lastMessage = new Date(props.objectData.lastMessage)
  return Math.floor((now - lastMessage) / (1000 * 60))
}

const getLastMessageColor = () => {
  const minutes = getLastMessageMinutes()
  if (minutes <= 5) return 'green'
  if (minutes <= 15) return 'orange'
  return 'red'
}

const getLastMessageAgo = () => {
  const minutes = getLastMessageMinutes()
  if (minutes < 60) {
    return `${minutes} хв назад`
  }
  const hours = Math.floor(minutes / 60)
  return `${hours} год назад`
}

// System status color
const getSystemStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    suspended: 'orange',
  }
  return colors[status] || 'grey'
}

// Helper functions
const formatDateTime = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
  }).format(price)
}

const createTicket = () => {
  emit('create-ticket', props.objectData)
}
</script>

<style scoped>
.object-realtime-card {
  transition: all 0.3s ease;
}

.object-realtime-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-alert {
  animation: alertPulse 2s infinite;
  border: 2px solid #f44336;
}

@keyframes alertPulse {
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

.q-item-label {
  font-size: 0.9rem;
}

.q-item-label[caption] {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
