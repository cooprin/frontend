<template>
  <q-page padding>
    <!-- Заголовок з навігацією -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" :to="{ name: 'product-types' }" />
        <h5 class="q-mt-none q-mb-none">{{ productType?.name }}</h5>
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
                outlined
              />

              <!-- Код -->
              <q-input
                v-model="form.code"
                :label="$t('productTypes.code')"
                :rules="[
                  (val) => !!val || $t('common.validation.required'),
                  (val) => /^[a-zA-Z0-9_-]+$/.test(val) || $t('common.validation.codeFormat'),
                ]"
                outlined
                :disable="isEdit"
              />

              <!-- Опис -->
              <q-input
                v-model="form.description"
                :label="$t('productTypes.description')"
                type="textarea"
                outlined
              />

              <!-- Статус -->
              <q-toggle v-model="form.is_active" :label="$t('productTypes.isActive')" />

              <div class="row justify-end">
                <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Характеристики -->
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">{{ $t('productTypes.characteristics') }}</div>
            <q-btn
              color="primary"
              :label="$t('productTypes.addCharacteristic')"
              icon="add"
              @click="openCharacteristicDialog"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="!productType?.characteristics?.length" class="text-center q-pa-md text-grey">
              {{ $t('productTypes.noCharacteristics') }}
            </div>

            <div v-else class="q-gutter-md">
              <q-card v-for="char in sortedCharacteristics" :key="char.id" flat bordered>
                <q-card-section>
                  <div class="row items-center justify-between">
                    <div>
                      <div class="text-h6">{{ char.name }}</div>
                      <div class="text-caption">{{ char.code }}</div>
                    </div>
                    <div class="row q-gutter-sm">
                      <q-btn
                        color="warning"
                        icon="edit"
                        flat
                        round
                        dense
                        @click="openCharacteristicDialog(char)"
                      >
                        <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="!char.usage_count"
                        color="negative"
                        icon="delete"
                        flat
                        round
                        dense
                        @click="confirmDeleteCharacteristic(char)"
                      >
                        <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                      </q-btn>
                    </div>
                  </div>

                  <q-chip
                    :color="getCharacteristicColor(char.type)"
                    text-color="white"
                    class="q-mt-sm"
                  >
                    {{ $t(`productTypes.characteristicTypes.${char.type}`) }}
                  </q-chip>

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-12 col-sm-6" v-if="char.is_required">
                      <q-badge color="negative">
                        {{ $t('productTypes.required') }}
                      </q-badge>
                    </div>

                    <div class="col-12 col-sm-6" v-if="char.default_value">
                      <div class="text-caption">{{ $t('productTypes.defaultValue') }}</div>
                      <div>{{ char.default_value }}</div>
                    </div>

                    <div class="col-12" v-if="char.type === 'select' && char.options?.length">
                      <div class="text-caption">{{ $t('productTypes.options') }}</div>
                      <div class="row q-gutter-x-sm">
                        <q-chip
                          v-for="option in char.options"
                          :key="option"
                          color="grey-3"
                          text-color="black"
                          dense
                        >
                          {{ option }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
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
              isEditCharacteristic
                ? $t('productTypes.editCharacteristic')
                : $t('productTypes.addCharacteristic')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onCharacteristicSubmit" class="q-gutter-md">
            <!-- Назва -->
            <q-input
              v-model="characteristicForm.name"
              :label="$t('productTypes.characteristicName')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
            />

            <!-- Код -->
            <q-input
              v-model="characteristicForm.code"
              :label="$t('productTypes.characteristicCode')"
              :rules="[
                (val) => !!val || $t('common.validation.required'),
                (val) => /^[a-zA-Z0-9_-]+$/.test(val) || $t('common.validation.codeFormat'),
              ]"
              outlined
              :disable="isEditCharacteristic"
            />

            <!-- Тип -->
            <q-select
              v-model="characteristicForm.type"
              :options="characteristicTypes"
              :label="$t('productTypes.characteristicType')"
              :rules="[(val) => !!val || $t('common.validation.required')]"
              outlined
              emit-value
              map-options
            />

            <!-- Обов'язкове -->
            <q-toggle
              v-model="characteristicForm.is_required"
              :label="$t('productTypes.characteristicRequired')"
            />

            <!-- Значення за замовчуванням -->
            <q-input
              v-model="characteristicForm.default_value"
              :label="$t('productTypes.characteristicDefaultValue')"
              outlined
            />

            <!-- Опції для типу select -->
            <template v-if="characteristicForm.type === 'select'">
              <div class="text-caption q-mb-sm">{{ $t('productTypes.characteristicOptions') }}</div>
              <div
                v-for="(option, index) in characteristicForm.options"
                :key="index"
                class="row q-gutter-sm q-mb-sm"
              >
                <q-input
                  v-model="characteristicForm.options[index]"
                  dense
                  outlined
                  class="col"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                />
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  color="negative"
                  @click="removeOption(index)"
                />
              </div>
              <q-btn
                :label="$t('productTypes.addOption')"
                color="primary"
                flat
                @click="addOption"
              />
            </template>

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn
                :label="$t('common.save')"
                color="primary"
                type="submit"
                :loading="savingCharacteristic"
              />
            </div>
          </q-form>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ProductTypesApi } from 'src/api/product-types'

