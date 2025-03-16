<template>
  <q-dialog v-model="show" persistent maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('invoices.create') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Ліва колонка - основна інформація -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">{{ $t('invoices.basicInfo') }}</div>
                </q-card-section>

                <q-card-section class="q-gutter-md">
                  <!-- Клієнт -->
                  <q-select
                    v-model="form.client_id"
                    :options="clientOptions"
                    :label="$t('invoices.client')"
                    :rules="[(val) => !!val || t('common.validation.required')]"
                    :loading="loadingClients"
                    outlined
                    emit-value
                    map-options
                    @update:model-value="onClientChange"
                  />

                  <!-- Дата рахунку -->
                  <q-input
                    v-model="form.invoice_date"
                    :label="$t('invoices.invoiceDate')"
                    :rules="[(val) => !!val || t('common.validation.required')]"
                    outlined
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.invoice_date" mask="YYYY-MM-DD">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="OK" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>

                  <!-- Розрахунковий період - місяць -->
                  <q-select
                    v-model="form.billing_month"
                    :options="monthOptions"
                    :label="$t('invoices.billingMonth')"
                    :rules="[(val) => !!val || t('common.validation.required')]"
                    outlined
                    emit-value
                    map-options
                  />

                  <!-- Розрахунковий період - рік -->
                  <q-select
                    v-model="form.billing_year"
                    :options="yearOptions"
                    :label="$t('invoices.billingYear')"
                    :rules="[(val) => !!val || t('common.validation.required')]"
                    outlined
                    emit-value
                    map-options
                  />

                  <!-- Примітки -->
                  <q-input
                    v-model="form.notes"
                    :label="$t('invoices.notes')"
                    type="textarea"
                    outlined
                    autogrow
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Права колонка - позиції рахунку -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section class="row items-center">
                  <div class="text-subtitle1">{{ $t('invoices.items.title') }}</div>
                  <q-space />
                  <q-btn
                    color="primary"
                    icon="add"
                    :label="$t('invoices.items.add')"
                    dense
                    @click="addInvoiceItem"
                  />
                </q-card-section>

                <q-card-section>
                  <div v-if="form.items.length === 0" class="text-center text-grey q-pa-md">
                    {{ $t('invoices.noItems') }}
                  </div>
                  <div v-else class="q-mb-md" v-for="(item, index) in form.items" :key="index">
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="row q-col-gutter-sm">
                          <!-- Послуга -->
                          <div class="col-12">
                            <q-select
                              v-model="item.service_id"
                              :options="availableServiceOptions"
                              :label="$t('invoices.items.service')"
                              :rules="[(val) => !!val || t('common.validation.required')]"
                              outlined
                              dense
                              emit-value
                              map-options
                              @update:model-value="updateItemPrice(item)"
                            />
                          </div>

                          <!-- Опис -->
                          <div class="col-12">
                            <q-input
                              v-model="item.description"
                              :label="$t('invoices.items.description')"
                              outlined
                              dense
                            />
                          </div>

                          <!-- Кількість -->
                          <div class="col-4">
                            <q-input
                              v-model.number="item.quantity"
                              :label="$t('invoices.items.quantity')"
                              type="number"
                              :rules="[(val) => val > 0 || t('validation.minValue', { min: 1 })]"
                              outlined
                              dense
                              @update:model-value="updateItemTotal(item)"
                            />
                          </div>

                          <!-- Ціна за одиницю -->
                          <div class="col-4">
                            <q-input
                              v-model.number="item.unit_price"
                              :label="$t('invoices.items.unitPrice')"
                              type="number"
                              :rules="[(val) => val > 0 || t('validation.minValue', { min: 1 })]"
                              outlined
                              dense
                              prefix="₴"
                              @update:model-value="updateItemTotal(item)"
                            />
                          </div>

                          <!-- Загальна ціна (розрахункова) -->
                          <div class="col-4">
                            <q-input
                              v-model.number="item.total_price"
                              :label="$t('invoices.items.totalPrice')"
                              type="number"
                              outlined
                              dense
                              prefix="₴"
                              readonly
                            />
                          </div>
                        </div>

                        <div class="row justify-end q-mt-sm">
                          <q-btn
                            color="negative"
                            :label="$t('invoices.items.remove')"
                            flat
                            dense
                            @click="removeInvoiceItem(index)"
                          />
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="row justify-end">
                    <div class="text-h6">
                      {{ $t('invoices.totalAmount') }}: {{ formatCurrency(calculateTotal()) }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="row justify-end q-gutter-sm">
            <q-btn :label="t('common.cancel')" color="grey" v-close-popup />
            <q-btn :label="t('common.save')" color="primary" type="submit" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { InvoicesApi } from 'src/api/invoices'
import { ClientsApi } from 'src/api/clients'
import { ServicesApi } from 'src/api/services'
import { date } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const loadingClients = ref(false)
const loadingServices = ref(false)
const clientOptions = ref([])
const serviceOptions = ref([])
const clientServices = ref([])

// Default form
const defaultForm = {
  client_id: null,
  invoice_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
  billing_month: new Date().getMonth() + 1, // Поточний місяць
  billing_year: new Date().getFullYear(), // Поточний рік
  notes: '',
  items: [],
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Поточний рік для вибору + 3 попередні
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 4; i++) {
    const year = currentYear - i
    years.push({ label: year.toString(), value: year })
  }
  return years
})

