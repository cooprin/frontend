<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!tariff" class="row justify-center q-pa-md">
      <q-banner class="bg-negative text-white">
        {{ $t('tariffs.notFound') }}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('common.back')" @click="goBack" />
        </template>
      </q-banner>
    </div>

    <template v-else>
      <!-- Заголовок сторінки з кнопками дій -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" color="primary" @click="goBack" />
        <div class="text-h6 q-ml-sm">{{ tariff.name }}</div>
        <q-chip class="q-ml-md" :color="tariff.is_active ? 'positive' : 'grey'" text-color="white">
          {{ tariff.is_active ? $t('common.active') : $t('common.inactive') }}
        </q-chip>
        <q-space />
        <q-btn
          color="info"
          icon="link"
          class="q-mr-sm"
          :label="$t('tariffs.assignment.assignTo')"
          @click="openAssignDialog"
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
          <q-tab name="info" :label="$t('tariffs.tabs.info')" />
          <q-tab name="objects" :label="$t('tariffs.tabs.objects')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Вкладка з інформацією -->
          <q-tab-panel name="info">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1">{{ $t('tariffs.basicInfo') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('tariffs.name') }}</q-item-label>
                          <q-item-label>{{ tariff.name }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('tariffs.price') }}</q-item-label>
                          <q-item-label>{{ formatCurrency(tariff.price) }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('tariffs.description') }}</q-item-label>
                          <q-item-label>{{ tariff.description || '-' }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('common.status') }}</q-item-label>
                          <q-item-label>
                            <q-chip
                              :color="tariff.is_active ? 'positive' : 'grey'"
                              text-color="white"
                              dense
                            >
                              {{ tariff.is_active ? $t('common.active') : $t('common.inactive') }}
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
                    <div class="text-subtitle1">{{ $t('tariffs.statistics') }}</div>
                  </q-card-section>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <q-item>
                          <q-item-section>
                            <q-item-label caption>{{ $t('tariffs.objectsCount') }}</q-item-label>
                            <q-item-label class="text-h6">{{
                              tariff.objects_count || 0
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

          <!-- Вкладка з об'єктами -->
          <q-tab-panel name="objects">
            <div class="text-h6">{{ $t('tariffs.objects.title') }}</div>
            <div
              v-if="!tariff.objects || tariff.objects.length === 0"
              class="text-center q-pa-md text-grey"
            >
              {{ $t('tariffs.objects.noObjects') }}
            </div>
            <q-table
              v-else
              :rows="tariff.objects"
              :columns="objectsColumns"
              row-key="id"
              :pagination="objectsPagination"
              flat
              bordered
            >
              <!-- Слот для дати початку -->
              <template v-slot:body-cell-effective_from="props">
                <q-td :props="props">
                  {{ formatDate(props.row.effective_from) }}
                </q-td>
              </template>

              <!-- Слот для клієнта -->
              <template v-slot:body-cell-client_name="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    :label="props.row.client_name"
                    color="primary"
                    @click="openClientDetails(props.row)"
                  />
                </q-td>
              </template>

              <!-- Слот для дій -->
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="visibility"
                    @click="openObjectDetails(props.row)"
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

    <!-- Діалоги -->
    <tariff-dialog v-model="showDialog" :edit-data="tariff" @saved="loadTariff" />
    <tariff-assign-dialog v-model="showAssignDialog" :tariff="tariff" @saved="loadTariff" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { TariffsApi } from 'src/api/tariffs'
import { date } from 'quasar'
import TariffDialog from 'components/tariffs/TariffDialog.vue'
import TariffAssignDialog from 'components/tariffs/TariffAssignDialog.vue'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// State
const tariff = ref(null)
const loading = ref(true)
const tab = ref('info')
const showDialog = ref(false)
const showAssignDialog = ref(false)

// Вкладка об'єктів
const objectsPagination = ref({
  rowsPerPage: 0, // 0 означає "всі рядки"
})

// Columns
const objectsColumns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('wialonObjects.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'wialon_id',
    label: t('wialonObjects.wialonId'),
    align: 'left',
    field: 'wialon_id',
    sortable: true,
  },
  {
    name: 'client_name',
    label: t('tariffs.objects.clientName'),
    align: 'left',
    field: 'client_name',
    sortable: true,
  },
  {
    name: 'effective_from',
    label: t('tariffs.objects.effectiveFrom'),
    align: 'left',
    field: 'effective_from',
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
const loadTariff = async () => {
  loading.value = true
  try {
    const tariffId = route.params.id
    const response = await TariffsApi.getTariff(tariffId)
    tariff.value = response.data.tariff
  } catch (error) {
    console.error('Error loading tariff:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
    tariff.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'tariffs' })
}

const openEditDialog = () => {
  showDialog.value = true
}

const openAssignDialog = () => {
  showAssignDialog.value = true
}

const openObjectDetails = (object) => {
  router.push({ name: 'wialon-object-details', params: { id: object.id } })
}

const openClientDetails = (object) => {
  router.push({ name: 'client-details', params: { id: object.client_id } })
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

// Lifecycle
onMounted(() => {
  loadTariff()
})
</script>

<style scoped>
.q-tab-panels {
  background-color: transparent;
}
</style>
