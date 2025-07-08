<template>
  <div class="welcome-dashboard">
    <div class="row q-col-gutter-md">
      <!-- Перший ряд: Дата і час -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center q-pa-lg">
            <q-icon name="today" size="2.5em" color="primary" class="q-mb-sm" />
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ $t('dashboard.welcome.today') }}
            </div>
            <div class="text-h5 text-weight-bold">{{ currentDate }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center q-pa-lg">
            <q-icon name="schedule" size="2.5em" color="primary" class="q-mb-sm" />
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ $t('dashboard.welcome.currentTime') }}
            </div>
            <div class="text-h5 text-weight-bold">{{ currentTime }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Другий ряд: Онлайн статистика -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center q-pa-lg">
            <q-icon name="people" size="2.5em" color="positive" class="q-mb-sm" />
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ $t('dashboard.onlineStats.onlineStaff') }}
            </div>
            <div class="text-h4 text-weight-bold text-positive">
              {{ onlineStats.onlineStaff }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center q-pa-lg">
            <q-icon name="person" size="2.5em" color="info" class="q-mb-sm" />
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ $t('dashboard.onlineStats.onlineClients') }}
            </div>
            <div class="text-h4 text-weight-bold text-info">
              {{ onlineStats.onlineClients }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Третій ряд: Системний статус -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center q-pa-lg">
            <q-icon
              :name="systemStatus.systemStatus === 'healthy' ? 'check_circle' : 'error'"
              size="2.5em"
              :color="systemStatus.systemStatus === 'healthy' ? 'positive' : 'negative'"
              class="q-mb-sm"
            />
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ $t('dashboard.systemStatus.title') }}
            </div>
            <div
              class="text-h6 text-weight-bold"
              :class="systemStatus.systemStatus === 'healthy' ? 'text-positive' : 'text-negative'"
            >
              {{ $t(`dashboard.systemStatus.${systemStatus.systemStatus}`) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center q-pa-lg">
            <q-icon
              :name="systemStatus.wialon === 'connected' ? 'wifi' : 'wifi_off'"
              size="2.5em"
              :color="systemStatus.wialon === 'connected' ? 'positive' : 'negative'"
              class="q-mb-sm"
            />
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ $t('dashboard.systemStatus.wialon') }}
            </div>
            <div
              class="text-h6 text-weight-bold"
              :class="systemStatus.wialon === 'connected' ? 'text-positive' : 'text-negative'"
            >
              {{ $t(`dashboard.systemStatus.${systemStatus.wialon}`) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { date } from 'quasar'
import { SystemApi } from 'src/api/system'
import socketService from 'src/services/socketService'

// Реактивні дані
const currentTime = ref('')
const currentDate = ref('')
const onlineStats = ref({
  onlineStaff: 0,
  onlineClients: 0,
  totalOnline: 0,
})
const systemStatus = ref({
  database: 'connected',
  sockets: 'connected',
  wialon: 'connected',
  systemStatus: 'healthy',
})

let timeInterval = null
let socketListenerId = null

// Оновлення часу
const updateTime = () => {
  const now = new Date()
  currentTime.value = date.formatDate(now, 'HH:mm:ss')
  currentDate.value = date.formatDate(now, 'dddd, D MMMM YYYY')
}

// Завантаження онлайн статистики
const loadOnlineStats = async () => {
  try {
    const response = await SystemApi.getOnlineStats()
    if (response.data.success) {
      onlineStats.value = response.data.stats
    }
  } catch (error) {
    console.error('Error loading online stats:', error)
  }
}

// Завантаження системного статусу
const loadSystemStatus = async () => {
  try {
    const response = await SystemApi.getSystemStatus()
    if (response.data.success) {
      systemStatus.value = response.data.status
    }
  } catch (error) {
    console.error('Error loading system status:', error)
  }
}

// Обробка змін статусу з'єднання сокетів
const handleConnectionStatusChange = (data) => {
  console.log('Connection status changed:', data)
  // Перезавантажуємо статистику при зміні з'єднань
  loadOnlineStats()
}

onMounted(() => {
  // Запускаємо оновлення часу
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // Завантажуємо початкові дані
  loadOnlineStats()
  loadSystemStatus()

  // Підписуємося на зміни статусу з'єднання
  socketListenerId = socketService.subscribe(
    'connection:status_changed',
    handleConnectionStatusChange,
    'welcome-dashboard',
  )
})

onUnmounted(() => {
  // Очищаємо інтервал часу
  if (timeInterval) {
    clearInterval(timeInterval)
  }

  // Відписуємося від сокет подій
  if (socketListenerId) {
    socketService.unsubscribe('connection:status_changed', socketListenerId)
  }
})
</script>
<style lang="scss" scoped>
.welcome-dashboard {
  .stats-card {
    height: 100%;
    min-height: 140px;
    transition: all 0.3s ease;
    border-radius: 12px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  .q-card-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .q-icon {
    opacity: 0.8;
  }
}

// Responsive для мобільних
@media (max-width: 768px) {
  .welcome-dashboard {
    .stats-card {
      min-height: 120px;
    }

    .q-icon {
      transform: scale(0.8);
    }

    .text-h4 {
      font-size: 1.8rem;
    }

    .text-h5 {
      font-size: 1.4rem;
    }
  }
}
</style>
