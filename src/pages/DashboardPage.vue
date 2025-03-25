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
          <!-- Карточка загальної заборгованості -->
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
              <!-- Додаємо розшифровку загальної заборгованості -->
              <q-card-section
                v-if="
                  !loadingOverdueData &&
                  (overdueMetrics.objectsOverdueAmount > 0 ||
                    overdueMetrics.fixedServicesOverdueAmount > 0)
                "
                class="q-pt-none text-caption"
              >
                <div class="row">
                  <div class="col-6 text-left">{{ $t('dashboard.metrics.objectsOverdue') }}:</div>
                  <div class="col-6 text-right">
                    {{ formatCurrency(overdueMetrics.objectsOverdueAmount) }}
                  </div>
                </div>
                <div class="row">
                  <div class="col-6 text-left">
                    {{ $t('dashboard.metrics.fixedServicesOverdue') }}:
                  </div>
                  <div class="col-6 text-right">
                    {{ formatCurrency(overdueMetrics.fixedServicesOverdueAmount) }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Карточка кількості клієнтів з заборгованістю -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-warning text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.clientsOverdue') }}</div>
                <div class="text-caption">{{ $t('dashboard.metrics.allPeriods') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-warning" v-if="!loadingOverdueData">
                  {{ overdueMetrics.clientsCount }}
                </div>
                <q-spinner v-else color="warning" size="2em" />
              </q-card-section>
              <!-- Додаємо розшифровку по типам послуг -->
              <q-card-section
                v-if="
                  !loadingOverdueData &&
                  (overdueMetrics.objectClientsCount > 0 || overdueMetrics.fixedClientsCount > 0)
                "
                class="q-pt-none text-caption"
              >
                <div class="row">
                  <div class="col-8 text-left">
                    {{ $t('dashboard.metrics.objectsClientsCount') }}:
                  </div>
                  <div class="col-4 text-right">{{ overdueMetrics.objectClientsCount }}</div>
                </div>
                <div class="row">
                  <div class="col-8 text-left">
                    {{ $t('dashboard.metrics.fixedClientsCount') }}:
                  </div>
                  <div class="col-4 text-right">{{ overdueMetrics.fixedClientsCount }}</div>
                </div>
                <div class="text-italic text-grey-8 q-mt-xs">
                  {{ $t('dashboard.metrics.clientsOverlapNote') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Карточка кількості об'єктів з заборгованістю - без змін -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-info text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.objectsOverdue') }}</div>
                <div class="text-caption">{{ $t('dashboard.metrics.allPeriods') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-info" v-if="!loadingOverdueData">
                  {{ overdueMetrics.objectsCount }}
                </div>
                <q-spinner v-else color="info" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Карточка відсотка оплачених періодів - без змін -->
          <div class="col-12 col-md-3">
            <q-card class="dashboard-card">
              <q-card-section class="bg-primary text-white">
                <div class="text-subtitle2">{{ $t('dashboard.metrics.periodsPaid') }}</div>
                <div class="text-caption">{{ $t('dashboard.metrics.thisYear') }}</div>
              </q-card-section>
              <q-card-section class="text-center">
                <div class="text-h4 text-primary" v-if="!loadingOverdueData">
                  {{ overdueMetrics.paymentRate }}%
                </div>
                <q-spinner v-else color="primary" size="2em" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Діаграма розподілу заборгованості за типами послуг - НОВА -->
          <div class="col-12 col-md-6">
            <q-card
              class="dashboard-card"
              v-if="!loadingOverdueData && overdueMetrics.totalAmount > 0"
            >
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.overdueDistribution') }}</div>
              </q-card-section>
              <q-card-section>
                <div style="height: 300px; position: relative">
                  <pie-chart
                    :chart-data="{
                      labels: [
                        $t('dashboard.metrics.objectsOverdue'),
                        $t('dashboard.metrics.fixedServicesOverdue'),
                      ],
                      datasets: [
                        {
                          data: [
                            overdueMetrics.objectsOverdueAmount,
                            overdueMetrics.fixedServicesOverdueAmount,
                          ],
                          backgroundColor: ['#3498db', '#e74c3c'],
                          borderWidth: 0,
                        },
                      ],
                    }"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Список клієнтів з заборгованістю - ОНОВЛЕНО -->
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
                        <template v-if="client.objectsCount > 0">
                          {{ $t('dashboard.overdueObjects') }}: {{ client.objectsCount }}
                        </template>
                        <template v-if="client.invoicesCount > 0">
                          <template v-if="client.objectsCount > 0"> | </template>
                          {{ $t('dashboard.overdueInvoices') }}: {{ client.invoicesCount }}
                        </template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-negative text-weight-bold">
                        {{ formatCurrency(client.totalOverdue) }}
                      </q-item-label>
                      <q-item-label
                        caption
                        v-if="client.objectsOverdue > 0 && client.fixedOverdue > 0"
                      >
                        {{ formatCurrency(client.objectsOverdue) }} +
                        {{ formatCurrency(client.fixedOverdue) }}
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

          <!-- Об'єкти та послуги з простроченими оплатами - ОНОВЛЕНО -->
          <div class="col-12">
            <q-card class="dashboard-card">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ $t('dashboard.itemsWithOverduePayments') }}</div>
                <q-space />
                <q-btn-toggle
                  v-model="overdueItemsFilter"
                  :options="[
                    { label: $t('dashboard.allItems'), value: 'all' },
                    { label: $t('dashboard.onlyObjects'), value: 'object' },
                    { label: $t('dashboard.onlyFixedServices'), value: 'fixed' },
                  ]"
                  spread
                  dense
                  unelevated
                  class="q-ml-md"
                />
              </q-card-section>
              <q-card-section>
                <q-table
                  :rows="filteredOverdueItems"
                  :columns="overdueObjectsColumns"
                  row-key="id"
                  dense
                  :pagination="{ rowsPerPage: 10 }"
                  :loading="loadingOverdueData"
                >
                  <template v-slot:body-cell-client_name="props">
                    <q-td :props="props">
                      <q-item clickable dense @click="openClient(props.row.client_id)">
                        <q-item-section>{{ props.row.client_name }}</q-item-section>
                      </q-item>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-name="props">
                    <q-td :props="props">
                      <div class="row items-center">
                        <q-icon
                          :name="props.row.item_type === 'object' ? 'directions_car' : 'receipt'"
                          :color="props.row.item_type === 'object' ? 'blue' : 'red'"
                          size="xs"
                          class="q-mr-xs"
                        />
                        {{ props.row.name }}
                      </div>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-billing_period="props">
                    <q-td :props="props">
                      {{ t(`payments.months.${props.row.billing_month}`) }}
                      {{ props.row.billing_year }}
                    </q-td>
                  </template>
                  <template v-slot:body-cell-amount="props">
                    <q-td :props="props" class="text-right">
                      {{ formatCurrency(props.row.amount) }}
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
                        @click="openItem(props.row)"
                      >
                        <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Графік заборгованості по місяцях - ОНОВЛЕНО для відображення розбивки за типами послуг -->
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
                  <overdue-chart :data="overdueByMonthData" :show-split="true" />
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

      <!-- Інші дашборди без змін -->
      <!-- Дашборд для нових клієнтів та активності -->
      <div v-if="selectedDashboard.value === 'activity'">
        <!-- Не змінюємо код цього дашборду -->
      </div>

      <!-- Дашборд фінансової статистики -->
      <div v-if="selectedDashboard.value === 'financial'">
        <!-- Не змінюємо код цього дашборду -->
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { PaymentsApi } from 'src/api/payments'
import OverdueChart from 'components/dashboard/OverdueChart.vue'
import PieChart from 'components/dashboard/PieChart.vue' // Додаємо новий компонент для кругової діаграми

