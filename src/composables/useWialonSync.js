// src/composables/useWialonSync.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { WialonSyncApi } from 'src/api/wialon-sync'

// Глобальний стейт (спільний для всіх екземплярів)
const globalSyncState = ref({
  isActive: false,
  sessionId: null,
  startTime: null,
  lastCheck: null,
})

const isPolling = ref(false)
let pollingInterval = null

// Функція для перевірки активних сесій
const checkActiveSync = async () => {
  try {
    const response = await WialonSyncApi.getSessions({
      page: 1,
      perPage: 5,
      sortBy: 'start_time',
      descending: true,
    })

    // Шукаємо активну сесію (статус 'running')
    const activeSession = response.data.sessions?.find((session) => session.status === 'running')

    if (activeSession) {
      globalSyncState.value = {
        isActive: true,
        sessionId: activeSession.id,
        startTime: activeSession.start_time,
        lastCheck: new Date(),
      }
    } else {
      globalSyncState.value = {
        isActive: false,
        sessionId: null,
        startTime: null,
        lastCheck: new Date(),
      }
      stopPolling() // ← ДОДАНО: зупиняємо polling коли немає активної синхронізації
    }

    return activeSession
  } catch (error) {
    console.error('Error checking active sync:', error)
    stopPolling() // ← ДОДАНО: зупиняємо polling при помилці
    return null
  }
}

// Запуск polling
const startPolling = () => {
  if (isPolling.value) return

  isPolling.value = true

  // Перевіряємо одразу
  checkActiveSync()

  // Polling кожні 3 секунди
  pollingInterval = setInterval(checkActiveSync, 3000)
}

// Зупинка polling
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
  isPolling.value = false
}

// Основний composable
export function useWialonSync() {
  const isSyncing = computed(() => globalSyncState.value.isActive)

  const syncStatus = computed(() => ({
    isActive: globalSyncState.value.isActive,
    sessionId: globalSyncState.value.sessionId,
    startTime: globalSyncState.value.startTime,
    duration: globalSyncState.value.startTime
      ? Math.floor((new Date() - new Date(globalSyncState.value.startTime)) / 1000)
      : 0,
  }))

  const syncDuration = computed(() => {
    if (!syncStatus.value.isActive) return ''
    const totalSeconds = syncStatus.value.duration
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  const startSync = async () => {
    // СПОЧАТКУ перевіряємо чи є активні сесії
    await checkActiveSync()

    // Якщо знайшли активну сесію - не запускаємо нову
    if (globalSyncState.value.isActive) {
      throw new Error('Синхронізація вже активна')
    }

    try {
      const response = await WialonSyncApi.startSync()

      if (response.data.success && response.data.session) {
        // Оновлюємо глобальний стейт
        globalSyncState.value = {
          isActive: true,
          sessionId: response.data.session.id,
          startTime: response.data.session.start_time,
          lastCheck: new Date(),
        }

        // Запускаємо polling
        startPolling()
      }

      return response
    } catch (error) {
      console.error('Error starting sync:', error)
      throw error
    }
  }

  // Ініціалізація при першому використанні
  const initialize = () => {
    // ЗМІНЕНО: просто перевіряємо один раз, БЕЗ автозапуску polling
    checkActiveSync()
  }

  // Cleanup
  const cleanup = () => {
    stopPolling()
  }

  // Lifecycle
  onMounted(() => {
    // Ініціалізуємо тільки якщо ще не ініціалізовано
    if (!isPolling.value && !globalSyncState.value.lastCheck) {
      initialize()
    }
  })

  onUnmounted(() => {
    // НЕ робимо cleanup тут, бо інші компоненти можуть використовувати
  })

  return {
    // Computed
    isSyncing,
    syncStatus,
    syncDuration,

    // Methods
    startSync,
    checkActiveSync,

    // Manual control
    initialize,
    cleanup,
  }
}
