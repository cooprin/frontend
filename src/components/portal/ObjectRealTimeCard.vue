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
        <!-- Current Status - side by side -->
        <div class="row q-gutter-sm q-mb-md">
          <div class="col">
            <q-card flat class="stat-card speed-card text-center q-pa-sm">
              <div class="text-h5 text-weight-bold">{{ objectData.speed }}</div>
              <div class="text-caption">{{ $t('portal.pages.objects.kmh') }}</div>
            </q-card>
          </div>
          <div class="col">
            <q-card
              flat
              class="stat-card text-center q-pa-sm"
              :class="`satellite-${getSatelliteColor()}`"
            >
              <div class="text-h5 text-weight-bold">{{ objectData.satellites }}</div>
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
            <q-card flat class="stats-mini-card distance-card text-center q-pa-xs">
              <div class="text-weight-bold stats-value">{{ objectData.last30min.distance }}</div>
              <div class="text-caption stats-label">{{ $t('portal.pages.objects.km') }}</div>
            </q-card>
          </div>
          <div class="col">
            <q-card flat class="stats-mini-card changes-card text-center q-pa-xs">
              <div class="text-weight-bold stats-value">
                {{ objectData.last30min.satelliteChanges }}
              </div>
              <div class="text-caption stats-label">
                {{ $t('portal.pages.objects.gpsChanges') }}
              </div>
            </q-card>
          </div>
          <div class="col">
            <q-card flat class="stats-mini-card messages-card text-center q-pa-xs">
              <div class="text-weight-bold stats-value">
                {{ objectData.last30min.messageCount }}
              </div>
              <div class="text-caption stats-label">{{ $t('portal.pages.objects.messages') }}</div>
            </q-card>
          </div>
        </div>
        <!-- Mini Charts with labels -->
        <div v-if="objectData.last30min.speedChart.length > 0" class="q-mb-sm">
          <div class="text-caption q-mb-xs">{{ $t('portal.pages.objects.speed') }}:</div>
          <div class="chart-container">
            <div class="chart-header">
              <span class="chart-label-left">0</span>
              <span class="chart-title">{{ $t('portal.pages.objects.chartSpeed') }}</span>
              <span class="chart-label-right">{{ getMaxSpeed() }}</span>
            </div>
            <div class="mini-chart-horizontal">
              <div class="chart-times">
                <div
                  v-for="(point, index) in objectData.last30min.speedChart.slice(-6)"
                  :key="index"
                  class="time-label"
                >
                  {{ point.time }}
                </div>
              </div>
              <div class="chart-bars-horizontal">
                <div
                  v-for="(point, index) in objectData.last30min.speedChart.slice(-6)"
                  :key="index"
                  class="horizontal-bar"
                >
                  <div
                    class="bar-fill-horizontal speed-bar"
                    :style="`width: ${Math.max((point.speed / getMaxSpeed()) * 100, 2)}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="objectData.last30min.satelliteChart.length > 0">
          <div class="text-caption q-mb-xs">{{ $t('portal.pages.objects.satellites') }}:</div>
          <div class="chart-container">
            <div class="chart-header">
              <span class="chart-label-left">0</span>
              <span class="chart-title">{{ $t('portal.pages.objects.chartSatellites') }}</span>
              <span class="chart-label-right">25</span>
            </div>
            <div class="mini-chart-horizontal">
              <div class="chart-times">
                <div
                  v-for="(point, index) in objectData.last30min.satelliteChart.slice(-6)"
                  :key="index"
                  class="time-label"
                >
                  {{ point.time }}
                </div>
              </div>
              <div class="chart-bars-horizontal">
                <div
                  v-for="(point, index) in objectData.last30min.satelliteChart.slice(-6)"
                  :key="index"
                  class="horizontal-bar"
                >
                  <div
                    class="bar-fill-horizontal satellite-bar"
                    :style="`width: ${(point.count / 25) * 100}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

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

  const lowSatellites = props.objectData.satellites < 5
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
    return `${minutes} ${t('portal.pages.objects.minutesAgo')}`
  }
  const hours = Math.floor(minutes / 60)
  return `${hours} ${t('portal.pages.objects.hoursAgo')}`
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

