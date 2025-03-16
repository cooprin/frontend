<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!client" class="row justify-center q-pa-md">
      <q-banner class="bg-negative text-white">
        {{ $t('clients.notFound') }}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('common.back')" @click="goBack" />
        </template>
      </q-banner>
    </div>

    <template v-else>
      <!-- Заголовок сторінки з кнопками дій -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="text-h6 q-ml-sm">{{ client.name }}</div>
        <q-space />
        <q-btn color="warning" icon="edit" :label="$t('common.edit')" @click="openEditDialog" />
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
          <q-tab name="info" :label="$t('clients.tabs.info')" />
          <q-tab name="objects" :label="$t('clients.tabs.objects')" />
          <q-tab name="documents" :label="$t('clients.tabs.documents')" />
          <q-tab name="services" :label="$t('clients.tabs.services')" />
          <q-tab name="invoices" :label="$t('clients.tabs.invoices')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Вкладка з інформацією -->
          <q-tab-panel name="info">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('clients.basicInfo') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <!-- Основні дані клієнта -->
                      <div class="col-12 col-sm-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.name') }}</q-item-label>
                            <q-item-label>{{ client.name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.fullName') }}</q-item-label>
                            <q-item-label>{{ client.full_name || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.contactPerson') }}</q-item-label>
                            <q-item-label>{{ client.contact_person || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.phone') }}</q-item-label>
                            <q-item-label>{{ client.phone || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.email') }}</q-item-label>
                            <q-item-label>{{ client.email || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-12">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.address') }}</q-item-label>
                            <q-item-label>{{ client.address || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-12">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.description') }}</q-item-label>
                            <q-item-label>{{ client.description || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Wialon інформація -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1">Wialon</div>
                  </q-card-section>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-sm-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.wialonId') }}</q-item-label>
                            <q-item-label>{{ client.wialon_id || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.wialonUsername') }}</q-item-label>
                            <q-item-label>{{ client.wialon_username || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Статистика клієнта -->
                <q-card flat bordered class="q-mt-md">
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('clients.statistics') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.objectsCount') }}</q-item-label>
                            <q-item-label class="text-h6">{{
                              client.objects_count || 0
                            }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div class="col-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.documentsCount') }}</q-item-label>
                            <q-item-label class="text-h6">{{
                              client.documents_count || 0
                            }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Вкладка з об'єктами -->
          <q-tab-panel name="objects">
            <div class="text-h6">{{ $t('clients.tabs.objects') }}</div>
            <div
              v-if="!client.objects || client.objects.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('clients.noObjects') }}
            </div>
            <q-list v-else bordered separator>
              <q-item
                v-for="object in client.objects"
                :key="object.id"
                clickable
                @click="openObjectDetails(object)"
              >
                <q-item-section>
                  <q-item-label>{{ object.name }}</q-item-label>
                  <q-item-label caption
                    >{{ $t('clients.wialonId') }}: {{ object.wialon_id || '-' }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="getStatusColor(object.status)">
                    {{ $t(`wialonObjects.statuses.${object.status}`) }}
                  </q-badge>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="chevron_right" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Вкладка з документами -->
          <q-tab-panel name="documents">
            <div class="row justify-between q-mb-md">
              <div class="text-h6">{{ $t('clients.tabs.documents') }}</div>
              <q-btn
                color="primary"
                icon="upload"
                :label="$t('clients.documents.add')"
                @click="openUploadDialog"
              />
            </div>
            <div
              v-if="!client.documents || client.documents.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('clients.documents.noDocuments') }}
            </div>
            <q-list v-else bordered separator>
              <q-item
                v-for="doc in client.documents"
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
                    icon="download"
                    color="primary"
                    @click.stop="downloadDocument(doc)"
                  />
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
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Вкладка з послугами -->
          <q-tab-panel name="services">
            <div class="row justify-between q-mb-md">
              <div class="text-h6">{{ $t('clients.tabs.services') }}</div>
            </div>

            <div v-if="loadingServices" class="text-center q-pa-md">
              <q-spinner color="primary" size="3em" />
            </div>

            <div
              v-else-if="!clientServices || clientServices.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('services.noServices') }}
            </div>

            <q-list v-else bordered separator>
              <q-item
                v-for="service in clientServices"
                :key="service.id"
                clickable
                @click="openServiceDetails(service)"
              >
                <q-item-section>
                  <q-item-label>{{ service.service_name }}</q-item-label>
                  <q-item-label caption>
                    {{ $t(`services.types.${service.service_type}`) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-chip
                    :color="service.status === 'active' ? 'positive' : 'grey'"
                    text-color="white"
                    dense
                  >
                    {{ $t(`services.statuses.${service.status}`) }}
                  </q-chip>
                </q-item-section>

                <q-item-section side>
                  <q-item-label>{{ formatCurrency(service.calculated_price) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Вкладка з рахунками -->
          <q-tab-panel name="invoices">
            <div class="row justify-between q-mb-md">
              <div class="text-h6">{{ $t('clients.tabs.invoices') }}</div>
              <q-btn
                color="primary"
                icon="add"
                :label="$t('invoices.create')"
                @click="openCreateInvoiceDialog"
              />
            </div>

            <div v-if="loadingInvoices" class="text-center q-pa-md">
              <q-spinner color="primary" size="3em" />
            </div>

            <div
              v-else-if="!clientInvoices || clientInvoices.items.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('invoices.noInvoices') }}
            </div>

            <q-table
              v-else
              :rows="clientInvoices.items"
              :columns="invoiceColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 0 }"
              flat
              bordered
            >
              <!-- Слот для дати рахунку -->
              <template v-slot:body-cell-invoice_date="props">
                <q-td :props="props">
                  {{ formatDate(props.row.invoice_date) }}
                </q-td>
              </template>

              <!-- Слот для розрахункового періоду -->
              <template v-slot:body-cell-billing_period="props">
                <q-td :props="props">
                  {{ $t(`invoices.months.${props.row.billing_month}`) }}
                  {{ props.row.billing_year }}
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
                  <q-chip :color="getInvoiceStatusColor(props.row.status)" text-color="white" dense>
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
                    @click="openInvoiceDetails(props.row)"
                  >
                    <q-tooltip>{{ $t('common.view') }}</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>

    <!-- Діалог завантаження документа -->
    <q-dialog v-model="uploadDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('clients.documents.upload') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="uploadDocument" class="q-gutter-md">
            <q-file
              v-model="documentFile"
              :label="$t('clients.documents.selectFile')"
              outlined
              counter
              bottom-slots
              :rules="[(val) => !!val || $t('common.validation.required')]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-input
              v-model="documentDescription"
              :label="$t('clients.documents.description')"
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

    <!-- Діалог підтвердження видалення документа -->
    <q-dialog v-model="deleteDocumentDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('clients.documents.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteDocument"
            :loading="deletingDocument"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог редагування клієнта -->
    <client-dialog v-model="showDialog" :edit-data="client" @saved="loadClient" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ClientsApi } from 'src/api/clients'
import ClientDialog from 'components/clients/ClientDialog.vue'
import { ServicesApi } from 'src/api/services'

import { InvoicesApi } from 'src/api/invoices'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const clientServices = ref([])
const loadingServices = ref(false)

const loadClientServices = async () => {
  if (!client.value) return

  loadingServices.value = true
  try {
    const response = await ServicesApi.getClientServices(client.value.id)
    clientServices.value = response.data.services
  } catch (error) {
    console.error('Error loading client services:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    clientServices.value = []
  } finally {
    loadingServices.value = false
  }
}

// State
const client = ref(null)
const loading = ref(true)
const tab = ref('info')
const showDialog = ref(false)
const uploadDialog = ref(false)
const documentFile = ref(null)
const documentDescription = ref('')
const uploading = ref(false)
const deleteDocumentDialog = ref(false)
const documentToDelete = ref(null)
const deletingDocument = ref(false)
const clientInvoices = ref({ items: [], total: 0 })
const loadingInvoices = ref(false)
const showInvoiceDialog = ref(false)

const loadClientInvoices = async () => {
  if (!client.value) return

  loadingInvoices.value = true
  try {
    const response = await InvoicesApi.getClientInvoices(client.value.id, { perPage: 'All' })
    clientInvoices.value = response.data
  } catch (error) {
    console.error('Error loading client invoices:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    clientInvoices.value = { items: [], total: 0 }
  } finally {
    loadingInvoices.value = false
  }
}

const openCreateInvoiceDialog = () => {
  showInvoiceDialog.value = true
}

const openInvoiceDetails = (invoice) => {
  router.push({ name: 'invoice-details', params: { id: invoice.id } })
}

const getInvoiceStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    issued: 'info',
    paid: 'positive',
    cancelled: 'negative',
  }
  return colors[status] || 'grey'
}

const openServiceDetails = (service) => {
  router.push({ name: 'service-details', params: { id: service.service_id } })
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

// Methods
const loadClient = async () => {
  loading.value = true
  try {
    const clientId = route.params.id
    const response = await ClientsApi.getClient(clientId)
    client.value = response.data.client
    await Promise.all([loadClientServices(), loadClientInvoices()])
  } catch (error) {
    console.error('Error loading client:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    client.value = null
  } finally {
    loading.value = false
  }
}

const invoiceColumns = computed(() => [
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

const goBack = () => {
  router.push({ name: 'clients' })
}

const openEditDialog = () => {
  showDialog.value = true
}

const openObjectDetails = (object) => {
  router.push({ name: 'wialon-object-details', params: { id: object.id } })
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    suspended: 'warning',
    inactive: 'grey',
  }
  return colors[status] || 'grey'
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
      formData.append('description', documentDescription.value)
    }

    await ClientsApi.uploadDocument(client.value.id, formData)

    $q.notify({
      color: 'positive',
      message: t('clients.documents.uploadSuccess'),
      icon: 'check',
    })

    uploadDialog.value = false
    loadClient() // Перезавантажуємо дані клієнта, щоб оновити список документів
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
  const url = ClientsApi.getDocumentUrl(document.file_path)
  window.open(url, '_blank')
}

const confirmDeleteDocument = (document) => {
  documentToDelete.value = document
  deleteDocumentDialog.value = true
}

const deleteDocument = async () => {
  if (!documentToDelete.value) return

  deletingDocument.value = true
  try {
    await ClientsApi.deleteDocument(client.value.id, documentToDelete.value.id)

    $q.notify({
      color: 'positive',
      message: t('clients.documents.deleteSuccess'),
      icon: 'check',
    })

    loadClient() // Перезавантажуємо дані клієнта, щоб оновити список документів
  } catch (error) {
    console.error('Error deleting document:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  } finally {
    deletingDocument.value = false
    deleteDocumentDialog.value = false
  }
}

// Життєвий цикл
onMounted(() => {
  loadClient()
})
</script>

<style scoped>
.q-tab-panels {
  background-color: transparent;
}
</style>
