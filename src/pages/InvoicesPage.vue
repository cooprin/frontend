<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">{{ $t('invoices.title') }}</div>
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
              <!-- Статус -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('invoices.filters.status')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Рік -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.year"
                  :options="yearOptions"
                  :label="$t('invoices.filters.year')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>

              <!-- Місяць -->
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="filters.month"
                  :options="monthOptions"
                  :label="$t('invoices.filters.month')"
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
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="invoices"
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
              :label="$t('invoices.filters.search')"
              outlined
              dense
              debounce="300"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="deep-orange"
              icon="receipt_long"
              :label="$t('invoices.generateInvoices')"
              @click="showGenerateDialog = true"
              class="q-ml-sm"
            />
            <q-btn
              color="primary"
              icon="add"
              class="q-ml-md"
              :label="$t('invoices.add')"
              @click="openCreateDialog"
            >
              <q-tooltip>{{ $t('invoices.add') }}</q-tooltip>
            </q-btn>
          </template>

          <!-- Слот для дати рахунку -->
          <template v-slot:body-cell-invoice_date="props">
            <q-td :props="props">
              {{ formatDate(props.row.invoice_date) }}
            </q-td>
          </template>

          <!-- Слот для розрахункового періоду -->
          <template v-slot:body-cell-billing_period="props">
            <q-td :props="props">
              {{ $t(`invoices.months.${props.row.billing_month}`) }} {{ props.row.billing_year }}
            </q-td>
          </template>

          <!-- Слот для загальної суми -->
          <template v-slot:body-cell-total_amount="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.total_amount) }}
            </q-td>
          </template>

          <!-- Слот для статусу -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="getStatusColor(props.row.status)" text-color="white" dense>
                {{ $t(`invoices.statuses.${props.row.status}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Слот для дій -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
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
                color="secondary"
                icon="print"
                @click="printInvoice(props.row)"
              >
                <q-tooltip>{{ $t('invoices.print') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <invoice-dialog v-model="showDialog" @saved="loadInvoices" />
    <invoice-generator-dialog v-model="showGenerateDialog" @generated="onInvoicesGenerated" />
  </q-page>
  <!-- Reports FAB -->
  <ReportsFAB page-identifier="invoices" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { InvoicesApi } from 'src/api/invoices'
import InvoiceDialog from 'components/invoices/InvoiceDialog.vue'
import { date } from 'quasar'
import InvoiceGeneratorDialog from 'components/invoices/InvoiceGeneratorDialog.vue'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'
import ReportsFAB from 'src/components/reports/ReportsFAB.vue'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()

const printInvoice = async (invoice) => {
  try {
    const userLanguage = localStorage.getItem('userLanguage') || 'uk'
    const response = await InvoicesApi.generateInvoicePdf(invoice.id, userLanguage)

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error('Error printing invoice:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.printing'),
      icon: 'error',
    })
  }
}

// State
const loading = ref(false)
const showDialog = ref(false)
const showFilters = ref(false)
const invoices = ref([])
const showGenerateDialog = ref(false)
// Searchable selects
const statusSearch = useSearchableSelect(ref([]))
const yearSearch = useSearchableSelect(ref([]))
const monthSearch = useSearchableSelect(ref([]))

const onInvoicesGenerated = (invoices) => {
  // Перезавантажити дані
  loadInvoices()

  // Показати повідомлення про успіх
  $q.notify({
    color: 'positive',
    message: t('invoices.generatedSuccess', { count: invoices.length }),
    icon: 'check',
  })
}

const pagination = ref({
  sortBy: 'invoice_date',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  rowsPerPageOptions: [5, 7, 10, 15, 20, 25, 50, 100],
})

// Filters
const filters = ref({
  search: '',
  status: null,
  year: null,
  month: null,
})

// Options
const statusOptions = computed(() => [
  { label: t('invoices.statuses.issued'), value: 'issued' },
  { label: t('invoices.statuses.paid'), value: 'paid' },
  { label: t('invoices.statuses.cancelled'), value: 'cancelled' },
])

// Поточний рік для фільтрів + 3 попередні
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 4; i++) {
    const year = currentYear - i
    years.push({ label: year.toString(), value: year })
  }
  return years
})

// Місяці для фільтрів
const monthOptions = computed(() => {
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push({ label: t(`invoices.months.${i}`), value: i })
  }
  return months
})

// Columns
const columns = computed(() => [
  {
    name: 'invoice_number',
    required: true,
    label: t('invoices.invoiceNumber'),
    align: 'left',
    field: 'invoice_number',
    sortable: true,
  },
  {
    name: 'invoice_date',
    label: t('invoices.invoiceDate'),
    align: 'left',
    field: 'invoice_date',
    sortable: true,
  },
  {
    name: 'client_name',
    label: t('invoices.client'),
    align: 'left',
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'billing_period',
    label: t('invoices.billingPeriod'),
    align: 'left',
    field: (row) => `${row.billing_month}-${row.billing_year}`,
    sortable: true,
  },
  {
    name: 'total_amount',
    label: t('invoices.totalAmount'),
    align: 'right',
    field: 'total_amount',
    sortable: true,
  },
  {
    name: 'status',
    label: t('invoices.status'),
    align: 'center',
    field: 'status',
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

const loadInvoices = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending ? 1 : 0,
      search: filters.value.search || undefined,
      status: filters.value.status,
      year: filters.value.year,
      month: filters.value.month,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await InvoicesApi.getInvoices(params)
    invoices.value = response.data.invoices
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error loading invoices:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: null,
    year: null,
    month: null,
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

  await loadInvoices()
}

const getStatusColor = (status) => {
  const colors = {
    issued: 'info',
    paid: 'positive',
    cancelled: 'grey',
  }
  return colors[status] || 'grey'
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const openDetails = (invoice) => {
  router.push({ name: 'invoice-details', params: { id: invoice.id } })
}

const openCreateDialog = () => {
  showDialog.value = true
}

// Watchers
watch(
  filters,
  () => {
    pagination.value.page = 1
    loadInvoices()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadInvoices()
  statusSearch.initializeOptions(statusOptions.value)
  yearSearch.initializeOptions(yearOptions.value)
  monthSearch.initializeOptions(monthOptions.value)
})
</script>