const router = useRouter()
const $q = useQuasar()
const { t, locale } = useI18n()

// Для вибору дашборду - залишається без змін
const dashboardOptions = computed(() => [
  { label: t('dashboard.types.overduePayments'), value: 'overdue' },
  { label: t('dashboard.types.activity'), value: 'activity' },
  { label: t('dashboard.types.financial'), value: 'financial' },
])
const selectedDashboard = ref({ value: 'overdue' })

// Оновлюємо повний об'єкт вибраного дашборду при зміні мови - без змін
watch(
  [locale, dashboardOptions],
  () => {
    const currentOption = dashboardOptions.value.find(
      (option) => option.value === selectedDashboard.value.value,
    )
    if (currentOption) {
      selectedDashboard.value = currentOption
    }
  },
  { immediate: true },
)

// Для даних по заборгованості - без змін
const loadingOverdueData = ref(false)

// Оновлюємо структуру для відображення розбивки заборгованості
const overdueMetrics = ref({
  totalAmount: 0,
  clientsCount: 0,
  objectsCount: 0,
  paymentRate: 0,
  objectsOverdueAmount: 0,
  fixedServicesOverdueAmount: 0,
  objectClientsCount: 0,
  fixedClientsCount: 0,
})
const overdueClients = ref([])
const overdueObjects = ref([])
const overdueByMonthData = ref([])

