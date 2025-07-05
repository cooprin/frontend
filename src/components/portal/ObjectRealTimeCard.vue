<template>
  <q-card class="object-realtime-card" bordered>
    <q-card-section>
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="text-h6 text-weight-bold">
            {{ objectData.name }}
          </div>
        </div>
        <div class="col-auto">
          <q-chip
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

      <!-- Error State -->
      <div v-if="objectData.error" class="text-center q-py-md">
        <q-icon name="error" color="negative" size="32px" />
        <div class="text-caption text-negative q-mt-xs">
          {{ $t('portal.pages.objects.dataUnavailable') }}
        </div>
      </div>

      <!-- Normal State -->
      <div v-else>
        <!-- Current Status -->
        <div class="row q-gutter-sm q-mb-md">
          <div class="col-6">
            <q-card flat class="bg-blue-1 text-center q-pa-sm">
              <div class="text-h5 text-weight-bold text-blue-8">{{ objectData.speed }}</div>
              <div class="text-caption">{{ $t('portal.pages.objects.kmh') }}</div>
            </q-card>
          </div>
          <div class="col-6">
            <q-card flat class="bg-green-1 text-center q-pa-sm">
              <div class="text-h5 text-weight-bold text-green-8">{{ objectData.satellites }}</div>
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
            <q-icon name="schedule" color="grey-6" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ $t('portal.pages.objects.lastMessage') }}</q-item-label>
            <q-item-label class="text-caption">
              {{
                objectData.lastMessage
                  ? formatDateTime(objectData.lastMessage)
                  : $t('portal.pages.objects.noData')
              }}
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

        <!-- Mini Charts -->
        <!-- <div v-if="objectData.last30min.speedChart.length > 0" class="q-mb-sm">
          <div class="text-caption q-mb-xs">{{ $t('portal.pages.objects.speed') }}:</div>
          <div class="chart-container">
            <ResponsiveContainer width="100%" height="{60}">
              <LineChart :data="objectData.last30min.speedChart">
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#1976d2"
                  strokeWidth="2"
                  dot="{false}"
                />
                <XAxis dataKey="time" hide />
                <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div v-if="objectData.last30min.satelliteChart.length > 0">
          <div class="text-caption q-mb-xs">{{ $t('portal.pages.objects.satellites') }}:</div>
          <div class="chart-container">
            <ResponsiveContainer width="100%" height="{60}">
              <LineChart :data="objectData.last30min.satelliteChart">
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#388e3c"
                  strokeWidth="2"
                  dot="{false}"
                />
                <XAxis dataKey="time" hide />
                <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> -->
      </div>
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
import { date } from 'quasar'
//import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const props = defineProps({
  objectData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['create-ticket'])

const formatDateTime = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
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

.chart-container {
  height: 60px;
  width: 100%;
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
