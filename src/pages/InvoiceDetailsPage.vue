<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!invoice" class="row justify-center q-pa-md">
      <q-banner class="bg-negative text-white">
        {{ $t('invoices.notFound') }}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('common.back')" @click="goBack" />
        </template>
      </q-banner>
    </div>

    <template v-else>
      <!-- Заголовок сторінки з кнопками дій -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="text-h6 q-ml-sm">{{ invoice.invoice_number }}</div>
        <q-chip class="q-ml-md" :color="getStatusColor(invoice.status)" text-color="white">
          {{ $t(`invoices.statuses.${invoice.status}`) }}
        </q-chip>
        <q-space />

        <q-btn-dropdown color="primary" :label="$t('common.actions')">
          <q-list>
            <q-item clickable v-close-popup @click="printInvoice">
              <q-item-section avatar>
                <q-icon name="print" color="secondary" />
              </q-item-section>
              <q-item-section>
                {{ $t('invoices.print') }}
              </q-item-section>
            </q-item>

            <q-item
              v-if="invoice.status === 'issued'"
              clickable
              v-close-popup
              @click="openEditDialog"
            >
              <q-item-section avatar>
                <q-icon name="edit" color="warning" />
              </q-item-section>
              <q-item-section>
                {{ $t('invoices.edit') }}
              </q-item-section>
            </q-item>

            <q-item v-if="invoice.status === 'issued'" clickable v-close-popup @click="markAsPaid">
              <q-item-section avatar>
                <q-icon name="payment" color="positive" />
              </q-item-section>
              <q-item-section>
                {{ $t('invoices.markAsPaid') }}
              </q-item-section>
            </q-item>

            <q-item
              v-if="invoice.status === 'issued'"
              clickable
              v-close-popup
              @click="markAsCancelled"
            >
              <q-item-section avatar>
                <q-icon name="cancel" color="negative" />
              </q-item-section>
              <q-item-section>
                {{ $t('invoices.markAsCancelled') }}
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="sendEmailToClient">
              <q-item-section avatar>
                <q-icon name="email" color="info" />
              </q-item-section>
              <q-item-section>
                {{ $t('invoices.sendEmail') }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- Основний контент з табами -->
      <q-card flat bordered>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="info" :label="$t('invoices.tabs.info')" />
          <q-tab name="items" :label="$t('invoices.tabs.items')" />
          <q-tab name="documents" :label="$t('invoices.tabs.documents')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Вкладка з інформацією -->
          <q-tab-panel name="info">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('invoices.basicInfo') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('invoices.invoiceNumber') }}</q-item-label>
                          <q-item-label>{{ invoice.invoice_number }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('invoices.invoiceDate') }}</q-item-label>
                          <q-item-label>{{ formatDate(invoice.invoice_date) }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('invoices.client') }}</q-item-label>
                          <q-item-label>
                            <q-btn
                              flat
                              dense
                              color="primary"
                              :label="invoice.client_name"
                              @click="openClientDetails(invoice)"
                            />
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('invoices.billingPeriod') }}</q-item-label>
                          <q-item-label>
                            {{ $t(`invoices.months.${invoice.billing_month}`) }}
                            {{ invoice.billing_year }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('invoices.totalAmount') }}</q-item-label>
                          <q-item-label class="text-weight-bold">
                            {{ formatCurrency(invoice.total_amount) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('invoices.status') }}</q-item-label>
                          <q-item-label>
                            <q-chip
                              :color="getStatusColor(invoice.status)"
                              text-color="white"
                              dense
                            >
                              {{ $t(`invoices.statuses.${invoice.status}`) }}
                            </q-chip>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <template v-if="invoice.payment_date">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('invoices.paymentDate') }}</q-item-label>
                            <q-item-label>{{ formatDate(invoice.payment_date) }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>

                      <q-item v-if="invoice.notes">
                        <q-item-section>
                          <q-item-label caption>{{ $t('invoices.notes') }}</q-item-label>
                          <q-item-label>{{ invoice.notes }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Вкладка з позиціями -->
          <q-tab-panel name="items">
            <div class="text-h6">{{ $t('invoices.items.title') }}</div>
            <div
              v-if="!invoice.items || invoice.items.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('invoices.noItems') }}
            </div>
            <q-table
              v-else
              :rows="invoice.items"
              :columns="itemsColumns"
              row-key="id"
              :pagination="itemsPagination"
              flat
              bordered
            >
              <!-- Слот для ціни за одиницю -->
              <template v-slot:body-cell-unit_price="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.unit_price) }}
                </q-td>
              </template>

              <!-- Слот для загальної ціни -->
              <template v-slot:body-cell-total_price="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.total_price) }}
                </q-td>
              </template>
            </q-table>

            <div class="row justify-end q-mt-md">
              <div class="text-h6">
                {{ $t('invoices.totalAmount') }}: {{ formatCurrency(invoice.total_amount) }}
              </div>
            </div>
          </q-tab-panel>

          <!-- Вкладка з документами -->
          <q-tab-panel name="documents">
            <div class="row justify-between q-mb-md">
              <div class="text-h6">{{ $t('invoices.documents.title') }}</div>
              <q-btn
                color="primary"
                icon="upload"
                :label="$t('invoices.documents.add')"
                @click="openUploadDialog"
              />
            </div>
            <div
              v-if="!invoice.documents || invoice.documents.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('invoices.documents.noDocuments') }}
            </div>
            <q-list v-else bordered separator>
              <q-item
                v-for="doc in invoice.documents"
                :key="doc.id"
                clickable
                @click="downloadDocument(doc)"
              >
                <q-item-section avatar>
                  <q-icon name="description" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.document_name }}</q-item-label>
                  <q-item-label caption>{{ formatFileSize(doc.file_size) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    @click.stop="confirmDeleteDocument(doc)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="download"
                    color="primary"
                    @click.stop="downloadDocument(doc)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>

    <!-- Діалог редагування рахунку -->
    <invoice-edit-dialog v-model="showEditDialog" :invoice="invoice" @saved="onInvoiceUpdated" />

    <!-- Діалог завантаження документа -->
    <q-dialog v-model="uploadDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('invoices.documents.upload') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="uploadDocument" class="q-gutter-md">
            <q-file
              v-model="documentFile"
              :label="$t('invoices.documents.selectFile')"
              outlined
              counter
              bottom-slots
              :rules="[(val) => !!val || t('common.validation.required')]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-input
              v-model="documentDescription"
              :label="$t('invoices.documents.description')"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn
                :label="$t('common.upload')"
                color="primary"
                type="submit"
                :loading="uploading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог зміни статусу на "Оплачено" -->
    <q-dialog v-model="showPaidDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('invoices.markAsPaid') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="updateStatus('paid')" class="q-gutter-md">
            <!-- Дата платежу -->
            <q-input
              v-model="statusForm.payment_date"
              :label="$t('invoices.paymentDate')"
              outlined
              :rules="[(val) => !!val || t('common.validation.required')]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="statusForm.payment_date" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <!-- Примітки -->
            <q-input
              v-model="statusForm.notes"
              :label="$t('invoices.notes')"
              type="textarea"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn
                :label="$t('common.save')"
                color="primary"
                type="submit"
                :loading="updatingStatus"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог зміни статусу на "Скасовано" -->
    <q-dialog v-model="showCancelledDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('invoices.markAsCancelled') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="updateStatus('cancelled')" class="q-gutter-md">
            <!-- Примітки -->
            <q-input
              v-model="statusForm.notes"
              :label="$t('invoices.notes')"
              type="textarea"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn
                :label="$t('common.save')"
                color="primary"
                type="submit"
                :loading="updatingStatus"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { InvoicesApi } from 'src/api/invoices'
import { date } from 'quasar'
import InvoiceEditDialog from 'src/components/invoices/InvoiceEditDialog.vue'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const printInvoice = async () => {
  try {
    if (!invoice.value || !invoice.value.id) {
      $q.notify({
        color: 'negative',
        message: t('common.errors.idNotFound'),
        icon: 'error',
      })
      return
    }

    const userLanguage = localStorage.getItem('userLanguage') || 'uk'
    const response = await InvoicesApi.generateInvoicePdf(invoice.value.id, userLanguage)

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
const invoice = ref(null)
const loading = ref(true)
const tab = ref('info')
const uploadDialog = ref(false)
const documentFile = ref(null)
const documentDescription = ref('')
const uploading = ref(false)
const showPaidDialog = ref(false)
const showCancelledDialog = ref(false)
const updatingStatus = ref(false)
const showEditDialog = ref(false)

// Статус форма
const statusForm = ref({
  payment_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
  notes: '',
})

// Вкладка з позиціями
const itemsPagination = ref({
  rowsPerPage: 0, // 0 означає "всі рядки"
})

// Columns
const itemsColumns = computed(() => [
  {
    name: 'service_name',
    required: true,
    label: t('invoices.items.service'),
    align: 'left',
    field: 'service_name',
    sortable: true,
  },
  {
    name: 'description',
    label: t('invoices.items.description'),
    align: 'left',
    field: 'description',
    sortable: true,
  },
  {
    name: 'quantity',
    label: t('invoices.items.quantity'),
    align: 'center',
    field: 'quantity',
    sortable: true,
  },
  {
    name: 'unit_price',
    label: t('invoices.items.unitPrice'),
    align: 'right',
    field: 'unit_price',
    sortable: true,
  },
  {
    name: 'total_price',
    label: t('invoices.items.totalPrice'),
    align: 'right',
    field: 'total_price',
    sortable: true,
  },
])

// Methods
const loadInvoice = async () => {
  loading.value = true
  try {
    const invoiceId = route.params.id
    const response = await InvoicesApi.getInvoice(invoiceId)
    invoice.value = response.data.invoice
  } catch (error) {
    console.error('Error loading invoice:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    invoice.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'invoices' })
}

const openClientDetails = (invoice) => {
  router.push({ name: 'client-details', params: { id: invoice.client_id } })
}

const openEditDialog = () => {
  showEditDialog.value = true
}

const onInvoiceUpdated = () => {
  // Перезавантажуємо дані рахунку після редагування
  loadInvoice()

  $q.notify({
    color: 'positive',
    message: t('invoices.updateSuccess'),
    icon: 'check',
  })
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

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const openUploadDialog = () => {
  documentFile.value = null
  documentDescription.value = ''
  uploadDialog.value = true
}

const uploadDocument = async () => {
  if (!documentFile.value) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', documentFile.value)

    if (documentDescription.value) {
      formData.append('document_name', documentDescription.value)
    }

    await InvoicesApi.uploadInvoiceDocument(invoice.value.id, formData)

    $q.notify({
      color: 'positive',
      message: t('invoices.documents.uploadSuccess'),
      icon: 'check',
    })

    uploadDialog.value = false
    loadInvoice() // Перезавантажуємо дані рахунку, щоб оновити список документів
  } catch (error) {
    console.error('Error uploading document:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.uploading'),
      icon: 'error',
    })
  } finally {
    uploading.value = false
  }
}

const downloadDocument = (document) => {
  const url = InvoicesApi.getDocumentUrl(document.file_path)
  if (url) {
    window.open(url, '_blank')
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.errors.fileNotFound'),
      icon: 'error',
    })
  }
}

const sendEmailToClient = async () => {
  try {
    if (!invoice.value || !invoice.value.id) {
      $q.notify({
        color: 'negative',
        message: t('common.errors.idNotFound'),
        icon: 'error',
      })
      return
    }

    const response = await InvoicesApi.sendInvoiceEmail(invoice.value.id)

    $q.notify({
      color: 'positive',
      message: t('invoices.emailSent'),
      caption: response.data.recipient ? `Відправлено на: ${response.data.recipient}` : '',
      icon: 'email',
    })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.emailSending'),
      icon: 'error',
    })
  }
}

