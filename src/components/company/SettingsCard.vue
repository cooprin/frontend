<template>
  <div>
    <div class="text-h6 q-mb-md">{{ $t('company.currencySettings.title') }}</div>
    <p class="text-grey-7 q-mb-lg">{{ $t('company.currencySettings.description') }}</p>

    <!-- Поточна валюта -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <q-icon name="payments" color="primary" size="md" class="q-mr-sm" />
          <span class="text-subtitle1">{{ $t('company.currencySettings.currentCurrency') }}: </span>
          <q-chip color="primary" text-color="white" class="q-ml-sm">
            {{ currentCurrency.symbol }} {{ getCurrentCurrencyName() }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Форма налаштувань валюти -->
    <q-card flat bordered>
      <q-card-section>
        <q-form @submit="saveCurrencySettings" class="q-gutter-md">
          <!-- Вибір валюти -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.currency"
                :options="currencyOptions"
                :label="$t('company.currencySettings.selectCurrency')"
                emit-value
                map-options
                outlined
                dense
                :rules="[(val) => !!val || $t('common.validation.required')]"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <span class="text-h6">{{ scope.opt.symbol }}</span>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <span>{{ scope.opt.symbol }} {{ scope.opt.label }}</span>
                </template>
              </q-select>
            </div>

            <!-- Формат відображення -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.format"
                :options="formatOptions"
                :label="$t('company.currencySettings.displayFormat')"
                emit-value
                map-options
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="format_list_numbered" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Попередній перегляд -->
          <q-card flat bordered class="q-mt-md bg-grey-1">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm text-primary">
                <q-icon name="preview" class="q-mr-sm" />
                {{ $t('company.currencySettings.preview') }}
              </div>
              <div class="row q-gutter-md">
                <div class="col">
                  <div class="text-caption text-grey-7">
                    {{ $t('company.currencySettings.smallAmount') }}
                  </div>
                  <div class="text-subtitle1">{{ formatCurrency(123.45) }}</div>
                </div>
                <div class="col">
                  <div class="text-caption text-grey-7">
                    {{ $t('company.currencySettings.largeAmount') }}
                  </div>
                  <div class="text-subtitle1">{{ formatCurrency(123456.78) }}</div>
                </div>
                <div class="col">
                  <div class="text-caption text-grey-7">
                    {{ $t('company.currencySettings.zeroAmount') }}
                  </div>
                  <div class="text-subtitle1">{{ formatCurrency(0) }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Додаткові налаштування -->
          <q-expansion-item
            icon="tune"
            :label="$t('company.currencySettings.advancedSettings')"
            class="q-mt-md"
          >
            <q-card flat>
              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-md">
                  <!-- Кількість десяткових знаків -->
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.decimalPlaces"
                      :label="$t('company.currencySettings.decimalPlaces')"
                      type="number"
                      outlined
                      dense
                      min="0"
                      max="4"
                    >
                      <template v-slot:prepend>
                        <q-icon name="looks_one" />
                      </template>
                    </q-input>
                  </div>

                  <!-- Роздільник тисяч -->
                  <div class="col-12 col-md-6">
                    <q-toggle
                      v-model="form.useThousandsSeparator"
                      :label="$t('company.currencySettings.useThousandsSeparator')"
                      color="primary"
                      size="lg"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Попередження про зміну валюти -->
          <q-banner
            v-if="form.currency !== currentCurrency.code"
            class="q-mt-md bg-orange-1 text-orange-8"
            rounded
          >
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" />
            </template>
            {{ $t('company.currencySettings.changeWarning') }}
          </q-banner>

          <!-- Кнопки дій -->
          <div class="row q-gutter-sm justify-end q-mt-lg">
            <!-- Скидання до гривні -->
            <q-btn
              v-if="form.currency !== 'UAH'"
              :label="$t('company.currencySettings.resetToUAH')"
              color="grey"
              icon="refresh"
              @click="resetToUAH"
            />

            <!-- Збереження -->
            <q-btn
              :label="$t('common.save')"
              color="positive"
              icon="save"
              type="submit"
              :loading="saving"
              :disable="!hasChanges"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { CompanyApi } from 'src/api/company'
import { SUPPORTED_CURRENCIES, getCurrencyName, getCurrencyByCode } from 'src/constants/currencies'
const $q = useQuasar()
const { t, locale } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)

// Current currency
const currentCurrency = ref({
  code: 'UAH',
  symbol: '₴',
})

// Form
const form = ref({
  currency: 'UAH',
  format: 'symbol_before',
  decimalPlaces: 2,
  useThousandsSeparator: true,
})

// Original settings for comparison
const originalSettings = ref({})

// Computed
const currencyOptions = computed(() => {
  return SUPPORTED_CURRENCIES.map((currency) => ({
    label: getCurrencyName(currency, locale.value),
    value: currency.code,
    symbol: currency.symbol,
  }))
})

const formatOptions = computed(() => [
  { label: t('company.currencySettings.formats.symbolBefore'), value: 'symbol_before' },
  { label: t('company.currencySettings.formats.symbolAfter'), value: 'symbol_after' },
  { label: t('company.currencySettings.formats.codeAfter'), value: 'code_after' },
])

const selectedCurrencyData = computed(() => {
  return getCurrencyByCode(form.value.currency)
})

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalSettings.value)
})

// Methods
const getCurrentCurrencyName = () => {
  const currency = getCurrencyByCode(currentCurrency.value.code)
  return currency ? getCurrencyName(currency, locale.value) : currentCurrency.value.code
}

const formatCurrency = (amount) => {
  const currency = selectedCurrencyData.value
  if (!currency) return amount.toString()

  const parts = Number(amount).toFixed(form.value.decimalPlaces).split('.')

  if (form.value.useThousandsSeparator) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formattedAmount = parts.join('.')

  switch (form.value.format) {
    case 'symbol_before':
      return `${currency.symbol}${formattedAmount}`
    case 'symbol_after':
      return `${formattedAmount} ${currency.symbol}`
    case 'code_after':
      return `${formattedAmount} ${currency.code}`
    default:
      return `${currency.symbol}${formattedAmount}`
  }
}

const loadCurrencySettings = async () => {
  loading.value = true
  try {
    const response = await CompanyApi.getCurrencySettings()

    if (response.data.success) {
      const settings = response.data.settings

      form.value = { ...settings }
      originalSettings.value = { ...settings }

      // Update current currency
      const currencyData = getCurrencyByCode(settings.currency)
      if (currencyData) {
        currentCurrency.value = {
          code: currencyData.code,
          symbol: currencyData.symbol,
        }
      }
    }
  } catch (error) {
    console.error('Error loading currency settings:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const saveCurrencySettings = async () => {
  saving.value = true
  try {
    const response = await CompanyApi.saveCurrencySettings(form.value)

    if (response.data.success) {
      // Update current currency and original settings
      originalSettings.value = { ...form.value }

      const currencyData = selectedCurrencyData.value
      if (currencyData) {
        currentCurrency.value = {
          code: currencyData.code,
          symbol: currencyData.symbol,
        }
      }

      $q.notify({
        color: 'positive',
        message: response.data.message || t('company.currencySettings.saveSuccess'),
        icon: 'check',
      })
    }
  } catch (error) {
    console.error('Error saving currency settings:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const resetToUAH = () => {
  form.value = {
    currency: 'UAH',
    format: 'symbol_before',
    decimalPlaces: 2,
    useThousandsSeparator: true,
  }
}

// Lifecycle
onMounted(() => {
  loadCurrencySettings()
})
</script>

<style scoped>
.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
