<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!service" class="row justify-center q-pa-md">
      <q-banner class="bg-negative text-white">
        {{ $t('services.notFound') }}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('common.back')" @click="goBack" />
        </template>
      </q-banner>
    </div>

    <template v-else>
      <!-- Заголовок сторінки з кнопками дій -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="text-h6 q-ml-sm">{{ service.name }}</div>
        <q-chip
          class="q-ml-md"
          :color="getServiceTypeColor(service.service_type)"
          text-color="white"
        >
          {{ $t(`services.types.${service.service_type}`) }}
        </q-chip>
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
          <q-tab name="info" :label="$t('services.tabs.info')" />
          <q-tab name="clients" :label="$t('services.tabs.clients')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Вкладка з інформацією -->
          <q-tab-panel name="info">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('services.basicInfo') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('services.name') }}</q-item-label>
                          <q-item-label>{{ service.name }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('services.serviceType') }}</q-item-label>
                          <q-item-label>{{
                            $t(`services.types.${service.service_type}`)
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="service.service_type === 'fixed'">
                        <q-item-section>
                          <q-item-label caption>{{ $t('services.fixedPrice') }}</q-item-label>
                          <q-item-label>{{ formatCurrency(service.fixed_price) }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('services.description') }}</q-item-label>
                          <q-item-label>{{ service.description || '-' }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('common.status') }}</q-item-label>
                          <q-item-label>
                            <q-chip
                              :color="service.is_active ? 'positive' : 'grey'"
                              text-color="white"
                              dense
                            >
                              {{ service.is_active ? $t('common.active') : $t('common.inactive') }}
                            </q-chip>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('services.statistics') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('services.clientsCount') }}</q-item-label>
                            <q-item-label class="text-h6">{{
                              service.clients_count || 0
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

          <!-- Вкладка з клієнтами -->
          <q-tab-panel name="clients">
            <div class="row justify-between q-mb-md">
              <div class="text-h6">{{ $t('services.clients.title') }}</div>
            </div>

            <div
              v-if="!service.clients || service.clients.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('services.clients.noClients') }}
            </div>

            <q-table
              v-else
              :rows="service.clients"
              :columns="clientsColumns"
              row-key="id"
              :pagination="clientsPagination"
              flat
              bordered
            >
              <!-- Слот для дати початку -->
              <template v-slot:body-cell-start_date="props">
                <q-td :props="props">
                  {{ formatDate(props.row.start_date) }}
                </q-td>
              </template>

              <!-- Слот для дати закінчення -->
              <template v-slot:body-cell-end_date="props">
                <q-td :props="props">
                  {{ props.row.end_date ? formatDate(props.row.end_date) : '-' }}
                </q-td>
              </template>

              <!-- Слот для статусу -->
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="props.row.status === 'active' ? 'positive' : 'grey'"
                    text-color="white"
                    dense
                  >
                    {{ $t(`services.statuses.${props.row.status}`) }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Слот для розрахованої ціни -->
              <template v-slot:body-cell-calculated_price="props">
                <q-td :props="props">
                  {{ formatCurrency(props.row.calculated_price) }}
                </q-td>
              </template>

              <!-- Слот для дій -->
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    v-if="props.row.status === 'active'"
                    flat
                    round
                    dense
                    color="negative"
                    icon="block"
                    @click="openTerminateDialog(props.row)"
                  >
                    <q-tooltip>{{ $t('services.clients.terminate') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="visibility"
                    @click="openClientDetails(props.row)"
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

    <!-- Діалог редагування послуги -->
    <service-dialog v-model="showDialog" :edit-data="service" @saved="loadService" />

    <!-- Діалог припинення надання послуги -->
    <q-dialog v-model="showTerminateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('services.clients.terminate') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="terminateService" class="q-gutter-md">
            <!-- Дата закінчення -->
            <q-input
              v-model="terminateForm.end_date"
              :label="$t('services.clients.terminationDate')"
              outlined
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="terminateForm.end_date" mask="YYYY-MM-DD">
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
              v-model="terminateForm.notes"
              :label="$t('services.assignment.notes')"
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
                :loading="terminating"
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
import { ServicesApi } from 'src/api/services'
import { date } from 'quasar'
import ServiceDialog from 'components/services/ServiceDialog.vue'
import { useCurrency } from 'src/composables/useCurrency'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { formatCurrency: formatCurrencyFromComposable } = useCurrency()

// State
const service = ref(null)
const loading = ref(true)
const tab = ref('info')
const showDialog = ref(false)
const showTerminateDialog = ref(false)
const clientAssignmentToTerminate = ref(null)
const terminating = ref(false)

// Вкладка клієнтів
const clientsPagination = ref({
  rowsPerPage: 0, // 0 означає "всі рядки"
})

const terminateForm = ref({
  end_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
  notes: '',
})

// Columns
const clientsColumns = computed(() => [
  {
    name: 'client_name',
    required: true,
    label: t('clients.name'),
    align: 'left',
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'start_date',
    label: t('services.clients.startDate'),
    align: 'left',
    field: 'start_date',
    sortable: true,
  },
  {
    name: 'end_date',
    label: t('services.clients.endDate'),
    align: 'left',
    field: 'end_date',
    sortable: true,
  },
  {
    name: 'status',
    label: t('common.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'calculated_price',
    label: t('services.fixedPrice'),
    align: 'right',
    field: 'calculated_price',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    sortable: false,
  },
])

// Methods
const loadService = async () => {
  loading.value = true
  try {
    const serviceId = route.params.id
    const response = await ServicesApi.getService(serviceId)
    service.value = response.data.service
  } catch (error) {
    console.error('Error loading service:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    service.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'services' })
}

const openEditDialog = () => {
  showDialog.value = true
}

const openTerminateDialog = (clientAssignment) => {
  clientAssignmentToTerminate.value = clientAssignment
  terminateForm.value = {
    end_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
    notes: '',
  }
  showTerminateDialog.value = true
}

const terminateService = async () => {
  terminating.value = true
  try {
    await ServicesApi.terminateClientService(
      clientAssignmentToTerminate.value.id,
      terminateForm.value,
    )

    $q.notify({
      color: 'positive',
      message: t('services.clients.terminateSuccess'),
      icon: 'check',
    })

    showTerminateDialog.value = false
    loadService() // Перезавантаження даних послуги
  } catch (error) {
    console.error('Error terminating service:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    terminating.value = false
  }
}

const openClientDetails = (clientAssignment) => {
  router.push({ name: 'client-details', params: { id: clientAssignment.client_id } })
}

const getServiceTypeColor = (type) => {
  const colors = {
    fixed: 'blue',
    object_based: 'purple',
  }
  return colors[type] || 'grey'
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return formatCurrencyFromComposable(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

// Lifecycle
onMounted(() => {
  loadService()
})
</script>
