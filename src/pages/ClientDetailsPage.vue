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
                            <q-item-label caption>{{
                              $t('clients.wialonResourceId')
                            }}</q-item-label>
                            <q-item-label>{{ client.wialon_resource_id || '-' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
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

                <!-- Платіжна інформація Wialon -->
                <q-card flat bordered class="q-mt-md">
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('clients.payment.title') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <div v-if="loadingPayment" class="text-center q-pa-md">
                      <q-spinner color="primary" size="2em" />
                      <div class="text-caption q-mt-sm">{{ $t('clients.payment.loading') }}</div>
                    </div>

                    <div v-else-if="!paymentInfo?.isConfigured" class="text-center q-pa-md">
                      <q-icon name="warning" color="warning" size="2em" />
                      <div class="text-body2 q-mt-sm">
                        {{ $t('clients.payment.notConfigured') }}
                      </div>
                    </div>

                    <div v-else-if="!client.wialon_resource_id" class="text-center q-pa-md">
                      <q-icon name="info" color="info" size="2em" />
                      <div class="text-body2 q-mt-sm">
                        {{ $t('clients.payment.noWialonResourceId') }}
                      </div>
                    </div>

                    <div v-else-if="paymentInfo?.error" class="text-center q-pa-md">
                      <q-icon name="error" color="negative" size="2em" />
                      <div class="text-body2 q-mt-sm text-negative">
                        {{ $t('clients.payment.error') }}
                      </div>
                      <div class="text-caption q-mt-xs">{{ paymentInfo.error }}</div>
                    </div>

                    <div v-else-if="paymentInfo" class="q-gutter-sm">
                      <div
                        v-if="paymentInfo.daysLeft !== null && paymentInfo.daysLeft !== undefined"
                      >
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{
                              $t('clients.payment.daysLeft')
                            }}</q-item-label>
                            <q-item-label>
                              <q-chip
                                :color="getDaysLeftColor(paymentInfo.daysLeft)"
                                text-color="white"
                                size="sm"
                              >
                                {{ paymentInfo.daysLeft }}
                                {{ $t('common.days') }}
                              </q-chip>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div>
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('clients.status') }}</q-item-label>
                            <q-item-label>
                              <q-chip
                                :color="getPaymentStatusColor(paymentInfo.status)"
                                text-color="white"
                                size="sm"
                                :icon="getPaymentStatusIcon(paymentInfo.status)"
                              >
                                {{ $t(`clients.payment.status.${paymentInfo.status}`) }}
                              </q-chip>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>

                      <div v-if="paymentInfo.wialonUsername">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>Wialon Username</q-item-label>
                            <q-item-label>{{ paymentInfo.wialonUsername }}</q-item-label>
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
            <div class="row q-mb-md">
              <div class="text-h6 col">{{ $t('clients.tabs.invoices') }}</div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  icon="add"
                  :label="$t('invoices.create')"
                  @click="openCreateInvoiceDialog"
                  class="q-mr-sm"
                />
                <q-btn
                  color="accent"
                  icon="auto_awesome"
                  :label="$t('invoices.smartGenerate')"
                  @click="openGenerateSmartInvoiceDialog"
                />
              </div>
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
                  <q-btn-group flat>
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
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="description"
                      @click="generateInvoicePdf(props.row)"
                    >
                      <q-tooltip>{{ $t('invoices.generatePdf') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.status === 'issued'"
                      flat
                      round
                      dense
                      color="positive"
                      icon="payment"
                      @click="markAsPaid(props.row)"
                    >
                      <q-tooltip>{{ $t('invoices.markAsPaid') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.status === 'issued'"
                      flat
                      round
                      dense
                      color="negative"
                      icon="cancel"
                      @click="markAsCancelled(props.row)"
                    >
                      <q-tooltip>{{ $t('invoices.markAsCancelled') }}</q-tooltip>
                    </q-btn>
                  </q-btn-group>
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

    <!-- Діалог оплати рахунку -->
    <q-dialog v-model="paymentDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('invoices.markAsPaid') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePayment" class="q-gutter-md">
            <!-- Дата оплати -->
            <q-input
              v-model="paymentForm.payment_date"
              :label="$t('invoices.paymentDate')"
              outlined
              :rules="[(val) => !!val || t('common.validation.required')]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="paymentForm.payment_date" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <!-- Сума платежу -->
            <q-input
              v-model.number="paymentForm.amount"
              :label="$t('invoices.paymentAmount')"
              type="number"
              outlined
              :rules="[(val) => val > 0 || t('common.validation.minValue', { min: 0.01 })]"
              prefix="₴"
            />

            <!-- Тип платежу -->
            <q-select
              v-model="paymentForm.payment_type"
              :options="paymentTypeOptions"
              :label="$t('invoices.paymentType')"
              outlined
              map-options
              emit-value
            />

            <!-- Примітки -->
            <q-input
              v-model="paymentForm.notes"
              :label="$t('invoices.notes')"
              type="textarea"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn :label="$t('common.save')" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог скасування рахунку -->
    <q-dialog v-model="cancelDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('invoices.markAsCancelled') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="cancelInvoice" class="q-gutter-md">
            <!-- Примітки -->
            <q-input
              v-model="paymentForm.notes"
              :label="$t('invoices.cancellationReason')"
              type="textarea"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn :label="$t('common.save')" color="negative" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Діалог розумної генерації рахунків -->
    <invoice-generator-dialog
      v-model="showGenerateSmartInvoiceDialog"
      :client-id="client ? client.id : null"
      :smart-only="true"
      @generated="onSmartInvoicesGenerated"
    />
    <invoice-dialog
      v-model="showInvoiceDialog"
      :client-id="client ? client.id : null"
      @saved="loadClientInvoices"
    />
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
import InvoiceDialog from 'components/invoices/InvoiceDialog.vue'
import InvoiceGeneratorDialog from 'components/invoices/InvoiceGeneratorDialog.vue'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const clientServices = ref([])
const loadingServices = ref(false)
const paymentInfo = ref(null)
const loadingPayment = ref(false)

// Додайте новий стан
const showGenerateSmartInvoiceDialog = ref(false)

// Додайте метод для відкриття діалогу генерації інтелектуальних рахунків
const openGenerateSmartInvoiceDialog = () => {
  showGenerateSmartInvoiceDialog.value = true
}

// Метод для обробки згенерованих рахунків
const onSmartInvoicesGenerated = () => {
  loadClientInvoices() // Перезавантажуємо список рахунків
  $q.notify({
    color: 'positive',
    message: t('invoices.smartGenerationSuccess'),
    icon: 'check',
  })
}

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
const clientInvoices = ref({ invoices: [], total: 0 })
const loadingInvoices = ref(false)
const showInvoiceDialog = ref(false)

const loadClientInvoices = async () => {
  if (!client.value) return

  loadingInvoices.value = true
  try {
    const response = await InvoicesApi.getClientInvoices(client.value.id, { perPage: 'All' })
    clientInvoices.value = {
      items: response.data.invoices,
      total: response.data.total,
    }
  } catch (error) {
    console.error('Error loading client invoices:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    clientInvoices.value = { invoices: [], total: 0 }
  } finally {
    loadingInvoices.value = false
  }
}
const loadClientPaymentInfo = async () => {
  if (!client.value) return

  loadingPayment.value = true
  try {
    const response = await ClientsApi.getClientPaymentStatus(client.value.id)
    paymentInfo.value = response.data.paymentInfo
  } catch (error) {
    console.error('Error loading client payment info:', error)
    paymentInfo.value = {
      isConfigured: false,
      error: error.response?.data?.message || 'Помилка завантаження платіжної інформації',
    }
  } finally {
    loadingPayment.value = false
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

const paymentTypeOptions = [
  { label: t('invoices.paymentTypes.regular'), value: 'regular' },
  { label: t('invoices.paymentTypes.advance'), value: 'advance' },
  { label: t('invoices.paymentTypes.debt'), value: 'debt' },
  { label: t('invoices.paymentTypes.adjustment'), value: 'adjustment' },
]

// Функція для форматування дати
const formatDate = (dateString, format = 'DD.MM.YYYY') => {
  if (!dateString) return '-'
  const dateObj = new Date(dateString)

  // Проста функція форматування, можна замінити на бібліотеку
  if (format === 'DD.MM.YYYY') {
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const year = dateObj.getFullYear()
    return `${day}.${month}.${year}`
  } else if (format === 'YYYY-MM-DD') {
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const year = dateObj.getFullYear()
    return `${year}-${month}-${day}`
  }

  return dateString
}

// Метод для генерації PDF
const generateInvoicePdf = async (invoice) => {
  try {
    const response = await InvoicesApi.generateInvoicePdf(invoice.id)

    // Створюємо URL для скачування PDF
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    // Створюємо тимчасове посилання для скачування
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `invoice-${invoice.invoice_number}.pdf`)
    document.body.appendChild(link)
    link.click()

    // Очищаємо після скачування
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    $q.notify({
      color: 'positive',
      message: 'PDF успішно згенеровано',
      icon: 'check',
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    $q.notify({
      color: 'negative',
      message: 'Помилка при генерації PDF',
      icon: 'error',
    })
  }
}

// Діалоги для зміни статусу
const paymentDialog = ref(false)
const cancelDialog = ref(false)
const currentInvoice = ref(null)
const paymentForm = ref({
  payment_date: '',
  amount: 0,
  payment_type: 'regular',
  notes: '',
})

// Метод для відкриття діалогу оплати
const markAsPaid = (invoice) => {
  currentInvoice.value = invoice
  paymentForm.value = {
    payment_date: formatDate(new Date(), 'YYYY-MM-DD'),
    amount: invoice.total_amount,
    payment_type: 'regular',
    notes: '',
  }
  paymentDialog.value = true
}

// Метод для відкриття діалогу скасування
const markAsCancelled = (invoice) => {
  currentInvoice.value = invoice
  cancelDialog.value = true
}

// Метод для збереження оплати
const savePayment = async () => {
  try {
    await InvoicesApi.updateInvoiceStatus(currentInvoice.value.id, {
      status: 'paid',
      payment_date: paymentForm.value.payment_date,
      amount: paymentForm.value.amount,
      payment_type: paymentForm.value.payment_type,
      notes: paymentForm.value.notes,
    })

    $q.notify({
      color: 'positive',
      message: t('invoices.paymentSuccess'),
      icon: 'check',
    })

    paymentDialog.value = false
    loadClientInvoices() // Перезавантажуємо рахунки
  } catch (error) {
    console.error('Error updating invoice status:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  }
}

// Метод для скасування рахунку
const cancelInvoice = async () => {
  try {
    await InvoicesApi.updateInvoiceStatus(currentInvoice.value.id, {
      status: 'cancelled',
      notes: paymentForm.value.notes,
    })

    $q.notify({
      color: 'positive',
      message: t('invoices.cancelSuccess'),
      icon: 'check',
    })

    cancelDialog.value = false
    loadClientInvoices() // Перезавантажуємо рахунки
  } catch (error) {
    console.error('Error cancelling invoice:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  }
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
    await Promise.all([loadClientServices(), loadClientInvoices(), loadClientPaymentInfo()])
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

// Допоміжні методи для платіжної інформації
const getPaymentStatusColor = (status) => {
  const colors = {
    active: 'positive',
    expiring_soon: 'warning',
    expired: 'negative',
    blocked: 'negative',
    unknown: 'grey',
  }
  return colors[status] || 'grey'
}

const getPaymentStatusIcon = (status) => {
  const icons = {
    active: 'check_circle',
    expiring_soon: 'warning',
    expired: 'error',
    blocked: 'block',
    unknown: 'help',
  }
  return icons[status] || 'help'
}

const getDaysLeftColor = (daysLeft) => {
  if (daysLeft > 7) return 'positive'
  if (daysLeft > 3) return 'warning'
  if (daysLeft > 0) return 'orange'
  return 'negative'
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
