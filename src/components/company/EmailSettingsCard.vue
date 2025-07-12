<template>
  <div>
    <div class="text-h6 q-mb-md">{{ $t('company.emailSettings.title') }}</div>
    <p class="text-grey-7 q-mb-lg">{{ $t('company.emailSettings.description') }}</p>

    <!-- Статус підключення -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <q-icon :name="statusIcon" :color="statusColor" size="md" class="q-mr-sm" />
          <span class="text-subtitle1">{{ $t('company.emailSettings.connectionStatus') }}: </span>
          <q-chip :color="statusColor" text-color="white" class="q-ml-sm">
            {{ statusText }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Форма налаштувань -->
    <q-card flat bordered>
      <q-card-section>
        <q-form @submit="saveSettings" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Email Address -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email_address"
                :label="$t('company.emailSettings.emailAddress')"
                :rules="[(val) => !!val || $t('common.validation.required')]"
                outlined
                dense
                type="email"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>

            <!-- Display Name -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.display_name"
                :label="$t('company.emailSettings.displayName')"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>

            <!-- SMTP Server -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.smtp_server"
                :label="$t('company.emailSettings.smtpServer')"
                :rules="[(val) => !!val || $t('common.validation.required')]"
                outlined
                dense
                placeholder="smtp.gmail.com"
              >
                <template v-slot:prepend>
                  <q-icon name="dns" />
                </template>
              </q-input>
            </div>

            <!-- SMTP Port -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.smtp_port"
                :label="$t('company.emailSettings.smtpPort')"
                :rules="[(val) => !!val || $t('common.validation.required')]"
                type="number"
                outlined
                dense
                placeholder="587"
              >
                <template v-slot:prepend>
                  <q-icon name="settings_ethernet" />
                </template>
              </q-input>
            </div>

            <!-- SMTP Username -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.smtp_username"
                :label="$t('company.emailSettings.smtpUsername')"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="account_circle" />
                </template>
              </q-input>
            </div>

            <!-- SMTP Password -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.smtp_password"
                :label="$t('company.emailSettings.smtpPassword')"
                :placeholder="hasPassword ? $t('company.emailSettings.passwordPlaceholder') : ''"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="showPassword ? 'visibility_off' : 'visibility'"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>

            <!-- Use SSL -->
            <div class="col-12">
              <q-toggle
                v-model="form.use_ssl"
                :label="$t('company.emailSettings.useSsl')"
                color="primary"
                size="lg"
              />
            </div>
          </div>

          <!-- Gmail інструкції -->
          <q-card flat bordered class="q-mt-md bg-blue-1">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm text-blue-8">
                <q-icon name="info" class="q-mr-sm" />
                {{ $t('company.emailSettings.gmailSetup') }}
              </div>
              <p class="text-caption text-blue-7 q-mb-none">
                {{ $t('company.emailSettings.gmailInstructions') }}
              </p>
            </q-card-section>
          </q-card>

          <!-- Кнопки дій -->
          <div class="row q-gutter-sm justify-end q-mt-lg">
            <!-- Тестування підключення -->
            <q-btn
              :label="$t('company.emailSettings.testConnection')"
              color="secondary"
              icon="wifi_protected_setup"
              :loading="testing"
              :disable="!form.email_address || !form.smtp_server"
              @click="testConnection(false)"
            />

            <!-- Тестовий email -->
            <q-btn
              :label="$t('company.emailSettings.sendTestEmail')"
              color="orange"
              icon="send"
              :loading="sendingTest"
              :disable="!connectionStatus"
              @click="showTestEmailDialog = true"
            />

            <!-- Збереження -->
            <q-btn
              :label="$t('common.save')"
              color="positive"
              icon="save"
              type="submit"
              :loading="saving"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Діалог тестового email -->
    <q-dialog v-model="showTestEmailDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('company.emailSettings.sendTestEmail') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="testEmailAddress"
            :label="$t('company.emailSettings.testEmailAddress')"
            type="email"
            outlined
            dense
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            :label="$t('common.send')"
            color="primary"
            @click="sendTestEmail"
            :loading="sendingTest"
            :disable="!testEmailAddress"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { EmailApi } from 'src/api/email'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const sendingTest = ref(false)
const showPassword = ref(false)
const connectionStatus = ref(false)
const hasPassword = ref(false)
const showTestEmailDialog = ref(false)
const testEmailAddress = ref('')

// Form
const form = ref({
  email_address: '',
  display_name: '',
  smtp_server: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  use_ssl: true,
})

// Computed
const statusIcon = computed(() => {
  if (testing.value) return 'sync'
  if (connectionStatus.value) return 'check_circle'
  return 'radio_button_unchecked'
})

const statusColor = computed(() => {
  if (testing.value) return 'blue'
  if (connectionStatus.value) return 'positive'
  return 'grey'
})

const statusText = computed(() => {
  if (testing.value) return t('company.emailSettings.testing')
  if (connectionStatus.value) return t('company.emailSettings.connected')
  return t('company.emailSettings.notConnected')
})

// Methods
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await EmailApi.getEmailSettings()
    if (response.data.settings && response.data.settings.length > 0) {
      // Перетворюємо масив налаштувань в об'єкт
      const settings = response.data.settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {})

      form.value = {
        email_address: settings.email_address || '',
        display_name: settings.display_name || '',
        smtp_server: settings.smtp_server || 'smtp.gmail.com',
        smtp_port: parseInt(settings.smtp_port) || 587,
        smtp_username: settings.smtp_username || '',
        smtp_password: '',
        use_ssl: settings.use_ssl === 'true',
      }

      hasPassword.value = !!settings.smtp_password

      // Перевіряємо статус підключення якщо є налаштування
      if (settings.email_address && settings.smtp_server) {
        await testConnection(true)
      }
    }
  } catch (error) {
    console.error('Error loading email settings:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const testConnection = async (silent = false) => {
  if (!silent) testing.value = true

  try {
    const response = await EmailApi.testConnection()
    connectionStatus.value = response.data.success

    if (response.data.success) {
      // ЗАВЖДИ показувати notification при success, навіть якщо статус не змінився
      if (!silent) {
        $q.notify({
          color: 'positive',
          message: t('company.emailSettings.connectionSuccess'),
          caption: response.data.message,
          icon: 'wifi',
        })
      }
    } else {
      if (!silent) {
        $q.notify({
          color: 'negative',
          message: t('company.emailSettings.connectionError'),
          caption: response.data.message,
          icon: 'wifi_off',
        })
      }
    }
  } catch (error) {
    connectionStatus.value = false
    console.error('Error testing connection:', error)

    if (!silent) {
      $q.notify({
        color: 'negative',
        message: t('company.emailSettings.connectionError'),
        caption: error.response?.data?.message,
        icon: 'wifi_off',
      })
    }
  } finally {
    if (!silent) testing.value = false
  }
}

// Оновлений метод saveSettings з silent викликом testConnection
const saveSettings = async () => {
  saving.value = true
  try {
    await EmailApi.saveEmailSettings(form.value)
    $q.notify({
      color: 'positive',
      message: t('company.emailSettings.saveSuccess'),
      icon: 'check',
    })
    hasPassword.value = true

    // Після успішного збереження тестуємо підключення (silent)
    await testConnection(true)
  } catch (error) {
    console.error('Error saving email settings:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}
const sendTestEmail = async () => {
  sendingTest.value = true
  try {
    await EmailApi.sendTestEmail(testEmailAddress.value)
    $q.notify({
      color: 'positive',
      message: t('company.emailSettings.testEmailSent'),
      icon: 'send',
    })
    showTestEmailDialog.value = false
    testEmailAddress.value = ''
  } catch (error) {
    console.error('Error sending test email:', error)
    $q.notify({
      color: 'negative',
      message: t('company.emailSettings.testEmailError'),
      caption: error.response?.data?.message,
      icon: 'error',
    })
  } finally {
    sendingTest.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>