// Місяці для вибору
const monthOptions = computed(() => {
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push({ label: t(`invoices.months.${i}`), value: i })
  }
  return months
})

// Доступні послуги для вибраного клієнта

const availableServiceOptions = computed(() => {
  if (!form.value.client_id) {
    return []
  }

  // Показуємо послуги типу "fixed" незалежно від того, чи призначені вони клієнту,
  // та послуги типу "object_based", які призначені клієнту
  return serviceOptions.value.filter((option) => {
    const service = serviceOptions.value.find((s) => s.value === option.value)

    // Послуги з фіксованою ціною (fixed) показуємо завжди
    if (service && service.type === 'fixed') {
      return true
    }

    // Послуги на основі об'єктів (object_based) показуємо тільки якщо вони призначені клієнту
    return clientServices.value.some((clientService) => clientService.service_id === option.value)
  })
})

// Methods
const loadClients = async () => {
  loadingClients.value = true
  try {
    const response = await ClientsApi.getClients({
      is_active: true,
      perPage: 'All',
    })

    clientOptions.value = response.data.clients.map((client) => ({
      label: client.name,
      value: client.id,
    }))
  } catch (error) {
    console.error('Error loading clients:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingClients.value = false
  }
}

const loadServices = async () => {
  loadingServices.value = true
  try {
    const response = await ServicesApi.getServices({
      is_active: true,
      perPage: 'All',
    })

    serviceOptions.value = response.data.services.map((service) => ({
      label: service.name,
      value: service.id,
      type: service.service_type,
      price: service.fixed_price,
    }))
  } catch (error) {
    console.error('Error loading services:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingServices.value = false
  }
}

const loadClientServices = async (clientId) => {
  if (!clientId) {
    clientServices.value = []
    return
  }

  try {
    const response = await ServicesApi.getClientServices(clientId)
    clientServices.value = response.data.services
  } catch (error) {
    console.error('Error loading client services:', error)
    clientServices.value = []
  }
}

const onClientChange = (clientId) => {
  loadClientServices(clientId)
  form.value.items = [] // Очищаємо список позицій при зміні клієнта
}

const addInvoiceItem = () => {
  form.value.items.push({
    service_id: null,
    description: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
  })
}

const removeInvoiceItem = (index) => {
  form.value.items.splice(index, 1)
}

const updateItemPrice = (item) => {
  if (!item.service_id) return

  const service = serviceOptions.value.find((s) => s.value === item.service_id)
  if (service && service.type === 'fixed') {
    item.unit_price = service.price || 0
  }

  updateItemTotal(item)
}

const updateItemTotal = (item) => {
  item.total_price = (item.quantity || 0) * (item.unit_price || 0)
}

const calculateTotal = () => {
  return form.value.items.reduce((total, item) => total + (item.total_price || 0), 0)
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const onSubmit = async () => {
  if (form.value.items.length === 0) {
    $q.notify({
      color: 'negative',
      message: t('invoices.noItems'),
      icon: 'error',
    })
    return
  }

  loading.value = true
  try {
    await InvoicesApi.createInvoice(form.value)

    $q.notify({
      color: 'positive',
      message: t('invoices.createSuccess'),
      icon: 'check',
    })

    form.value = { ...defaultForm }
    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error creating invoice:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.creating'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadClients()
  loadServices()
})
</script>
