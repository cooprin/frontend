<template>
  <q-page padding>
    <!-- Заголовок з навігацією -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" :to="{ name: 'products' }" />
        <h5 class="q-mt-none q-mb-none">{{ product?.sku }}</h5>
        <q-chip v-if="product" :color="getStatusColor(product.current_status)" text-color="white">
          {{ $t(`products.statuses.${product.current_status}`) }}
        </q-chip>
      </div>

      <div class="row q-gutter-sm">
        <q-btn color="warning" icon="edit" :label="$t('common.edit')" @click="openEditDialog" />
      </div>
    </div>

    <!-- Основна інформація -->
    <div class="row q-col-gutter-md">
      <!-- Ліва колонка -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">{{ $t('products.mainInfo') }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-grey">{{ $t('products.sku') }}</div>
                <div>{{ product?.sku }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-grey">{{ $t('products.model') }}</div>
                <div>{{ product?.model_name }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-grey">{{ $t('products.manufacturer') }}</div>
                <div>{{ product?.manufacturer_name }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-grey">{{ $t('products.supplier') }}</div>
                <div>{{ product?.supplier_name }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-grey">{{ $t('products.ownership') }}</div>
                <div>{{ product?.is_own ? $t('products.own') : $t('products.notOwn') }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Контактна інформація постачальника -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6">{{ $t('products.supplierInfo') }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-grey">{{ $t('products.supplierContact') }}</div>
                <div>{{ product?.supplier_contact || '-' }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-grey">{{ $t('products.supplierPhone') }}</div>
                <div>{{ product?.supplier_phone || '-' }}</div>
              </div>

              <div class="col-12">
                <div class="text-grey">{{ $t('products.supplierEmail') }}</div>
                <div>{{ product?.supplier_email || '-' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Права колонка -->
      <div class="col-12 col-md-6">
        <!-- Характеристики - новий блок -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6">{{ $t('products.characteristics') }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="!hasCharacteristics" class="text-grey text-center q-pa-md">
              {{ $t('products.noCharacteristics') }}
            </div>

            <div v-else class="row q-col-gutter-md">
              <template v-for="char in productCharacteristics" :key="char.code">
                <div class="col-12 col-sm-6">
                  <div class="text-grey">{{ char.name }}</div>
                  <div class="row items-center q-gutter-x-sm">
                    <div>{{ formatCharacteristicValue(char) }}</div>
                    <q-chip
                      :color="getCharacteristicColor(char.type)"
                      text-color="white"
                      square
                      dense
                    >
                      {{ $t(`productTypes.characteristicTypes.${char.type}`) }}
                    </q-chip>
                  </div>
                </div>
              </template>
            </div>
          </q-card-section>
        </q-card>

        <!-- Поточне розташування -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6">{{ $t('products.currentLocation') }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <template v-if="product?.current_status === 'in_stock'">
                <div class="col-12">
                  <div class="text-grey">{{ $t('products.warehouse') }}</div>
                  <div>{{ currentLocation?.warehouse_name || '-' }}</div>
                </div>
              </template>
              <template v-else-if="product?.current_status === 'installed'">
                <div class="col-12">
                  <div class="text-grey">{{ $t('products.wialonObject') }}</div>
                  <div v-if="wialonObject">
                    {{ wialonObject.name }} (ID в Wialon: {{ wialonObject.wialon_id }})
                  </div>
                  <div v-else-if="loadingWialonObject">
                    <q-spinner size="xs" /> {{ $t('common.loading') }}
                  </div>
                  <div v-else>-</div>
                </div>
              </template>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Історія руху -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">{{ $t('products.movements') }}</div>
          </q-card-section>

          <q-separator />

          <q-table
            :rows="movements"
            :columns="movementsColumns"
            :loading="loadingMovements"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <!-- Форматування типу руху -->
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                {{ $t(`stock.types.${props.row.type}`) }}
              </q-td>
            </template>

            <!-- Форматування дати -->
            <template v-slot:body-cell-created_at="props">
              <q-td :props="props">
                {{ formatDateTime(props.row.created_at) }}
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- Діалог редагування -->
    <ProductDialog v-model="showEditDialog" :edit-data="product" @saved="loadProduct" />

    <!-- Діалог зміни статусу -->
    <q-dialog v-model="showStatusDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('products.changeStatus') }}</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="newStatus"
            :options="statusSearch.filteredOptions.value"
            :label="$t('products.status')"
            outlined
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="(val, update) => statusSearch.filterOptions(val, update)"
            @popup-show="statusSearch.resetFilter"
          />

          <q-input
            v-if="newStatus === 'installed'"
            v-model="objectId"
            :label="$t('products.objectId')"
            class="q-mt-sm"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.save')"
            color="primary"
            @click="updateStatus"
            :loading="updatingStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { ProductsApi } from 'src/api/products'
import { WialonApi } from 'src/api/wialon'
import ProductDialog from 'components/products/ProductDialog.vue'
import { SuppliersApi } from 'src/api/suppliers'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

const route = useRoute()
const $q = useQuasar()
const { t } = useI18n()

// State
const product = ref(null)
const movements = ref([])
const loadingMovements = ref(false)
const showEditDialog = ref(false)
const showStatusDialog = ref(false)
const newStatus = ref(null)
const objectId = ref(null)
const updatingStatus = ref(false)
const currentLocation = ref(null)
// Новий стан для об'єкта Wialon
const wialonObject = ref(null)
const loadingWialonObject = ref(false)
// Searchable selects
const statusSearch = useSearchableSelect(ref([]))

const hasCharacteristics = computed(() => {
  return (
    product.value?.characteristics &&
    Object.keys(product.value.characteristics).length > 0 &&
    Object.keys(product.value.characteristics)[0] !== 'none'
  )
})

const productCharacteristics = computed(() => {
  if (!hasCharacteristics.value) return []

  return Object.entries(product.value.characteristics)
    .map(([code, data]) => ({
      code,
      ...data,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Options
const statusOptions = [
  { label: t('products.statuses.in_stock'), value: 'in_stock' },
  { label: t('products.statuses.installed'), value: 'installed' },
  { label: t('products.statuses.in_repair'), value: 'in_repair' },
  { label: t('products.statuses.written_off'), value: 'written_off' },
]

// Columns
const movementsColumns = [
  {
    name: 'type',
    field: 'type',
    label: t('stock.type'),
    align: 'left',
  },
  {
    name: 'quantity',
    field: 'quantity',
    label: t('stock.quantity'),
    align: 'left',
  },
  {
    name: 'from_warehouse',
    field: 'from_warehouse_name',
    label: t('stock.fromWarehouse'),
    align: 'left',
  },
  {
    name: 'to_warehouse',
    field: 'to_warehouse_name',
    label: t('stock.toWarehouse'),
    align: 'left',
  },
  {
    name: 'created_by',
    field: 'created_by_name',
    label: t('stock.createdBy'),
    align: 'left',
  },
  {
    name: 'created_at',
    field: 'created_at',
    label: t('stock.createdAt'),
    align: 'left',
  },
]

// Методи
const getCharacteristicColor = (type) => {
  const colors = {
    string: 'blue',
    number: 'green',
    date: 'purple',
    boolean: 'orange',
    select: 'red',
  }
  return colors[type] || 'grey'
}

const formatCharacteristicValue = (char) => {
  if (!char.value) return '-'

  switch (char.type) {
    case 'boolean':
      return char.value === 'true' || char.value === true ? t('common.yes') : t('common.no')

    case 'date':
      return formatDate(char.value)

    case 'number':
      return Number(char.value).toLocaleString()

    default:
      return char.value
  }
}

const loadProduct = async () => {
  try {
    const response = await ProductsApi.getProduct(route.params.id)
    product.value = response.data.product

    await Promise.all([loadMovements(), loadCurrentLocation(), loadSupplierInfo()])

    // Перевіряємо потребу завантаження об'єкта Wialon
    if (product.value?.current_status === 'installed' && product.value?.current_object_id) {
      loadWialonObject()
    }
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

const loadMovements = async () => {
  loadingMovements.value = true
  try {
    const response = await ProductsApi.getProductMovements(route.params.id)
    movements.value = response.data.movements
  } catch (error) {
    console.error('Error loading movements:', error)
  } finally {
    loadingMovements.value = false
  }
}

const loadCurrentLocation = async () => {
  if (product.value?.current_status === 'in_stock') {
    try {
      const response = await ProductsApi.getCurrentLocation(route.params.id)
      currentLocation.value = response.data
    } catch (error) {
      console.error('Error loading location:', error)
    }
  }
}

// Нова функція для завантаження даних об'єкта Wialon
const loadWialonObject = async () => {
  if (!product.value?.current_object_id || product.value?.current_status !== 'installed') {
    return
  }

  loadingWialonObject.value = true
  wialonObject.value = null

  try {
    const response = await WialonApi.getObject(product.value.current_object_id)
    wialonObject.value = response.data.object
  } catch (error) {
    console.error("Помилка при завантаженні об'єкта Wialon:", error)
    $q.notify({
      color: 'warning',
      message: t('products.errorLoadingWialonObject'),
      icon: 'warning',
    })
  } finally {
    loadingWialonObject.value = false
  }
}

// Відстежуємо зміни ID об'єкта, щоб при зміні перезавантажити інформацію
watch(
  () => product.value?.current_object_id,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && product.value?.current_status === 'installed') {
      loadWialonObject()
    }
  },
)

const loadSupplierInfo = async () => {
  if (product.value?.supplier_id) {
    try {
      const response = await SuppliersApi.getSupplier(product.value.supplier_id)

      // Отримуємо об'єкт постачальника з відповіді
      const supplier = response.data.supplier

      // Копіюємо потрібні поля для відображення
      product.value.supplier_contact = supplier.contact_person || '-'
      product.value.supplier_phone = supplier.phone || '-'
      product.value.supplier_email = supplier.email || '-'
    } catch (error) {
      console.error('Помилка при завантаженні даних постачальника:', error)
    }
  }
}

const formatDate = (dateString) => {
  return dateString ? date.formatDate(dateString, 'DD.MM.YYYY') : '-'
}

const formatDateTime = (dateString) => {
  return dateString ? date.formatDate(dateString, 'DD.MM.YYYY HH:mm') : '-'
}

const getStatusColor = (status) => {
  const colors = {
    in_stock: 'positive',
    installed: 'info',
    in_repair: 'warning',
    written_off: 'negative',
  }
  return colors[status] || 'grey'
}

const openEditDialog = () => {
  showEditDialog.value = true
}

const updateStatus = async () => {
  updatingStatus.value = true
  try {
    await ProductsApi.updateStatus(product.value.id, {
      status: newStatus.value,
      object_id: objectId.value,
    })

    $q.notify({
      color: 'positive',
      message: t('products.statusUpdateSuccess'),
      icon: 'check',
    })

    showStatusDialog.value = false
    loadProduct()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.updating'),
      icon: 'error',
    })
  } finally {
    updatingStatus.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadProduct()
  statusSearch.initializeOptions(statusOptions)
})
</script>
