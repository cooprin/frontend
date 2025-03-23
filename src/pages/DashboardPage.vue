<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-space />
      <q-select
        v-model="selectedDashboard"
        :options="dashboardOptions"
        dense
        outlined
        class="dashboard-selector"
        style="width: 250px"
      />
    </div>

    <!-- Заголовок дашборду -->
    <div class="text-h6 q-mb-md">{{ selectedDashboard.label }}</div>

    <!-- Dashboard System -->
    <div>
      <!-- Дашборд для заборгованих оплат -->
      <div v-if="selectedDashboard.value === 'overdue'">
        <div class="row q-col-gutter-md">
          <!-- Метрики карточки -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-negative text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.totalOverdue') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-negative" v-if="!loadingOverdueData">
                  {{ formatCurrency(overdueMetrics.totalAmount) }}
                </div>
                <q-spinner v-else color="negative" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-warning text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.clientsOverdue') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-warning" v-if="!loadingOverdueData">
                  {{ overdueMetrics.clientsCount }}
                </div>
                <q-spinner v-else color="warning" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-info text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.objectsOverdue') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-info" v-if="!loadingOverdueData">
                  {{ overdueMetrics.objectsCount }}
                </div>
                <q-spinner v-else color="info" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-primary text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.periodsPaid') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-primary" v-if="!loadingOverdueData">
                  {{ overdueMetrics.paymentRate }}%
                </div>
                <q-spinner v-else color="primary" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Список клієнтів з заборгованістю -->
          <div class="col-12 col-md-6">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.clientsWithOverduePayments') }}</div>
                <q-space />
                <q-btn
                  icon="refresh"
                  flat
                  round
                  dense
                  :loading="loadingOverdueData"
                  @click="loadOverdueData"
                />
              </q-card-section>
              <q-card-section>
                <q-list separator>
                  <q-item
                    v-for="client in overdueClients"
                    :key="client.id"
                    clickable
                    @click="openClient(client.id)"
                  >
                    <q-item-section>
                      <q-item-label>{{ client.name }}</q-item-label>
                      <q-item-label caption>
                        {{ $t('dashboard.overdueObjects') }}: {{ client.objectsCount }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-negative text-weight-bold">
                        {{ formatCurrency(client.totalOverdue) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="overdueClients.length === 0 && !loadingOverdueData">
                    <q-item-section class="text-center text-grey">
                      {{ $t('dashboard.noOverdueClients') }}
                    </q-item-section>
                  </q-item>
                  <q-item v-if="loadingOverdueData">
                    <q-item-section class="text-center">
                      <q-spinner color="primary" size="2em" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Об'єкти з простроченими оплатами -->
          <div class="col-12 col-md-6">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.objectsWithOverduePayments') }}</div>
                <q-space />
              </q-card-section>
              <q-card-section>
                <q-table
                  :rows="overdueObjects"
                  :columns="overdueObjectsColumns"
                  row-key="id"
                  dense
                  :pagination="{ rowsPerPage: 5 }"
                  :loading="loadingOverdueData"
                >
                  <template v-slot:body-cell-client_name="props">
                    <q-td :props="props">
                      <q-item clickable dense @click="openClient(props.row.client_id)">
                        <q-item-section>{{ props.row.client_name }}</q-item-section>
                      </q-item>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-billing_period="props">
                    <q-td :props="props">
                      {{ t(`payments.months.${props.row.billing_month}`) }}
                      {{ props.row.billing_year }}
                    </q-td>
                  </template>
                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props" class="text-center">
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="visibility"
                        @click="openObject(props.row.id)"
                      >
                        <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Графік заборгованості по місяцях -->
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.overdueByMonth') }}</div>
              </q-card-section>
              <q-card-section>
                <div
                  style="height: 400px; position: relative"
                  v-if="!loadingOverdueData && overdueByMonthData.length > 0"
                >
                  <overdue-chart :data="overdueByMonthData" />
                </div>
                <div v-else-if="loadingOverdueData" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="3em" />
                </div>
                <div v-else class="text-center text-grey q-pa-lg">
                  {{ $t('dashboard.noDataForChart') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Дашборд для нових клієнтів та активності -->
      <div v-if="selectedDashboard.value === 'activity'">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.newClients') }}</div>
              </q-card-section>
              <q-card-section>
                <p class="text-center text-grey">{{ $t('dashboard.comingSoon') }}</p>
                <!-- Тут буде список нових клієнтів -->
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.recentActivity') }}</div>
              </q-card-section>
              <q-card-section>
                <p class="text-center text-grey">{{ $t('dashboard.comingSoon') }}</p>
                <!-- Тут буде список останніх дій -->
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Дашборд фінансової статистики -->
      <div v-if="selectedDashboard.value === 'financial'">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.financialStatistics') }}</div>
              </q-card-section>
              <q-card-section>
                <p class="text-center text-grey">{{ $t('dashboard.comingSoon') }}</p>
                <!-- Тут буде фінансова статистика -->
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { PaymentsApi } from 'src/api/payments'
import OverdueChart from 'components/dashboard/OverdueChart.vue'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

// Для вибору дашборду
const dashboardOptions = [
  { label: t('dashboard.types.overduePayments'), value: 'overdue' },
  { label: t('dashboard.types.activity'), value: 'activity' },
  { label: t('dashboard.types.financial'), value: 'financial' },
]
const selectedDashboard = ref(dashboardOptions[0])

// Для даних по заборгованості
const loadingOverdueData = ref(false)

const overdueMetrics = ref({
  totalAmount: 0,
  clientsCount: 0,
  objectsCount: 0,
  paymentRate: 0,
})
const overdueClients = ref([])
const overdueObjects = ref([])
const overdueByMonthData = ref([])

// Колонки для таблиці об'єктів з простроченими оплатами
const overdueObjectsColumns = [
  { name: 'name', align: 'left', label: t('wialonObjects.name'), field: 'name', sortable: true },
  {
    name: 'client_name',
    align: 'left',
    label: t('wialonObjects.client'),
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'billing_period',
    align: 'center',
    label: t('payments.period'),
    field: (row) => `${t(`payments.months.${row.billing_month}`)} ${row.billing_year}`,
    sortable: true,
  },
  { name: 'amount', align: 'right', label: t('payments.amount'), field: 'amount', sortable: true },
  {
    name: 'actions',
    align: 'center',
    label: t('common.actions'),
    field: 'actions',
    sortable: false,
  },
]

// Метод для завантаження даних заборгованості
const loadOverdueData = async () => {
  loadingOverdueData.value = true

  try {
    // API запит для отримання метрик заборгованості
    const metricsResponse = await PaymentsApi.getOverdueMetrics()
    overdueMetrics.value = metricsResponse.data.metrics

    // API запит для отримання клієнтів з заборгованістю
    const clientsResponse = await PaymentsApi.getOverdueClients()
    overdueClients.value = clientsResponse.data.clients

    // API запит для отримання об'єктів з заборгованими оплатами
    const objectsResponse = await PaymentsApi.getOverdueObjects()
    overdueObjects.value = objectsResponse.data.objects

    // API запит для отримання даних для графіка
    const chartResponse = await PaymentsApi.getOverdueByMonth()
    overdueByMonthData.value = chartResponse.data.monthlyData
  } catch (error) {
    console.error('Error loading overdue data:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingOverdueData.value = false
  }
}

// Форматування валюти
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

// Навігація до клієнта
const openClient = (clientId) => {
  router.push({ name: 'client-details', params: { id: clientId } })
}

// Навігація до об'єкта
const openObject = (objectId) => {
  router.push({ name: 'wialon-object-details', params: { id: objectId } })
}

// Завантаження даних при монтуванні компонента
onMounted(() => {
  loadOverdueData()
})
</script>

<style lang="scss" scoped>
.dashboard-card {
  height: 100%;
}

// Для карток з фіксованою висотою
.metric-card {
  min-height: 150px;
}
</style>
