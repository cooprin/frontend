<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('payments.title') }}</div>
          <q-space />
          <q-btn
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
            flat
            color="primary"
            @click="showFilters = !showFilters"
          />
        </div>

        <q-slide-transition>
          <div v-show="showFilters">
            <div class="row q-col-gutter-sm q-mb-md">
              <!-- Клієнт -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.clientId"
                  :options="clientSearch.filteredOptions.value"
                  :label="$t('payments.filters.client')"
                  option-label="label"
                  option-value="value"
                  outlined
                  dense
                  clearable
                  :loading="loadingClients"
                  use-input
                  input-debounce="300"
                  @filter="(val, update) => clientSearch.filterOptions(val, update)"
                  @popup-show="clientSearch.resetFilter"
                />
              </div>

              <!-- Тип платежу -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.paymentType"
                  :options="paymentTypeOptions"
                  :label="$t('payments.filters.paymentType')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Період з - по -->
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="filters.from"
                  outlined
                  dense
                  :label="$t('payments.filters.dateFrom')"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="filters.from" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-4">
                <q-input v-model="filters.to" outlined dense :label="$t('payments.filters.dateTo')">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="filters.to" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- Рік -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.year"
                  :options="yearOptions"
                  :label="$t('payments.filters.year')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Місяць -->
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="filters.month"
                  :options="monthOptions"
                  :label="$t('payments.filters.month')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Кнопки -->
              <div class="col-12 q-gutter-x-sm">
                <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
                <q-btn
                  color="secondary"
                  icon="data_saver_on"
                  :label="$t('payments.exportExcel')"
                  @click="exportToExcel"
                />
                <q-btn
                  color="deep-orange"
                  icon="insights"
                  :label="$t('payments.showStatistics')"
                  @click="loadStatistics"
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="payments"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="pagination.rowsPerPageOptions"
          :rows-per-page-label="$t('common.rowsPerPage')"
          :selected-rows-label="$t('common.selectedRows')"
          :pagination-label="paginationLabel"
        >
          <!-- Пошук -->
          <template v-slot:top-right>
            <q-input
              v-model="filters.search"
              :label="$t('payments.filters.search')"
              outlined
              dense
              debounce="300"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="primary"
              icon="add"
              class="q-ml-md"
              :label="$t('payments.add')"
              @click="openCreateDialog"
            >
              <q-tooltip>{{ $t('payments.add') }}</q-tooltip>
            </q-btn>
          </template>

          <!-- Слот для дати -->
          <template v-slot:body-cell-payment_date="props">
            <q-td :props="props">
              {{ formatDate(props.row.payment_date) }}
            </q-td>
          </template>

          <!-- Слот для суми -->
          <template v-slot:body-cell-amount="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.amount) }}
            </q-td>
          </template>

          <!-- Слот для типу платежу -->
          <template v-slot:body-cell-payment_type="props">
            <q-td :props="props">
              <q-chip :color="getPaymentTypeColor(props.row.payment_type)" text-color="white" dense>
                {{ $t(`payments.types.${props.row.payment_type}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для періоду -->
          <template v-slot:body-cell-payment_period="props">
            <q-td :props="props">
              {{ $t(`payments.months.${props.row.payment_month}`) }}
              {{ props.row.payment_year }}
            </q-td>
          </template>

          <!-- Слот для дій -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn-group flat>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="openDetails(props.row)"
                >
                  <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="warning"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Діалог статистики -->
    <q-dialog v-model="statisticsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('payments.statistics.title') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="loadingStatistics" class="text-center">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-sm">{{ $t('common.loading') }}</div>
        </q-card-section>

        <q-card-section v-else>
          <div class="row q-col-gutter-md">
            <!-- Загальна статистика -->
            <div class="col-12 col-md-6">
              <q-card bordered flat>
                <q-card-section>
                  <div class="text-h6">{{ $t('payments.statistics.summary') }}</div>
                </q-card-section>
                <q-card-section v-if="statistics.summary">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-4">
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{
                            $t('payments.statistics.totalAmount')
                          }}</q-item-label>
                          <q-item-label class="text-h5 text-primary">
                            {{ formatCurrency(statistics.summary.total_amount) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                    <div class="col-12 col-sm-4">
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{
                            $t('payments.statistics.paymentsCount')
                          }}</q-item-label>
                          <q-item-label class="text-h5 text-secondary">
                            {{ statistics.summary.payments_count }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                    <div class="col-12 col-sm-4">
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{
                            $t('payments.statistics.clientsCount')
                          }}</q-item-label>
                          <q-item-label class="text-h5 text-accent">
                            {{ statistics.summary.clients_count }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Статистика за типами платежів -->
            <div class="col-12 col-md-6">
              <q-card bordered flat>
                <q-card-section>
                  <div class="text-h6">{{ $t('payments.statistics.byType') }}</div>
                </q-card-section>
                <q-card-section v-if="statistics.paymentTypes">
                  <q-list bordered separator>
                    <q-item v-for="item in statistics.paymentTypes" :key="item.payment_type">
                      <q-item-section>
                        <q-item-label>
                          <q-chip
                            :color="getPaymentTypeColor(item.payment_type)"
                            text-color="white"
                            dense
                          >
                            {{ $t(`payments.types.${item.payment_type}`) }}
                          </q-chip>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.type_count }} платежів</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold">
                          {{ formatCurrency(item.type_amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Статистика за місяцями -->
            <div class="col-12 col-md-6">
              <q-card bordered flat>
                <q-card-section>
                  <div class="text-h6">{{ $t('payments.statistics.byMonth') }}</div>
                </q-card-section>
                <q-card-section v-if="statistics.monthly">
                  <q-list bordered separator>
                    <q-item v-for="item in statistics.monthly" :key="item.month">
                      <q-item-section>
                        <q-item-label>
                          {{ $t(`payments.months.${item.month}`) }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.monthly_count }} платежів</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold">
                          {{ formatCurrency(item.monthly_amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Топ клієнтів -->
            <div class="col-12 col-md-6">
              <q-card bordered flat>
                <q-card-section>
                  <div class="text-h6">{{ $t('payments.statistics.topClients') }}</div>
                </q-card-section>
                <q-card-section v-if="statistics.topClients">
                  <q-list bordered separator>
                    <q-item v-for="(item, index) in statistics.topClients" :key="item.client_id">
                      <q-item-section avatar>
                        <q-avatar color="primary" text-color="white">
                          {{ index + 1 }}
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.client_name }}</q-item-label>
                        <q-item-label caption>{{ item.client_count }} платежів</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold">
                          {{ formatCurrency(item.client_amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог підтвердження видалення -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('payments.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deletePayment"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог створення/редагування платежу -->
    <payment-dialog v-model="showDialog" :edit-data="editPayment" @saved="loadPayments" />
  </q-page>
  <!-- Reports FAB -->
  <ReportsFAB page-identifier="billing" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PaymentsApi } from 'src/api/payments'
import { ClientsApi } from 'src/api/clients'
import PaymentDialog from 'components/payments/PaymentDialog.vue'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'
import ReportsFAB from 'src/components/reports/ReportsFAB.vue'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingClients = ref(false)
const loadingStatistics = ref(false)
const showDialog = ref(false)
const statisticsDialog = ref(false)

const showFilters = ref(false)
const editPayment = ref(null)
const payments = ref([])
const deleteDialog = ref(false)
const paymentToDelete = ref(null)
const clientOptions = ref([])
// Searchable selects
const clientSearch = useSearchableSelect(clientOptions)
const statistics = ref({
  summary: null,
  monthly: [],
  paymentTypes: [],
  topClients: [],
})

const pagination = ref({
  sortBy: 'payment_date',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

// Фільтри
const filters = ref({
  search: '',
  clientId: null,
  paymentType: null,
  from: null,
  to: null,
  year: new Date().getFullYear().toString(),
  month: null,
})

// Опції
const paymentTypeOptions = computed(() => [
  { label: t('payments.types.regular'), value: 'regular' },
  { label: t('payments.types.advance'), value: 'advance' },
  { label: t('payments.types.debt'), value: 'debt' },
  { label: t('payments.types.adjustment'), value: 'adjustment' },
])

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 3; i <= currentYear; i++) {
    years.push({ label: i.toString(), value: i.toString() })
  }
  return years
})

const monthOptions = computed(() => [
  { label: t('payments.months.1'), value: '1' },
  { label: t('payments.months.2'), value: '2' },
  { label: t('payments.months.3'), value: '3' },
  { label: t('payments.months.4'), value: '4' },
  { label: t('payments.months.5'), value: '5' },
  { label: t('payments.months.6'), value: '6' },
  { label: t('payments.months.7'), value: '7' },
  { label: t('payments.months.8'), value: '8' },
  { label: t('payments.months.9'), value: '9' },
  { label: t('payments.months.10'), value: '10' },
  { label: t('payments.months.11'), value: '11' },
  { label: t('payments.months.12'), value: '12' },
])

// Columns
const columns = computed(() => [
  {
    name: 'payment_date',
    required: true,
    label: t('payments.date'),
    align: 'left',
    field: 'payment_date',
    sortable: true,
  },
  {
    name: 'client_name',
    label: t('payments.client'),
    align: 'left',
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'amount',
    label: t('payments.amount'),
    align: 'right',
    field: 'amount',
    sortable: true,
  },
  {
    name: 'payment_type',
    label: t('payments.type'),
    align: 'center',
    field: 'payment_type',
    sortable: true,
  },
  {
    name: 'payment_period',
    label: t('payments.period'),
    align: 'left',
    field: (row) => `${row.payment_month}-${row.payment_year}`,
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    sortable: false,
  },
])

// Methods
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
}

const loadPayments = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filters.value.search || undefined,
      clientId: filters.value.clientId?.value || undefined,
      paymentType: filters.value.paymentType,
      from: filters.value.from,
      to: filters.value.to,
      year: filters.value.year,
      month: filters.value.month,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await PaymentsApi.getPayments(params)
    payments.value = response.data.payments
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading payments:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  loadingStatistics.value = true
  statisticsDialog.value = true

  try {
    const params = {
      clientId: filters.value.clientId?.value || undefined,
      year: filters.value.year,
      from: filters.value.from,
      to: filters.value.to,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await PaymentsApi.getPaymentsStatistics(params)
    statistics.value = response.data.statistics
  } catch (error) {
    console.error('Error loading statistics:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingStatistics.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    clientId: null,
    paymentType: null,
    from: null,
    to: null,
    year: new Date().getFullYear().toString(),
    month: null,
  }
}

const exportToExcel = async () => {
  try {
    const params = {
      search: filters.value.search || undefined,
      clientId: filters.value.clientId?.value || undefined,
      paymentType: filters.value.paymentType,
      from: filters.value.from,
      to: filters.value.to,
      year: filters.value.year,
      month: filters.value.month,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await PaymentsApi.exportPayments(params)

    // Створюємо URL для скачування
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)

    // Створюємо тимчасове посилання для скачування
    const link = document.createElement('a')
    link.href = url
    const fileName = `payments_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()

    // Очищаємо після скачування
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    $q.notify({
      color: 'positive',
      message: t('payments.exportSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error exporting payments:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.exporting'),
      icon: 'error',
    })
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value = {
    ...pagination.value,
    page,
    rowsPerPage,
    sortBy,
    descending,
  }

  await loadPayments()
}

const getPaymentTypeColor = (type) => {
  const colors = {
    regular: 'primary',
    advance: 'positive',
    debt: 'warning',
    adjustment: 'purple',
  }
  return colors[type] || 'grey'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA')
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const openDetails = (payment) => {
  router.push({ name: 'payment-details', params: { id: payment.id } })
}

const openCreateDialog = () => {
  editPayment.value = null
  showDialog.value = true
}

const openEditDialog = (payment) => {
  editPayment.value = payment
  showDialog.value = true
}

const confirmDelete = (payment) => {
  paymentToDelete.value = payment
  deleteDialog.value = true
}

const deletePayment = async () => {
  try {
    await PaymentsApi.deletePayment(paymentToDelete.value.id)

    $q.notify({
      type: 'positive',
      message: t('payments.deleteSuccess'),
    })

    loadPayments()
  } catch (error) {
    console.error('Error deleting payment:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
    })
  }
}

const loadClients = async () => {
  loadingClients.value = true
  try {
    const response = await ClientsApi.getClients({ perPage: 'All' })

    clientOptions.value = response.data.clients.map((client) => ({
      label: client.name,
      value: client.id,
    }))
    clientSearch.initializeOptions(clientOptions.value)
  } catch (error) {
    console.error('Error loading clients:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingClients.value = false
  }
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadPayments()
  },
  { deep: true },
)

// Життєвий цикл
onMounted(() => {
  loadPayments()
  loadClients()
})
</script>

<style scoped>
/* Тут можна додати специфічні стилі для цієї сторінки */
</style>
