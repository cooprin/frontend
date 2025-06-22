<template>
  <q-page padding>
    <div class="row">
      <div class="col-12">
        <div class="text-h5 q-mb-md">
          {{ $t('portal.pages.objects.title') }}
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="40px" color="primary" />
          <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
        </div>

        <!-- Objects List -->
        <div v-else-if="objects.length > 0" class="row q-gutter-md">
          <div v-for="object in objects" :key="object.id" class="col-12 col-md-6 col-lg-4">
            <q-card class="object-card" bordered>
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <div class="col">
                    <div class="text-h6 text-weight-bold">
                      {{ object.name }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-chip
                      :color="getStatusColor(object.status)"
                      text-color="white"
                      :label="$t(`portal.statuses.${object.status}`)"
                      dense
                    />
                  </div>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Object Details -->
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="fingerprint" color="grey-6" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>Wialon ID</q-item-label>
                      <q-item-label>{{ object.wialon_id }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="object.description">
                    <q-item-section avatar>
                      <q-icon name="description" color="grey-6" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{ $t('common.description') }}</q-item-label>
                      <q-item-label>{{ object.description }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <!-- Tariff Info -->
                  <q-item v-if="object.tariff_name">
                    <q-item-section avatar>
                      <q-icon name="attach_money" color="green-6" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{ $t('portal.pages.objects.tariff') }}</q-item-label>
                      <q-item-label>
                        {{ object.tariff_name }}
                        <span v-if="object.tariff_price" class="text-weight-bold text-green-8">
                          ({{ formatPrice(object.tariff_price) }}
                          {{ $t('portal.pages.objects.monthly') }})
                        </span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="object.tariff_from">
                    <q-item-section avatar>
                      <q-icon name="event" color="grey-6" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{ $t('common.from') }}</q-item-label>
                      <q-item-label>{{ formatDate(object.tariff_from) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <!-- Actions -->
              <q-card-actions align="right" class="q-pa-md">
                <q-btn
                  flat
                  color="primary"
                  icon="support_agent"
                  :label="$t('tickets.create')"
                  @click="createTicketForObject(object)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="directions_car_filled" size="80px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">
            {{ $t('portal.pages.objects.noObjects') }}
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center q-py-md">
          <q-icon name="error" size="48px" color="negative" />
          <div class="q-mt-sm text-negative">{{ error }}</div>
          <q-btn color="primary" :label="$t('common.retry')" @click="loadObjects" class="q-mt-md" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PortalApi } from 'src/api/portal'
import { date } from 'quasar'

const router = useRouter()

const objects = ref([])
const loading = ref(false)
const error = ref(null)

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    suspended: 'orange',
  }
  return colors[status] || 'grey'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const createTicketForObject = (object) => {
  // Navigate to ticket creation with pre-selected object
  router.push({
    name: 'portal-tickets',
    query: {
      action: 'create',
      object_id: object.id,
      object_name: object.name,
    },
  })
}

const loadObjects = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await PortalApi.getObjects()

    if (response.data.success) {
      objects.value = response.data.objects
    } else {
      error.value = response.data.message || "Помилка завантаження об'єктів"
    }
  } catch (err) {
    console.error('Error loading objects:', err)
    error.value = err.response?.data?.message || "Помилка завантаження об'єктів"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadObjects()
})
</script>

<style scoped>
.object-card {
  transition: all 0.3s ease;
}

.object-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-item-label {
  font-size: 0.9rem;
}

.q-item-label[caption] {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
