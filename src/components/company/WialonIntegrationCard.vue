<template>
  <div>
    <div class="text-h6 q-mb-md">{{ $t('company.wialonIntegration.title') }}</div>
    <p class="text-grey-7 q-mb-lg">{{ $t('company.wialonIntegration.description') }}</p>

    <!-- Статус підключення -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <q-icon :name="statusIcon" :color="statusColor" size="md" class="q-mr-sm" />
          <span class="text-subtitle1">{{ $t('company.wialonIntegration.status') }}: </span>
          <q-chip :color="statusColor" text-color="white" class="q-ml-sm">
            {{ statusText }}
          </q-chip>
        </div>

        <div v-if="integrationData?.last_sync_time" class="text-caption text-grey-7">
          {{ $t('company.wialonIntegration.lastSyncTime') }}:
          {{ formatDateTime(integrationData.last_sync_time) }}
        </div>
        <div v-else class="text-caption text-grey-7">
          {{ $t('company.wialonIntegration.neverSynced') }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Форма налаштувань -->
    <q-card flat bordered>
      <q-card-section>
        <q-form @submit="saveIntegration" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- API URL -->
            <div class="col-12">
              <q-input
                v-model="form.api_url"
                :label="$t('company.wialonIntegration.apiUrl')"
                :hint="$t('company.wialonIntegration.apiUrlHint')"
                :rules="[(val) => !!val || $t('company.wialonIntegration.apiUrlRequired')]"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="link" />
                </template>
              </q-input>
            </div>

            <!-- Token Name та Token Value -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.token_name"
                :label="$t('company.wialonIntegration.tokenName')"
                :hint="$t('company.wialonIntegration.tokenNameHint')"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="label" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.token_value"
                :label="$t('company.wialonIntegration.tokenValue')"
                :hint="
                  integrationData?.has_token
                    ? $t('company.wialonIntegration.tokenSavedHint')
                    : $t('company.wialonIntegration.tokenValueHint')
                "
                :rules="[
                  (val) =>
                    !!val ||
                    integrationData?.has_token ||
                    $t('company.wialonIntegration.tokenRequired'),
                ]"
                :type="showToken ? 'text' : 'password'"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="showToken ? 'visibility_off' : 'visibility'"
                    @click="showToken = !showToken"
                  />
                </template>
              </q-input>
            </div>

            <!-- Sync Interval -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.sync_interval"
                :label="$t('company.wialonIntegration.syncInterval')"
                :hint="$t('company.wialonIntegration.syncIntervalHint')"
                type="number"
                outlined
                dense
                min="5"
                max="1440"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" />
                </template>
              </q-input>
            </div>

            <!-- Is Active -->
            <div class="col-12 col-md-6 flex items-center">
              <q-toggle
                v-model="form.is_active"
                :label="$t('company.wialonIntegration.isActive')"
                color="primary"
                size="lg"
              />
            </div>

            <!-- Additional Settings -->
            <div class="col-12">
              <q-expansion-item
                icon="settings"
                :label="$t('company.wialonIntegration.additionalSettings')"
                class="q-mt-md"
              >
                <q-card>
                  <q-card-section>
                    <q-input
                      v-model="form.additional_settings.description"
                      label="Опис інтеграції"
                      type="textarea"
                      outlined
                      dense
                      autogrow
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>

          <!-- Кнопки дій -->
          <div class="row q-gutter-sm justify-end q-mt-lg">
            <!-- Тестування підключення -->
            <q-btn
              :label="$t('company.wialonIntegration.testConnection')"
              color="secondary"
              icon="wifi_protected_setup"
              :loading="testing"
              :disable="!form.api_url || (!form.token_value && !integrationData?.has_token)"
              @click="testConnection"
            />

            <!-- Синхронізація об'єктів - ОНОВЛЕНО -->
            <q-btn
              :label="
                isSyncing
                  ? `Синхронізація (${syncDuration})`
                  : $t('company.wialonIntegration.syncObjects')
              "
              color="primary"
              icon="sync"
              :loading="isSyncing"
              :disable="isSyncing || !integrationData?.id || !connectionStatus"
              @click="syncObjects"
            />

            <!-- Збереження -->
            <q-btn
              :label="$t('company.wialonIntegration.saveSettings')"
              color="positive"
              icon="save"
              type="submit"
              :loading="saving"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Довідка -->
    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="help_outline" class="q-mr-sm" />
          {{ $t('company.wialonIntegration.integrationHelp') }}
        </div>
        <p class="text-caption text-grey-7 q-mb-sm">
          {{ $t('company.wialonIntegration.integrationHelpText') }}
        </p>
        <div class="text-caption text-orange-8">
          <q-icon name="security" class="q-mr-xs" />
          {{ $t('company.wialonIntegration.securityNote') }}:
          {{ $t('company.wialonIntegration.securityNoteText') }}
        </div>
      </q-card-section>
    </q-card>

    <!-- НОВИЙ БЛОК: Останні результати синхронізації -->
    <q-card flat bordered class="q-mt-md" v-if="lastSyncResults">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="sync" class="q-mr-sm" />
          Результати останньої синхронізації
        </div>

        <div class="row q-gutter-md">
          <div class="col">
            <q-chip color="blue" text-color="white" icon="download">
              Клієнтів завантажено: {{ lastSyncResults.clientsLoaded || 0 }}
            </q-chip>
          </div>
          <div class="col">
            <q-chip color="blue" text-color="white" icon="download">
              Об'єктів завантажено: {{ lastSyncResults.objectsLoaded || 0 }}
            </q-chip>
          </div>
          <div class="col">
            <q-chip color="orange" text-color="white" icon="warning">
              Розбіжностей знайдено: {{ lastSyncResults.discrepanciesFound || 0 }}
            </q-chip>
          </div>
        </div>

        <div v-if="lastSyncResults.discrepanciesFound > 0" class="q-mt-md">
          <q-btn
            label="Переглянути розбіжності"
            color="orange"
            icon="list_alt"
            @click="goToDiscrepancies"
            outline
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { CompanyApi } from 'src/api/company'
import { useWialonSync } from 'src/composables/useWialonSync'