const markAsPaid = () => {
  statusForm.value.payment_date = date.formatDate(new Date(), 'YYYY-MM-DD')
  statusForm.value.notes = ''
  showPaidDialog.value = true
}

const markAsCancelled = () => {
  statusForm.value.payment_date = null
  statusForm.value.notes = ''
  showCancelledDialog.value = true
}

const updateStatus = async (status) => {
  updatingStatus.value = true

  try {
    const data = {
      status,
      ...statusForm.value,
    }

    await InvoicesApi.updateInvoiceStatus(invoice.value.id, data)

    $q.notify({
      color: 'positive',
      message: t('invoices.statusUpdateSuccess'),
      icon: 'check',
    })

    showPaidDialog.value = false
    showCancelledDialog.value = false

    loadInvoice() // Перезавантаження даних рахунку
  } catch (error) {
    console.error('Error updating invoice status:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    updatingStatus.value = false
  }
}

const confirmDeleteDocument = (document) => {
  $q.dialog({
    title: t('common.confirm'),
    message: t('invoices.documents.confirmDelete'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteDocument(document)
  })
}

const deleteDocument = async (document) => {
  try {
    await InvoicesApi.deleteInvoiceDocument(invoice.value.id, document.id)

    $q.notify({
      color: 'positive',
      message: t('invoices.documents.deleteSuccess'),
      icon: 'check',
    })

    loadInvoice() // Перезавантажуємо дані
  } catch (error) {
    console.error('Error deleting document:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

// Lifecycle
onMounted(() => {
  loadInvoice()
})
</script>
