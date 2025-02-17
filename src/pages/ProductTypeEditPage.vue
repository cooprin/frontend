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
                :rules="[
                  (val) => !!val || $t('common.validation.required'),
                  (val) => /^[A-Z0-9_-]+$/.test(val) || $t('common.validation.codeFormat'),
                ]"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                @filter="filterFn"
                @input-value="updateCode"
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
            <q-btn
              color="primary"
              :label="$t('productTypes.addCharacteristic')"
              icon="add"
              @click="openCharacteristicDialog()"
            />
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

    <!-- Діалог характеристики -->
    <q-dialog v-model="showCharacteristicDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{
              selectedCharacteristic
                ? t('productTypes.editCharacteristic')
                : t('productTypes.addCharacteristic')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <characteristic-form
            v-model="characteristicForm"
            :product-type-id="route.params.id"
            :is-edit="!!selectedCharacteristic"
            :saving="savingCharacteristic"
            @submit="onCharacteristicSubmit"
            @cancel="showCharacteristicDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог підтвердження видалення характеристики -->
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
import { CharacteristicTypesApi } from 'src/api/characteristic-types'
import { PRODUCT_TYPE_CODES, DEFAULT_CHARACTERISTIC_VALIDATION } from 'src/constants/productTypes'
import CharacteristicsList from 'src/components/ProductTypes/CharacteristicsList.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

const productTypeCodes = computed(() => PRODUCT_TYPE_CODES.filter((code) => !code.disabled))

// State
const loading = ref(false)
const saving = ref(false)
const savingCharacteristic = ref(false)
const productType = ref(null)
const showCharacteristicDialog = ref(false)
const deleteCharacteristicDialog = ref(false)
const characteristicToDelete = ref(null)
const selectedCharacteristic = ref(null)

// Computed
const isEdit = computed(() => !!route.params.id)

const sortedCharacteristics = computed(() => {
  if (!productType.value?.characteristics) return []
  return [...productType.value.characteristics].sort((a, b) => a.ordering - b.ordering)
})

const filterFn = (val, update) => {
  update(() => {
    if (val === '') {
      productTypeCodes.value = PRODUCT_TYPE_CODES
    } else {
      const needle = val.toLowerCase()
      productTypeCodes.value = PRODUCT_TYPE_CODES.filter(
        (v) =>
          v.label.toLowerCase().indexOf(needle) > -1 ||
          v.value.toLowerCase().indexOf(needle) > -1 ||
          v.description.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const updateCode = (val) => {
  // Перетворюємо введений текст у верхній регістр і прибираємо недопустимі символи
  const formattedVal = val.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  form.value.code = formattedVal
}

const getCodeDescription = (code) => {
  const typeCode = PRODUCT_TYPE_CODES.find((t) => t.value === code)
  return typeCode ? typeCode.description : code
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

onMounted(() => {
  loadProductType()
})

// Default forms
const defaultForm = {
  name: '',
  code: '',
  description: '',
  is_active: true,
}

const defaultCharacteristicForm = {
  name: '',
  code: '',
  type: 'string',
  is_required: false,
  default_value: null,
  validation_rules: { ...DEFAULT_CHARACTERISTIC_VALIDATION.string },
  options: [],
  ordering: 0,
}

const form = ref({ ...defaultForm })
const characteristicForm = ref({ ...defaultCharacteristicForm })

// Methods for characteristics
const openCharacteristicDialog = (characteristic = null) => {
  if (characteristic) {
    characteristicForm.value = { ...characteristic }
    selectedCharacteristic.value = characteristic
  } else {
    characteristicForm.value = {
      ...defaultCharacteristicForm,
      ordering: productType.value?.characteristics?.length || 0,
    }
    selectedCharacteristic.value = null
  }
  showCharacteristicDialog.value = true
}

const onCharacteristicSubmit = async () => {
  savingCharacteristic.value = true
  try {
    if (selectedCharacteristic.value) {
      // Update
      await CharacteristicTypesApi.updateCharacteristic(
        route.params.id,
        selectedCharacteristic.value.id,
        characteristicForm.value,
      )
      $q.notify({
        color: 'positive',
        message: t('productTypes.characteristicUpdateSuccess'),
        icon: 'check',
      })
    } else {
      // Create
      await CharacteristicTypesApi.addCharacteristic(route.params.id, characteristicForm.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.characteristicCreateSuccess'),
        icon: 'check',
      })
    }
    showCharacteristicDialog.value = false
    loadProductType()
  } catch (error) {
    console.error('Error saving characteristic:', error)
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${selectedCharacteristic.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    savingCharacteristic.value = false
  }
}

const confirmDeleteCharacteristic = (characteristic) => {
  characteristicToDelete.value = characteristic
  deleteCharacteristicDialog.value = true
}

const deleteCharacteristic = async () => {
  try {
    await CharacteristicTypesApi.deleteCharacteristic(
      route.params.id,
      characteristicToDelete.value.id,
    )
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

const updateCharacteristicsOrder = async (newCharacteristics) => {
  try {
    await CharacteristicTypesApi.updateCharacteristicsOrder(route.params.id, newCharacteristics)
    loadProductType()
  } catch (error) {
    console.error('Error updating characteristics order:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.updating'),
      icon: 'error',
    })
  }
}
</script>
<style scoped>
.characteristics-section {
  transition: all 0.3s ease;
}

/* Стилі для світлої теми */
:deep(.q-table) thead tr {
  background: var(--q-primary);
}

:deep(.q-table) thead tr th {
  color: white !important;
  font-weight: 600 !important;
  padding: 8px 16px;
}

/* Стилі для темної теми */
.body--dark :deep(.q-table) thead tr {
  background: var(--q-dark);
}

.body--dark :deep(.q-table) thead tr th {
  color: white !important;
}

/* Стилі для границь */
:deep(.q-card) {
  transition: all 0.3s ease;
}

.body--dark :deep(.q-card) {
  background: var(--q-dark);
}
</style>