const $q = useQuasar()
const { t } = useI18n()
const router = useRouter()

// State
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const { isSyncing, syncDuration, startSync: globalStartSync } = useWialonSync()
const showToken = ref(false)
const connectionStatus = ref(false)
const integrationData = ref(null)
const lastSyncResults = ref(null)

// Form
const form = ref({
  api_url: '',
  token_name: '',
  token_value: '',
  sync_interval: 60,
  is_active: true,
  additional_settings: {
    description: '',
  },
})

// Computed
const statusIcon = computed(() => {
  if (testing.value) return 'sync'
  if (connectionStatus.value) return 'check_circle'
  if (integrationData.value?.id && !connectionStatus.value) return 'error'
  return 'radio_button_unchecked'
})

const statusColor = computed(() => {
  if (testing.value) return 'blue'
  if (connectionStatus.value) return 'positive'
  if (integrationData.value?.id && !connectionStatus.value) return 'negative'
  return 'grey'
})

const statusText = computed(() => {
  if (testing.value) return t('company.wialonIntegration.statusTesting')
  if (connectionStatus.value) return t('company.wialonIntegration.statusConnected')
  if (integrationData.value?.id && !connectionStatus.value)
    return t('company.wialonIntegration.statusError')
  return t('company.wialonIntegration.statusDisconnected')
})

