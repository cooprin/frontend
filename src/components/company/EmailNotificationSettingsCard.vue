<template>
  <div>
    <div class="text-h6 q-mb-md">{{ $t('company.emailNotifications.title') }}</div>
    <p class="text-grey-7 q-mb-lg">{{ $t('company.emailNotifications.desc') }}</p>

    <q-form @submit="saveSettings" class="q-gutter-md">
      <!-- Автоматичні сповіщення -->
      <div class="text-subtitle1 q-mb-md">
        {{ $t('company.emailNotifications.automaticNotifications') }}
      </div>

      <div class="q-gutter-md">
        <!-- Новий рахунок створено -->
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center">
            <div class="col">
              <div class="text-weight-medium">
                {{ $t('company.emailNotifications.newInvoiceCreated') }}
              </div>
              <div class="text-caption text-grey-7">
                {{ $t('company.emailNotifications.newInvoiceDescription') }}
              </div>
            </div>
            <div class="col-auto">
              <q-toggle v-model="notifications.new_invoice_created.enabled" color="primary" />
            </div>
          </div>

          <div v-if="notifications.new_invoice_created.enabled" class="q-mt-md">
            <q-select
              v-model="notifications.new_invoice_created.template_id"
              :options="templateOptions"
              :label="$t('company.emailNotifications.selectTemplate')"
              outlined
              dense
              emit-value
              map-options
              clearable
            />

            <div class="q-mt-sm">
              <q-toggle
                v-model="notifications.new_invoice_created.send_automatically"
                :label="$t('company.emailNotifications.sendAutomatically')"
                color="primary"
              />
              <div class="text-caption text-grey-7">
                {{ $t('company.emailNotifications.sendAutomaticallyDescription') }}
              </div>
            </div>
          </div>
        </q-card>

        <!-- Статус рахунку змінено -->
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center">
            <div class="col">
              <div class="text-weight-medium">
                {{ $t('company.emailNotifications.invoiceStatusChanged') }}
              </div>
              <div class="text-caption text-grey-7">
                {{ $t('company.emailNotifications.invoiceStatusDescription') }}
              </div>
            </div>
            <div class="col-auto">
              <q-toggle v-model="notifications.invoice_status_changed.enabled" color="primary" />
            </div>
          </div>

          <div v-if="notifications.invoice_status_changed.enabled" class="q-mt-md">
            <!-- Для кожного статусу окремий шаблон -->
            <div class="q-gutter-sm">
              <div class="text-caption">
                {{ $t('company.emailNotifications.statusTemplates') }}:
              </div>

              <div class="row q-gutter-sm">
                <div class="col">
                  <q-select
                    v-model="notifications.invoice_status_changed.paid_template_id"
                    :options="templateOptions"
                    :label="$t('invoices.statuses.paid')"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                  />
                </div>
                <div class="col">
                  <q-select
                    v-model="notifications.invoice_status_changed.cancelled_template_id"
                    :options="templateOptions"
                    :label="$t('invoices.statuses.cancelled')"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card>

        <!-- Нагадування про оплату -->
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center">
            <div class="col">
              <div class="text-weight-medium">
                {{ $t('company.emailNotifications.paymentReminder') }}
              </div>
              <div class="text-caption text-grey-7">
                {{ $t('company.emailNotifications.paymentReminderDescription') }}
              </div>
            </div>
            <div class="col-auto">
              <q-toggle v-model="notifications.payment_reminder.enabled" color="primary" />
            </div>
          </div>

          <div v-if="notifications.payment_reminder.enabled" class="q-mt-md">
            <div class="row q-gutter-sm">
              <div class="col">
                <q-select
                  v-model="notifications.payment_reminder.template_id"
                  :options="templateOptions"
                  :label="$t('company.emailNotifications.selectTemplate')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="notifications.payment_reminder.days_before"
                  :label="$t('company.emailNotifications.daysBefore')"
                  type="number"
                  outlined
                  dense
                  min="1"
                  max="30"
                />
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Кнопки -->
      <div class="row justify-end q-gutter-sm q-mt-lg">
        <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { EmailTemplatesApi } from 'src/api/email-templates'
import { CompanyApi } from 'src/api/company'

const $q = useQuasar()
const { t } = useI18n()

// State
const saving = ref(false)
const templates = ref([])

const notifications = ref({
  new_invoice_created: {
    enabled: false,
    template_id: null,
    send_automatically: false,
  },
  invoice_status_changed: {
    enabled: false,
    paid_template_id: null,
    cancelled_template_id: null,
  },
  payment_reminder: {
    enabled: false,
    template_id: null,
    days_before: 3,
  },
})

// Computed
const templateOptions = computed(() => {
  return templates.value
    .filter((t) => t.is_active)
    .map((t) => ({
      label: t.name,
      value: t.id,
    }))
})

// Methods
const loadTemplates = async () => {
  try {
    const response = await EmailTemplatesApi.getTemplates()
    templates.value = response.data.templates
  } catch (error) {
    console.error('Error loading templates:', error)
  }
}

const loadNotificationSettings = async () => {
  try {
    const response = await CompanyApi.getNotificationSettings()
    if (response.data.settings) {
      notifications.value = { ...notifications.value, ...response.data.settings }
    }
  } catch (error) {
    console.error('Error loading notification settings:', error)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await CompanyApi.updateNotificationSettings(notifications.value)
    $q.notify({
      color: 'positive',
      message: t('company.emailNotifications.saveSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error saving notification settings:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadTemplates()
  loadNotificationSettings()
})
</script>
