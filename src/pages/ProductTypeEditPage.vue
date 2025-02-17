<template>
  <q-page padding>
    <!-- Заголовок з навігацією -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" :to="{ name: 'product-types' }" />
        <h5 class="q-mt-none q-mb-none">
          {{ isEdit ? productType?.name : t('productTypes.create') }}
        </h5>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Основна інформація -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">{{ $t('productTypes.info') }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Назва -->
              <q-input
                v-model="form.name"
                :label="$t('productTypes.name')"
                :rules="[(val) => !!val || $t('common.validation.required')]"
                :loading="loading"
                outlined
              />

              <!-- Код -->
              <q-select
                v-if="!isEdit"
                v-model="form.code"
                :options="productTypeCodes"
                :label="$t('productTypes.code')"
                :rules="[(val) => !!val || $t('common.validation.required')]"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
              >
                <template v-slot:option="{ opt, selected }">
                  <q-item v-bind="opt.props" :active="selected">
                    <q-item-section>
                      <q-item-label>{{ opt.label }}</q-item-label>
                      <q-item-label caption>{{ opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <div v-else class="row items-center q-gutter-sm">
                <q-chip square color="primary" text-color="white">
                  {{ form.code }}
                </q-chip>
                <span class="text-caption">{{ getCodeDescription(form.code) }}</span>
              </div>

              <!-- Опис -->
              <q-input
                v-model="form.description"
                :label="$t('productTypes.description')"
                type="textarea"
                outlined
                autogrow
              />

              <!-- Статус -->
              <div v-if="isEdit" class="q-mt-md">
                <q-toggle v-model="form.is_active" :label="$t('productTypes.isActive')" />
              </div>

              <div class="row justify-end q-mt-md">
                <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Характеристики -->

      <div class="col-12 col-md-8" v-if="isEdit">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">{{ $t('productTypes.characteristics') }}</div>
            <div class="row q-gutter-sm">
              <q-btn
                v-if="form.code && COMMON_CHARACTERISTICS[form.code]"
                :label="$t('productTypes.addDefaultCharacteristics')"
                color="secondary"
                flat
                @click="addDefaultCharacteristics"
              />
              <q-btn
                color="primary"
                :label="$t('productTypes.addCharacteristic')"
                icon="add"
                @click="openCharacteristicDialog"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="!sortedCharacteristics.length" class="text-center q-pa-md text-grey">
              {{ $t('productTypes.noCharacteristics') }}
            </div>

            <characteristics-list
              v-else
              :characteristics="sortedCharacteristics"
              @update="updateCharacteristicsOrder"
              @edit="openCharacteristicDialog"
              @delete="confirmDeleteCharacteristic"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Діалоги -->
    <characteristicDialog
      v-model="showCharacteristicDialog"
      :product-type-id="route.params.id"
      :characteristic="selectedCharacteristic"
      @saved="onCharacteristicSaved"
    />

    <q-dialog v-model="deleteCharacteristicDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('productTypes.deleteCharacteristicConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteCharacteristic"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ProductTypesApi } from 'src/api/product-types'
import { PRODUCT_TYPE_CODES, COMMON_CHARACTERISTICS } from 'src/constants/productTypes'
import characteristicDialog from 'components/ProductTypes/CharacteristicDialog.vue'
import CharacteristicsList from 'components/ProductTypes/CharacteristicsList.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const productType = ref(null)
const showCharacteristicDialog = ref(false)
const deleteCharacteristicDialog = ref(false)
const characteristicToDelete = ref(null)
const selectedCharacteristic = ref(null)

// Computed
const isEdit = computed(() => !!route.params.id)

const productTypeCodes = computed(() => PRODUCT_TYPE_CODES.filter((code) => !code.disabled))

const sortedCharacteristics = computed(() => {
  if (!productType.value?.characteristics) return []
  return [...productType.value.characteristics].sort((a, b) => a.ordering - b.ordering)
})

// Form
const defaultForm = {
  name: '',
  code: '',
  description: '',
  is_active: true,
}

const form = ref({ ...defaultForm })

// Methods
const getCodeDescription = (code) => {
  const typeCode = PRODUCT_TYPE_CODES.find((t) => t.value === code)
  return typeCode ? typeCode.description : code
}

const updateCharacteristicsOrder = async (newCharacteristics) => {
  try {
    await ProductTypesApi.updateCharacteristicsOrder(route.params.id, {
      characteristics: newCharacteristics,
    })
    await loadProductType()
  } catch (error) {
    console.error('Error updating characteristics order:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.updating'),
      icon: 'error',
    })
  }
}

const loadProductType = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const response = await ProductTypesApi.getProductType(route.params.id)
    productType.value = response.data.productType
    form.value = { ...response.data.productType }
  } catch (error) {
    console.error('Error loading product type:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await ProductTypesApi.updateProductType(route.params.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.updateSuccess'),
        icon: 'check',
      })
      loadProductType()
    } else {
      const response = await ProductTypesApi.createProductType(form.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.createSuccess'),
        icon: 'check',
      })
      router.push({
        name: 'product-type-edit',
        params: { id: response.data.productType.id },
      })
    }
  } catch (error) {
    console.error('Error saving product type:', error)
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const openCharacteristicDialog = (characteristic = null) => {
  selectedCharacteristic.value = characteristic
  showCharacteristicDialog.value = true
}

const onCharacteristicSaved = () => {
  loadProductType()
}

const confirmDeleteCharacteristic = (characteristic) => {
  characteristicToDelete.value = characteristic
  deleteCharacteristicDialog.value = true
}

const deleteCharacteristic = async () => {
  try {
    await ProductTypesApi.deleteCharacteristic(route.params.id, characteristicToDelete.value.id)
    $q.notify({
      color: 'positive',
      message: t('productTypes.characteristicDeleteSuccess'),
      icon: 'check',
    })
    loadProductType()
  } catch (error) {
    console.error('Error deleting characteristic:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

const addDefaultCharacteristics = async () => {
  try {
    const defaultChars = COMMON_CHARACTERISTICS[form.value.code] || []
    for (const char of defaultChars) {
      if (!productType.value.characteristics.find((c) => c.code === char.code)) {
        await ProductTypesApi.addCharacteristic(route.params.id, {
          ...char,
          ordering: productType.value.characteristics.length,
        })
      }
    }
    loadProductType()
    $q.notify({
      color: 'positive',
      message: t('productTypes.defaultCharacteristicsAdded'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error adding default characteristics:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.creating'),
      icon: 'error',
    })
  }
}

onMounted(() => {
  loadProductType()
})
</script>

<style scoped>
.characteristic-card {
  transition: all 0.2s ease-in-out;
}

.characteristic-card:hover {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

/* Стилі для темної теми */
.body--dark .characteristic-card:hover {
  box-shadow: 0 1px 5px rgba(255, 255, 255, 0.2);
}

/* Додаткові стилі для чіпів */
:deep(.q-chip) {
  font-weight: 500;
}

:deep(.q-chip--outline) {
  border-width: 1px;
}
</style>
