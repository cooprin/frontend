<template>
  <q-page padding>
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-md">
          <div class="col-auto">
            <div class="text-h5">
              {{ $t('portal.pages.invoices.title') }}
            </div>
            <div class="text-subtitle2 text-grey-7">
              {{ $t('portal.pages.invoices.description') }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="refresh"
              :label="$t('common.refresh')"
              @click="loadInvoices"
              :loading="loading"
            />
          </div>
        </div>

        <!-- Filters -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('portal.pages.invoices.filters.status')"
                  clearable
                  emit-value
                  map-options
                  dense
                  outlined
                  @update:model-value="applyFilters"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.year"
                  :options="yearOptions"
                  :label="$t('portal.pages.invoices.filters.year')"
                  clearable
                  emit-value
                  map-options
                  dense
                  outlined
                  @update:model-value="applyFilters"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.month"
                  :options="monthOptions"
                  :label="$t('portal.pages.invoices.filters.month')"
                  clearable
                  emit-value
                  map-options
                  dense
                  outlined
                  @update:model-value="applyFilters"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-btn
                  color="secondary"
                  :label="$t('common.clearFilters')"
                  @click="clearFilters"
                  class="full-width"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="40px" color="primary" />
          <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
        </div>

        <!-- Invoices List -->
        <div v-else-if="invoices.length > 0">
          <q-card
            v-for="invoice in invoices"
            :key="invoice.id"
            class="invoice-card q-mb-md"
            bordered
          >
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <div class="text-h6 text-weight-bold">{{ invoice.invoice_number }}</div>
                    <q-chip
                      :color="getStatusColor(invoice.status)"
                      text-color="white"
                      :label="$t(`portal.pages.invoices.statuses.${invoice.status}`)"
                      dense
                    />
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-auto">
                      <div class="text-caption text-grey-6">
                        {{ $t('portal.pages.invoices.invoiceDate') }}
                      </div>
                      <div class="text-body2">{{ formatDate(invoice.invoice_date) }}</div>
                    </div>
                    <div class="col-auto">
                      <div class="text-caption text-grey-6">
                        {{ $t('portal.pages.invoices.billingPeriod') }}
                      </div>
                      <div class="text-body2">
                        {{ $t(`portal.pages.invoices.months.${invoice.billing_month}`) }}
                        {{ invoice.billing_year }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <div class="text-caption text-grey-6">
                        {{ $t('portal.pages.invoices.totalAmount') }}
                      </div>
                      <div class="text-h6 text-primary text-weight-bold">
                        {{ formatCurrency(invoice.total_amount) }}
                      </div>
                    </div>
                  </div>

                  <div v-if="invoice.payment_date" class="q-mt-sm">
                    <div class="text-caption text-grey-6">
                      {{ $t('portal.pages.invoices.paymentDate') }}
                    </div>
                    <div class="text-body2 text-positive">
                      {{ formatDate(invoice.payment_date) }}
                    </div>
                  </div>
                </div>

                <div class="col-auto">
                  <div class="row q-gutter-sm">
                    <q-btn
                      color="primary"
                      icon="visibility"
                      :label="$t('common.view')"
                      @click="viewInvoiceDetails(invoice)"
                      flat
                    />
                    <q-btn
                      color="secondary"
                      icon="download"
                      :label="$t('portal.pages.invoices.downloadPdf')"
                      @click="downloadInvoicePdf(invoice)"
                      :loading="downloadingPdf === invoice.id"
                      flat
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Pagination -->
          <div class="row justify-center q-mt-md" v-if="pagination.totalPages > 1">
            <q-pagination
              v-model="pagination.page"
              :max="pagination.totalPages"
              :max-pages="6"
              boundary-links
              @update:model-value="loadInvoices"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="receipt" size="80px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">
            {{
              hasActiveFilters
                ? $t('portal.pages.invoices.noFilteredInvoices')
                : $t('portal.pages.invoices.noInvoices')
            }}
          </div>
          <div v-if="hasActiveFilters" class="q-mt-sm">
            <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center q-py-md">
          <q-icon name="error" size="48px" color="negative" />
          <div class="q-mt-sm text-negative">{{ error }}</div>
          <q-btn
            color="primary"
            :label="$t('common.retry')"
            @click="loadInvoices"
            class="q-mt-md"
          />
        </div>
      </div>
    </div>

    <!-- Invoice Details Dialog -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pa-md bg-primary text-white">
          <div class="text-h6">
            {{ selectedInvoice?.invoice_number }} - {{ $t('portal.pages.invoices.details') }}
          </div>
          <q-space />
          <q-btn
            flat
            round
            icon="download"
            @click="downloadInvoicePdf(selectedInvoice)"
            :loading="downloadingPdf === selectedInvoice?.id"
            class="q-mr-sm"
          />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-if="selectedInvoice" class="row q-gutter-md">
            <!-- Invoice Information -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">{{ $t('portal.pages.invoices.information') }}</div>

                  <q-list>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>{{
                          $t('portal.pages.invoices.invoiceNumber')
                        }}</q-item-label>
                        <q-item-label>{{ selectedInvoice.invoice_number }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>{{
                          $t('portal.pages.invoices.invoiceDate')
                        }}</q-item-label>
                        <q-item-label>{{ formatDate(selectedInvoice.invoice_date) }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>{{
                          $t('portal.pages.invoices.billingPeriod')
                        }}</q-item-label>
                        <q-item-label>
                          {{ $t(`portal.pages.invoices.months.${selectedInvoice.billing_month}`) }}
                          {{ selectedInvoice.billing_year }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>{{
                          $t('portal.pages.invoices.status')
                        }}</q-item-label>
                        <q-item-label>
                          <q-chip
                            :color="getStatusColor(selectedInvoice.status)"
                            text-color="white"
                            :label="$t(`portal.pages.invoices.statuses.${selectedInvoice.status}`)"
                            dense
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>{{
                          $t('portal.pages.invoices.totalAmount')
                        }}</q-item-label>
                        <q-item-label class="text-h6 text-primary text-weight-bold">
                          {{ formatCurrency(selectedInvoice.total_amount) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="selectedInvoice.payment_date">
                      <q-item-section>
                        <q-item-label caption>{{
                          $t('portal.pages.invoices.paymentDate')
                        }}</q-item-label>
                        <q-item-label class="text-positive">
                          {{ formatDate(selectedInvoice.payment_date) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Invoice Items -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">{{ $t('portal.pages.invoices.items') }}</div>

                  <q-list
                    v-if="selectedInvoice.items && selectedInvoice.items.length > 0"
                    bordered
                    separator
                  >
                    <q-item v-for="item in selectedInvoice.items" :key="item.id">
                      <q-item-section>
                        <q-item-label>{{ item.service_name }}</q-item-label>
                        <q-item-label caption v-if="item.description">
                          {{ item.description }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ $t('portal.pages.invoices.quantity') }}: {{ item.quantity }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label>{{ formatCurrency(item.total_price) }}</q-item-label>
                        <q-item-label caption>
                          {{ formatCurrency(item.unit_price) }} /
                          {{ $t('portal.pages.invoices.unit') }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <div v-else class="text-center text-grey-6 q-py-md">
                    {{ $t('portal.pages.invoices.noItems') }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PortalApi } from 'src/api/portal'
import { date, Notify } from 'quasar'

const { t: $t } = useI18n()

// Reactive data
const invoices = ref([])
const loading = ref(false)
const error = ref(null)
const downloadingPdf = ref(null)
const showDetailsDialog = ref(false)
const selectedInvoice = ref(null)

// Filters
const filters = ref({
  status: null,
  year: null,
  month: null,
})

// Pagination
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

// Computed
const hasActiveFilters = computed(() => {
  return !!(filters.value.status || filters.value.year || filters.value.month)
})

const statusOptions = computed(() => [
  { label: $t('portal.pages.invoices.statuses.issued'), value: 'issued' },
  { label: $t('portal.pages.invoices.statuses.paid'), value: 'paid' },
  { label: $t('portal.pages.invoices.statuses.cancelled'), value: 'cancelled' },
])

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 4; i++) {
    const year = currentYear - i
    years.push({ label: year.toString(), value: year })
  }
  return years
})

const monthOptions = computed(() => {
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push({
      label: $t(`portal.pages.invoices.months.${i}`),
      value: i,
    })
  }
  return months
})

// Methods
const loadInvoices = async () => {
  try {
    loading.value = true
    error.value = null

    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value,
    }

    // Remove null values
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await PortalApi.getInvoices(params)

    if (response.data.success) {
      invoices.value = response.data.invoices
      pagination.value = response.data.pagination
    } else {
      error.value = response.data.message || $t('portal.pages.invoices.loadError')
    }
  } catch (err) {
    console.error('Error loading invoices:', err)
    error.value = err.response?.data?.message || $t('portal.pages.invoices.loadError')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  loadInvoices()
}

const clearFilters = () => {
  filters.value = {
    status: null,
    year: null,
    month: null,
  }
  pagination.value.page = 1
  loadInvoices()
}

const downloadInvoicePdf = async (invoice) => {
  try {
    downloadingPdf.value = invoice.id

    const response = await PortalApi.downloadInvoice(invoice.id)

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoice.invoice_number}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)

    Notify.create({
      type: 'positive',
      message: $t('portal.pages.invoices.downloadSuccess'),
    })
  } catch (error) {
    console.error('Error downloading invoice PDF:', error)
    Notify.create({
      type: 'negative',
      message: $t('portal.pages.invoices.downloadError'),
    })
  } finally {
    downloadingPdf.value = null
  }
}

const viewInvoiceDetails = (invoice) => {
  selectedInvoice.value = invoice
  showDetailsDialog.value = true
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    issued: 'orange',
    paid: 'green',
    cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

// Lifecycle
onMounted(() => {
  loadInvoices()
})
</script>

<style scoped>
.invoice-card {
  transition: all 0.3s ease;
}

.invoice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
