<template>
  <div class="welcome-dashboard">
    <div class="row q-col-gutter-md">
      <!-- Головна карточка привітання -->
      <div class="col-12">
        <q-card class="welcome-card">
          <q-card-section class="text-center q-pa-xl">
            <div class="welcome-content">
              <q-icon name="waving_hand" size="4em" color="primary" class="q-mb-md" />

              <div class="text-h3 text-weight-light q-mb-md">
                {{ getGreeting() }}, {{ userName }}!
              </div>

              <div class="text-h6 text-grey-7 q-mb-lg">
                {{ $t('dashboard.welcome.haveNiceDay') }}
              </div>

              <!-- Інформація про поточний час -->
              <div class="time-info q-mt-lg">
                <div class="row justify-center q-col-gutter-lg">
                  <div class="col-auto">
                    <q-card flat bordered class="time-card">
                      <q-card-section class="text-center q-pa-md">
                        <q-icon name="today" size="2em" color="primary" class="q-mb-sm" />
                        <div class="text-subtitle1 text-weight-medium">
                          {{ $t('dashboard.welcome.today') }}
                        </div>
                        <div class="text-h6">{{ currentDate }}</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-auto">
                    <q-card flat bordered class="time-card">
                      <q-card-section class="text-center q-pa-md">
                        <q-icon name="schedule" size="2em" color="primary" class="q-mb-sm" />
                        <div class="text-subtitle1 text-weight-medium">
                          {{ $t('dashboard.welcome.currentTime') }}
                        </div>
                        <div class="text-h6">{{ currentTime }}</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { date } from 'quasar'

const { t } = useI18n()
const authStore = useAuthStore()

const currentTime = ref('')
const currentDate = ref('')
let timeInterval = null

// Ім'я користувача
const userName = computed(() => {
  const user = authStore.user
  if (user?.first_name || user?.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim()
  }
  return user?.email || 'Користувач'
})

// Привітання залежно від часу доби
const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) {
    return t('dashboard.welcome.goodMorning')
  } else if (hour >= 12 && hour < 18) {
    return t('dashboard.welcome.goodAfternoon')
  } else {
    return t('dashboard.welcome.goodEvening')
  }
}

// Оновлення часу
const updateTime = () => {
  const now = new Date()
  currentTime.value = date.formatDate(now, 'HH:mm:ss')
  currentDate.value = date.formatDate(now, 'dddd, D MMMM YYYY')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
.welcome-dashboard {
  .welcome-card {
    min-height: 400px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .welcome-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .time-card {
    min-width: 180px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .time-info {
    .q-icon {
      color: rgba(255, 255, 255, 0.8) !important;
    }
  }
}
</style>