const getMaxSpeed = () => {
  if (!props.objectData.last30min.speedChart.length) return 100
  const maxSpeed = Math.max(...props.objectData.last30min.speedChart.map((p) => p.speed))
  return Math.max(maxSpeed, 60) // мінімум 60 для шкали
}

// Helper functions
const formatDateTime = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const formatPrice = (price) => {
  return `${price} ${t('portal.pages.objects.currency')}`
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

/* Main stat cards */
.stat-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: var(--q-primary-1) !important;
}

.speed-card {
  background: var(--q-blue-1) !important;
  color: var(--q-blue-8) !important;
}

/* Satellite colors based on count */
.stat-card.satellite-green {
  background: rgba(76, 175, 80, 0.15) !important;
  border: 1px solid rgba(76, 175, 80, 0.3) !important;
}

.stat-card.satellite-green .text-h5,
.stat-card.satellite-green .text-caption {
  color: #2e7d32 !important;
}

.stat-card.satellite-orange {
  background: rgba(255, 152, 0, 0.15) !important;
  border: 1px solid rgba(255, 152, 0, 0.3) !important;
}

.stat-card.satellite-orange .text-h5,
.stat-card.satellite-orange .text-caption {
  color: #ef6c00 !important;
}

.stat-card.satellite-red {
  background: rgba(244, 67, 54, 0.15) !important;
  border: 1px solid rgba(244, 67, 54, 0.3) !important;
}

.stat-card.satellite-red .text-h5,
.stat-card.satellite-red .text-caption {
  color: #c62828 !important;
}

/* Dark theme for main stat cards */
.body--dark .stat-card {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.body--dark .stat-card .text-h5,
.body--dark .stat-card .text-caption {
  color: white !important;
}

/* Dark theme satellite color overrides */
.body--dark .stat-card.satellite-green,
.body--dark .stat-card.satellite-orange,
.body--dark .stat-card.satellite-red {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.body--dark .stat-card.satellite-green .text-h5,
.body--dark .stat-card.satellite-green .text-caption,
.body--dark .stat-card.satellite-orange .text-h5,
.body--dark .stat-card.satellite-orange .text-caption,
.body--dark .stat-card.satellite-red .text-h5,
.body--dark .stat-card.satellite-red .text-caption {
  color: white !important;
}

/* Stats mini cards */
.stats-mini-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  min-height: 60px;
}

.distance-card {
  background: rgba(255, 152, 0, 0.1) !important;
}

.changes-card {
  background: rgba(156, 39, 176, 0.1) !important;
}

.messages-card {
  background: rgba(0, 150, 136, 0.1) !important;
}

.stats-value {
  font-size: 1.2rem;
  color: inherit;
}

.stats-label {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* Dark theme for stats mini cards */
.body--dark .stats-mini-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.body--dark .stats-value,
.body--dark .stats-label {
  color: white !important;
}

/* Charts */
.chart-container {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 8px;
}

.body--dark .chart-container {
  background: rgba(255, 255, 255, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.7rem;
  opacity: 0.7;
}

.chart-title {
  font-weight: bold;
}

/* Horizontal Charts */
.mini-chart-horizontal {
  display: flex;
  gap: 8px;
}

.chart-times {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 40px;
}

.time-label {
  font-size: 0.6rem;
  opacity: 0.6;
  height: 16px;
  display: flex;
  align-items: center;
}

.chart-bars-horizontal {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.horizontal-bar {
  height: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.body--dark .horizontal-bar {
  background: rgba(255, 255, 255, 0.1);
}

.bar-fill-horizontal {
  height: 100%;
  border-radius: 2px;
  min-width: 2px;
  transition: width 0.3s ease;
}

.speed-bar {
  background: #1976d2;
}

.satellite-bar {
  background: #388e3c;
}

.body--dark .time-label,
.body--dark .chart-header {
  color: white;
}
</style>
