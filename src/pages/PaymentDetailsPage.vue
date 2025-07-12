<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!payment" class="row justify-center q-pa-md">
      <q-banner class="bg-negative text-white">
        {{ $t('payments.notFound') }}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('common.back')" @click="goBack" />
        </template>
      </q-banner>
    </div>

    <template v-else>
      <!-- Заголовок сторінки з кнопками дій -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="text-h6 q-ml-sm">{{ $t('payments.details') }}</div>
        <q-space />
        <q-btn
          color="info"
          icon="email"
          :label="$t('common.sendEmail')"
          @click="sendEmailToClient"
          class="q-mr-sm"
        />
        <q-btn color="warning" icon="edit" :label="$t('common.edit')" @click="openEditDialog" />
        <q-btn
          color="negative"
          icon="delete"
          :label="$t('common.delete')"
          @click="confirmDelete"
          class="q-ml-sm"
        />
      </div>

      <!-- Основний контент з інформацією про платіж -->
      <div class="row q-col-gutter-md">
        <!-- Загальна інформація про платіж -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1">{{ $t('payments.info') }}</div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <!-- Клієнт -->
                <div class="col-12 col-sm-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.client') }}</q-item-label>
                      <q-item-label>{{ payment.client_name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <!-- Сума платежу -->
                <div class="col-12 col-sm-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.amount') }}</q-item-label>
                      <q-item-label class="text-h6 text-primary">{{
                        formatCurrency(payment.amount)
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <!-- Дата платежу -->
                <div class="col-12 col-sm-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.date') }}</q-item-label>
                      <q-item-label>{{ formatDate(payment.payment_date) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <!-- Тип платежу -->
                <div class="col-12 col-sm-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.type') }}</q-item-label>
                      <q-item-label>
                        <q-chip
                          :color="getPaymentTypeColor(payment.payment_type)"
                          text-color="white"
                          dense
                        >
                          {{ $t(`payments.types.${payment.payment_type}`) }}
                        </q-chip>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <!-- Період -->
                <div class="col-12 col-sm-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.period') }}</q-item-label>
                      <q-item-label>
                        {{ $t(`payments.months.${payment.payment_month}`) }}
                        {{ payment.payment_year }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <!-- Користувач, який створив платіж -->
                <div class="col-12 col-sm-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.createdBy') }}</q-item-label>
                      <q-item-label>{{
                        payment.created_by_name || payment.created_by_email || '-'
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <!-- Дата створення -->
                <div class="col-12">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.createdAt') }}</q-item-label>
                      <q-item-label>{{ formatDate(payment.created_at) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <!-- Примітки -->
                <div class="col-12">
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ $t('payments.notes') }}</q-item-label>
                      <q-item-label>{{ payment.notes || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Пов'язані рахунки -->
        <div class="col-12 col-md-6">
          <q-card flat bordered v-if="payment.invoices && payment.invoices.length > 0">
            <q-card-section>
              <div class="text-subtitle1">{{ $t('payments.relatedInvoices') }}</div>
            </q-card-section>
            <q-card-section>
              <q-list bordered separator>
                <q-item
                  v-for="invoice in payment.invoices"
                  :key="invoice.id"
                  clickable
                  @click="openInvoiceDetails(invoice)"
                >
                  <q-item-section>
                    <q-item-label>{{ invoice.invoice_number }}</q-item-label>
                    <q-item-label caption>
                      {{ $t(`invoices.months.${invoice.billing_month}`) }}
                      {{ invoice.billing_year }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatCurrency(invoice.total_amount) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side style="width: 100px">
                    <q-chip :color="getInvoiceStatusColor(invoice.status)" text-color="white" dense>
                      {{ $t(`invoices.statuses.${invoice.status}`) }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Платежі за об'єктами -->
          <q-card
            flat
            bordered
            class="q-mt-md"
            v-if="payment.object_payments && payment.object_payments.length > 0"
          >
            <q-card-section>
              <div class="text-subtitle1">{{ $t('payments.objectPayments') }}</div>
            </q-card-section>
            <q-card-section>
              <q-list bordered separator>
                <q-item
                  v-for="objPayment in payment.object_payments"
                  :key="objPayment.id"
                  clickable
                  @click="openObjectDetails(objPayment)"
                >
                  <q-item-section>
                    <q-item-label>{{ objPayment.object_name }}</q-item-label>
                    <q-item-label caption>
                      {{ objPayment.tariff_name }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatCurrency(objPayment.amount) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip
                      :color="getPaymentStatusColor(objPayment.status)"
                      text-color="white"
                      dense
                    >
                      {{ $t(`payments.statuses.${objPayment.status}`) }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Діалог редагування платежу -->
    <payment-dialog v-model="showDialog" :edit-data="payment" @saved="loadPayment" />

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
            :loading="deleting"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { PaymentsApi } from 'src/api/payments'
import PaymentDialog from 'components/payments/PaymentDialog.vue'
import { EmailTemplatesApi } from 'src/api/email-templates'
import { useCurrency } from 'src/composables/useCurrency'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// State
const payment = ref(null)
const loading = ref(true)
const deleting = ref(false)
const showDialog = ref(false)
const deleteDialog = ref(false)
const { formatCurrency: formatCurrencyFromComposable } = useCurrency()

// Methods
const loadPayment = async () => {
  loading.value = true
  try {
    const paymentId = route.params.id
    const response = await PaymentsApi.getPayment(paymentId)
    payment.value = response.data.payment
  } catch (error) {
    console.error('Error loading payment:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    payment.value = null
  } finally {
    loading.value = false
  }
}

const sendEmailToClient = async () => {
  try {
    const templatesResponse = await EmailTemplatesApi.getTemplates()
    const paymentTemplates = templatesResponse.data.templates
      .filter((template) => template.module_type === 'payment' && template.is_active)
      .map((template) => ({
        label: template.name,
        value: template.code,
      }))

    if (paymentTemplates.length === 0) {
      $q.notify({
        color: 'warning',
        message: t('payments.noActiveTemplates'),
        icon: 'warning',
      })
      return
    }

    $q.dialog({
      title: t('payments.sendEmail'),
      message: t('payments.selectTemplateForPayment', {
        amount: formatCurrency(payment.value.amount),
      }),
      options: {
        type: 'radio',
        model: paymentTemplates[0].value,
        items: paymentTemplates,
      },
      cancel: true,
      persistent: true,
    }).onOk(async (templateCode) => {
      try {
        const response = await PaymentsApi.sendPaymentEmail(payment.value.id, templateCode)

        $q.notify({
          color: 'positive',
          message: t('payments.emailSent'),
          caption: response.data.recipient ? `Відправлено на: ${response.data.recipient}` : '',
          icon: 'email',
        })
      } catch (error) {
        console.error('Error sending payment email:', error)
        $q.notify({
          color: 'negative',
          message: error.response?.data?.message || t('common.errors.emailSending'),
          icon: 'error',
        })
      }
    })
  } catch (error) {
    console.error('Error loading email templates:', error)
    $q.notify({
      color: 'negative',
      message: t('payments.errorLoadingTemplates'),
      icon: 'error',
    })
  }
}

const goBack = () => {
  router.push({ name: 'payments' })
}

const openEditDialog = () => {
  showDialog.value = true
}

const confirmDelete = () => {
  deleteDialog.value = true
}

const deletePayment = async () => {
  deleting.value = true
  try {
    await PaymentsApi.deletePayment(payment.value.id)

    $q.notify({
      color: 'positive',
      message: t('payments.deleteSuccess'),
      icon: 'check',
    })

    router.push({ name: 'payments' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
      icon: 'error',
    })
  } finally {
    deleting.value = false
  }
}

const openInvoiceDetails = (invoice) => {
  router.push({ name: 'invoice-details', params: { id: invoice.id } })
}

const openObjectDetails = (objPayment) => {
  router.push({ name: 'wialon-object-details', params: { id: objPayment.object_id } })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA')
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return formatCurrencyFromComposable(amount)
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

const getInvoiceStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    issued: 'info',
    paid: 'positive',
    cancelled: 'negative',
  }
  return colors[status] || 'grey'
}

const getPaymentStatusColor = (status) => {
  const colors = {
    paid: 'positive',
    partial: 'warning',
    pending: 'info',
    overdue: 'negative',
  }
  return colors[status] || 'grey'
}

// Життєвий цикл
onMounted(() => {
  loadPayment()
})
</script>