// Methods
const loadIntegrationSettings = async () => {
  loading.value = true
  try {
    const response = await CompanyApi.getWialonIntegration()
    if (response.data.settings) {
      integrationData.value = response.data.settings

      // Заповнюємо форму
      form.value = {
        api_url: response.data.settings.api_url || '',
        token_name: response.data.settings.token_name || '',
        token_value: '', // Не показуємо існуючий токен з міркувань безпеки
        sync_interval: response.data.settings.sync_interval || 60,
        is_active: response.data.settings.is_active !== false,
        additional_settings: response.data.settings.additional_settings || { description: '' },
      }

      // Якщо є налаштування і активні - тестуємо підключення
      if (response.data.settings.has_token && response.data.settings.is_active) {
        await testConnection(true) // silent test
      }
    }
  } catch (error) {
    console.error('Error loading Wialon integration settings:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const saveIntegration = async () => {
  saving.value = true
  try {
    const saveData = { ...form.value }

    // Якщо токен порожній і є існуючі налаштування - не відправляємо токен
    if (!saveData.token_value && integrationData.value?.has_token) {
      delete saveData.token_value
    }

    await CompanyApi.saveWialonIntegration(saveData)

    $q.notify({
      color: 'positive',
      message: t('company.wialonIntegration.saveSuccess'),
      icon: 'check',
    })

    // Перезавантажуємо налаштування
    await loadIntegrationSettings()
  } catch (error) {
    console.error('Error saving Wialon integration settings:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('company.wialonIntegration.saveError'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const testConnection = async (silent = false) => {
  console.log('Silent parameter:', silent, typeof silent)
  if (!silent) testing.value = true

  try {
    const response = await CompanyApi.testWialonConnection()

    if (response.data && response.data.success) {
      connectionStatus.value = true
      // ЗАВЖДИ показувати notification при success, навіть якщо статус не змінився
      if (!silent) {
        console.log('Silent mode - no notification')
        $q.notify({
          color: 'positive',
          message: response.data.message || t('company.wialonIntegration.connectionSuccess'),
          caption: t('company.wialonIntegration.connectionSuccessDetails'),
          icon: 'wifi',
        })
      }
    } else {
      console.log('Silent mode - no notification')
      connectionStatus.value = false
      if (!silent) {
        $q.notify({
          color: 'negative',
          message: response.data?.message || t('company.wialonIntegration.connectionError'),
          caption: t('company.wialonIntegration.connectionErrorDetails'),
          icon: 'wifi_off',
        })
      }
    }
  } catch (error) {
    connectionStatus.value = false
    console.error('Error testing Wialon connection:', error)

    if (!silent) {
      $q.notify({
        color: 'negative',
        message: t('company.wialonIntegration.connectionError'),
        caption:
          error.response?.data?.message || t('company.wialonIntegration.connectionErrorDetails'),
        icon: 'wifi_off',
      })
    }
  } finally {
    if (!silent) testing.value = false
  }
}

const syncObjects = async () => {
  try {
    const response = await globalStartSync()

    if (response.data.success) {
      // Зберігаємо результати синхронізації
      lastSyncResults.value = {
        clientsLoaded: response.data.stats?.clientsLoaded || 0,
        objectsLoaded: response.data.stats?.objectsLoaded || 0,
        discrepanciesFound: response.data.stats?.discrepanciesFound || 0,
        sessionId: response.data.session?.id,
      }

      const details = t('company.wialonIntegration.syncSuccessDetails', {
        clientsLoaded: lastSyncResults.value.clientsLoaded,
        objectsLoaded: lastSyncResults.value.objectsLoaded,
        discrepanciesFound: lastSyncResults.value.discrepanciesFound,
      })

      $q.notify({
        color: 'positive',
        message: t('company.wialonIntegration.syncSuccess'),
        caption: details,
        icon: 'sync',
        timeout: 5000,
      })

      // Якщо є розбіжності - показуємо додаткове повідомлення
      if (lastSyncResults.value.discrepanciesFound > 0) {
        $q.notify({
          color: 'orange',
          message: `Знайдено ${lastSyncResults.value.discrepanciesFound} розбіжностей`,
          caption: 'Перегляньте та схваліть зміни для синхронізації',
          icon: 'warning',
          timeout: 7000,
          actions: [
            {
              label: 'Переглянути',
              color: 'white',
              handler: () => goToDiscrepancies(),
            },
          ],
        })
      }

      // Оновлюємо дані про останню синхронізацію
      await loadIntegrationSettings()
    }
  } catch (error) {
    console.error('Error syncing Wialon objects:', error)
    $q.notify({
      color: 'negative',
      message: t('company.wialonIntegration.syncError'),
      caption: error.response?.data?.message,
      icon: 'sync_problem',
    })
  }
}

// НОВИЙ МЕТОД: перехід до розбіжностей
const goToDiscrepancies = () => {
  // Тут потрібно буде створити роут для розбіжностей
  router.push({
    name: 'wialon-sync-discrepancies',
    query: lastSyncResults.value?.sessionId ? { sessionId: lastSyncResults.value.sessionId } : {},
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadIntegrationSettings()
})
</script>

<style scoped>
.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
