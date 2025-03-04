<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!object" class="row justify-center q-pa-md">
      <q-banner class="bg-negative text-white">
        {{ $t('wialonObjects.notFound') }}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('common.back')" @click="goBack" />
        </template>
      </q-banner>
    </div>

    <template v-else>
      <!-- Заголовок сторінки з кнопками дій -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="text-h6 q-ml-sm">{{ object.name }}</div>
        <q-chip class="q-ml-md" :color="getStatusColor(object.status)" text-color="white">
          {{ $t(`wialonObjects.statuses.${object.status}`) }}
        </q-chip>
        <q-space />
        <q-btn
          color="info"
          icon="swap_horiz"
          class="q-mr-sm"
          :label="$t('wialonObjects.ownership.changeOwner')"
          @click="openChangeOwnerDialog"
        />
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
          <q-tab name="info" :label="$t('wialonObjects.tabs.info')" />
          <q-tab name="products" :label="$t('wialonObjects.tabs.products')" />
          <q-tab name="history" :label="$t('wialonObjects.tabs.history')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Вкладка з інформацією -->
          <q-tab-panel name="info">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('wialonObjects.basicInfo') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('wialonObjects.name') }}</q-item-label>
                          <q-item-label>{{ object.name }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('wialonObjects.wialonId') }}</q-item-label>
                          <q-item-label>{{ object.wialon_id }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('wialonObjects.client') }}</q-item-label>
                          <q-item-label>{{ object.client_name }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('wialonObjects.description') }}</q-item-label>
                          <q-item-label>{{ object.description || '-' }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('common.status') }}</q-item-label>
                          <q-item-label>
                            <q-chip :color="getStatusColor(object.status)" text-color="white" dense>
                              {{ $t(`wialonObjects.statuses.${object.status}`) }}
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
                    <div class="text-subtitle1">{{ $t('wialonObjects.tariffInfo') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <div v-if="!object.tariff_id" class="text-grey text-center">
                      {{ $t('tariffs.noTariff') }}
                    </div>
                    <q-list v-else>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('wialonObjects.tariffName') }}</q-item-label>
                          <q-item-label>{{ object.tariff_name }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('wialonObjects.tariffPrice') }}</q-item-label>
                          <q-item-label>{{ formatCurrency(object.tariff_price) }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Вкладка з продуктами -->
          <q-tab-panel name="products">
            <div class="text-h6">{{ $t('wialonObjects.products.title') }}</div>
            <div
              v-if="!object.installed_products || object.installed_products.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('wialonObjects.products.noProducts') }}
            </div>
            <q-list v-else bordered separator>
              <q-item
                v-for="product in object.installed_products"
                :key="product.id"
                clickable
                @click="openProductDetails(product)"
              >
                <q-item-section>
                  <q-item-label>{{ product.sku }}</q-item-label>
                  <q-item-label caption
                    >{{ product.model_name }} ({{ product.manufacturer_name }})</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="chevron_right" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Вкладка з історією -->
          <q-tab-panel name="history">
            <div class="text-h6">{{ $t('wialonObjects.ownership.history') }}</div>
            <div
              v-if="!object.ownership_history || object.ownership_history.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('wialonObjects.ownership.noHistory') }}
            </div>
            <q-timeline v-else color="primary">
              <q-timeline-entry
                v-for="(history, index) in sortedOwnershipHistory"
                :key="index"
                :title="history.client_name"
                :subtitle="formatDateRange(history.start_date, history.end_date)"
              >
                <div v-if="history.notes" class="q-mt-sm">
                  {{ history.notes }}
                </div>
              </q-timeline-entry>
            </q-timeline>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>

    <!-- Діалоги -->
    <wialon-object-dialog v-model="showDialog" :edit-data="object" @saved="loadObject" />
    <wialon-object-change-owner-dialog
      v-model="showChangeOwnerDialog"
      :object="object"
      @saved="loadObject"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WialonApi } from 'src/api/wialon'
import { date } from 'quasar'
import WialonObjectDialog from 'components/wialon/WialonObjectDialog.vue'
import WialonObjectChangeOwnerDialog from 'components/wialon/WialonObjectChangeOwnerDialog.vue'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// State
const object = ref(null)
const loading = ref(true)
const tab = ref('info')
const showDialog = ref(false)
const showChangeOwnerDialog = ref(false)

// Computed
const sortedOwnershipHistory = computed(() => {
  if (!object.value || !object.value.ownership_history) return []

  return [...object.value.ownership_history].sort((a, b) => {
    return new Date(b.start_date) - new Date(a.start_date)
  })
})

// Methods
const loadObject = async () => {
  loading.value = true
  try {
    const objectId = route.params.id
    const response = await WialonApi.getObject(objectId)
    object.value = response.data.object
  } catch (error) {
    console.error('Error loading object:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    object.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'wialon-objects' })
}

const openEditDialog = () => {
  showDialog.value = true
}

const openChangeOwnerDialog = () => {
  showChangeOwnerDialog.value = true
}

const openProductDetails = (product) => {
  router.push({ name: 'product-details', params: { id: product.id } })
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    suspended: 'warning',
    inactive: 'grey',
  }
  return colors[status] || 'grey'
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate) return ''

  const formattedStart = formatDate(startDate)
  if (!endDate) {
    return `${formattedStart} - ${t('common.present')}`
  }

  return `${formattedStart} - ${formatDate(endDate)}`
}

// Lifecycle
onMounted(() => {
  loadObject()
})
</script>

<style scoped>
.q-tab-panels {
  background-color: transparent;
}
</style>