// Додаємо фільтр для таблиці об'єктів та послуг з простроченими оплатами
const overdueItemsFilter = ref('all')

// Фільтрований список об'єктів та послуг
const filteredOverdueItems = computed(() => {
  if (overdueItemsFilter.value === 'all') {
    return overdueObjects.value
  } else {
    return overdueObjects.value.filter((item) => item.item_type === overdueItemsFilter.value)
  }
})

// Колонки для таблиці - додаємо відображення типу позиції
const overdueObjectsColumns = computed(() => [
  {
    name: 'name',
    align: 'left',
    label: t('wialonObjects.name'),
    field: 'name',
    sortable: true,
  },
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
  {
    name: 'amount',
    align: 'right',
    label: t('payments.amount'),
    field: 'amount',
    sortable: true,
  },
  {
    name: 'item_type',
    align: 'center',
    label: t('dashboard.itemType'),
    field: 'item_type',
    sortable: true,
    format: (val) => t(`dashboard.itemTypes.${val}`),
  },
  {
    name: 'actions',
    align: 'center',
    label: t('common.actions'),
    field: 'actions',
    sortable: false,
  },
])

// Метод для завантаження даних заборгованості
const loadOverdueData = async () => {
  loadingOverdueData.value = true

  try {
    console.log('Завантаження даних заборгованості...')

    // API запит для отримання метрик заборгованості
    const metricsResponse = await PaymentsApi.getOverdueMetrics()
    console.log('Отримані метрики заборгованості:', metricsResponse.data)
    overdueMetrics.value = metricsResponse.data.metrics

    // API запит для отримання клієнтів з заборгованістю
    const clientsResponse = await PaymentsApi.getOverdueClients()
    console.log('Отримані клієнти з заборгованістю:', clientsResponse.data)
    overdueClients.value = clientsResponse.data.clients || []

    // API запит для отримання об'єктів з заборгованими оплатами
    const objectsResponse = await PaymentsApi.getOverdueObjects()
    console.log("Отримані об'єкти з заборгованістю:", objectsResponse.data)
    overdueObjects.value = objectsResponse.data.objects || []

    // API запит для отримання даних для графіка
    const chartResponse = await PaymentsApi.getOverdueByMonth()
    console.log('Отримані дані для графіка:', chartResponse.data)
    overdueByMonthData.value = chartResponse.data.monthlyData || []

    // Перевірка наявності даних для графіка
    if (overdueByMonthData.value && overdueByMonthData.value.length > 0) {
      console.log('Дані для графіка готові:', overdueByMonthData.value.length, 'записів')
    } else {
      console.warn('Немає даних для графіка!')
    }
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

// Спостерігаємо за зміною мови для оновлення заголовків
watch(locale, () => {
  console.log('Мова змінилася на:', locale.value)
})

// Форматування валюти
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

// Навігація до клієнта
const openClient = (clientId) => {
  router.push({ name: 'client-details', params: { id: clientId } })
}

// Навігація до об'єкта або відкриття деталей рахунку залежно від типу
const openItem = (item) => {
  if (item.item_type === 'object') {
    router.push({ name: 'wialon-object-details', params: { id: item.id } })
  } else if (item.item_type === 'fixed') {
    router.push({ name: 'invoice-details', params: { id: item.id } })
  }
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