const route = useRoute()
const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const savingCharacteristic = ref(false)
const productType = ref(null)
const showCharacteristicDialog = ref(false)
const deleteCharacteristicDialog = ref(false)
const characteristicToDelete = ref(null)
const isEdit = computed(() => !!route.params.id)
const isEditCharacteristic = ref(false)

// Form
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
  default_value: '',
  options: [],
  ordering: 0,
}

const form = ref({ ...defaultForm })
const characteristicForm = ref({ ...defaultCharacteristicForm })

// Options
const characteristicTypes = [
  { label: t('productTypes.characteristicTypes.string'), value: 'string' },
  { label: t('productTypes.characteristicTypes.number'), value: 'number' },
  { label: t('productTypes.characteristicTypes.date'), value: 'date' },
  { label: t('productTypes.characteristicTypes.boolean'), value: 'boolean' },
  { label: t('productTypes.characteristicTypes.select'), value: 'select' },
]

// Computed
const sortedCharacteristics = computed(() => {
  if (!productType.value?.characteristics) return []
  return [...productType.value.characteristics].sort((a, b) => a.ordering - b.ordering)
})

// Methods
const loadProductType = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const response = await ProductTypesApi.getProductType(route.params.id)
    productType.value = response.data.productType
    form.value = { ...response.data.productType }
  } catch {
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
    } else {
      await ProductTypesApi.createProductType(form.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.createSuccess'),
        icon: 'check',
      })
    }
    loadProductType()
  } catch {
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

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

const openCharacteristicDialog = (characteristic = null) => {
  if (characteristic) {
    isEditCharacteristic.value = true
    characteristicForm.value = { ...characteristic }
  } else {
    isEditCharacteristic.value = false
    characteristicForm.value = {
      ...defaultCharacteristicForm,
      ordering: productType.value?.characteristics?.length || 0,
    }
  }
  showCharacteristicDialog.value = true
}

const addOption = () => {
  if (!characteristicForm.value.options) {
    characteristicForm.value.options = []
  }
  characteristicForm.value.options.push('')
}

const removeOption = (index) => {
  characteristicForm.value.options.splice(index, 1)
}

const onCharacteristicSubmit = async () => {
  savingCharacteristic.value = true
  try {
    if (isEditCharacteristic.value) {
      await ProductTypesApi.updateCharacteristic(
        route.params.id,
        characteristicForm.value.id,
        characteristicForm.value,
      )
      $q.notify({
        color: 'positive',
        message: t('productTypes.characteristicUpdateSuccess'),
        icon: 'check',
      })
    } else {
      await ProductTypesApi.addCharacteristic(route.params.id, characteristicForm.value)
      $q.notify({
        color: 'positive',
        message: t('productTypes.characteristicCreateSuccess'),
        icon: 'check',
      })
    }
    showCharacteristicDialog.value = false
    loadProductType()
  } catch {
    $q.notify({
      color: 'negative',
      message: t(`common.errors.${isEditCharacteristic.value ? 'updating' : 'creating'}`),
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
    await ProductTypesApi.deleteCharacteristic(route.params.id, characteristicToDelete.value.id)
    $q.notify({
      color: 'positive',
      message: t('productTypes.characteristicDeleteSuccess'),
      icon: 'check',
    })
    loadProductType()
  } catch {
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

onMounted(() => {
  loadProductType()
})
</script>
