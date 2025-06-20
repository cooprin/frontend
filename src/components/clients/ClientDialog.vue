<template>
  <q-dialog
    v-model="show"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? t('clients.edit') : t('clients.create') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Ліва колонка - основна інформація -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">{{ $t('clients.tabs.info') }}</div>
                </q-card-section>

                <q-card-section class="q-gutter-md">
                  <!-- Назва -->
                  <q-input
                    v-model="form.name"
                    :label="t('clients.name')"
                    :rules="[(val) => !!val || t('common.validation.required')]"
                    outlined
                    autofocus
                  />

                  <!-- Повна назва -->
                  <q-input v-model="form.full_name" :label="t('clients.fullName')" outlined />

                  <!-- Контактна особа -->
                  <q-input
                    v-model="form.contact_person"
                    :label="t('clients.contactPerson')"
                    outlined
                  />

                  <!-- Телефон (модифікований) -->
                  <div class="row q-col-gutter-sm">
                    <div class="col-4">
                      <q-select
                        v-model="selectedCountryCode"
                        :options="countryCodes"
                        option-label="country"
                        option-value="code"
                        :label="$t('clients.countryCode')"
                        outlined
                        dense
                        emit-value
                        map-options
                        class="country-select"
                      >
                        <template v-slot:option="{ opt }">
                          <q-item>
                            <q-item-section>
                              <q-item-label>{{ opt.country }}</q-item-label>
                              <q-item-label caption>{{ opt.code }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>

                        <template v-slot:selected>
                          <div class="row no-wrap">
                            <div class="text-subtitle2">{{ selectedCountryCode }}</div>
                          </div>
                        </template>
                      </q-select>
                    </div>
                    <div class="col-8">
                      <q-input
                        v-model="phoneNumber"
                        :label="t('clients.phone')"
                        outlined
                        dense
                        :mask="selectedCountryMask"
                        unmasked-value
                      >
                        <template v-slot:prepend>
                          <q-icon name="phone" />
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <!-- Email -->
                  <q-input
                    v-model="form.email"
                    :label="t('clients.email')"
                    :rules="[
                      (val) =>
                        !val ||
                        /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                          val,
                        ) ||
                        t('common.validation.pattern'),
                    ]"
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input>

                  <!-- Адреса -->
                  <q-input
                    v-model="form.address"
                    :label="t('clients.address')"
                    type="textarea"
                    outlined
                    autogrow
                  >
                    <template v-slot:prepend>
                      <q-icon name="place" />
                    </template>
                  </q-input>

                  <!-- Опис -->
                  <q-input
                    v-model="form.description"
                    :label="t('clients.description')"
                    type="textarea"
                    outlined
                    autogrow
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                  </q-input>

                  <!-- Активний -->
                  <q-toggle v-model="form.is_active" :label="t('clients.isActive')" />
                </q-card-section>
              </q-card>
            </div>

            <!-- Права колонка - Wialon інформація -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Wialon</div>
                </q-card-section>

                <q-card-section class="q-gutter-md">
                  <!-- Wialon Resource ID -->
                  <q-input
                    v-model="form.wialon_resource_id"
                    :label="t('clients.wialonResourceId')"
                    outlined
                    :rules="[
                      (val) =>
                        !val ||
                        /^\d+$/.test(val) ||
                        t('clients.validation.wialonResourceIdNumeric'),
                    ]"
                    hint="ID ресурсу для біллінгу в Wialon"
                  >
                    <template v-slot:prepend>
                      <q-icon name="credit_card" />
                    </template>
                  </q-input>

                  <!-- Wialon User ID -->
                  <q-input
                    v-model="form.wialon_id"
                    :label="t('clients.wialonId')"
                    outlined
                    :rules="[
                      (val) => !val || /^\d+$/.test(val) || t('clients.validation.wialonIdNumeric'),
                    ]"
                    hint="User ID для авторизації в Wialon"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>

                  <!-- Wialon Username -->
                  <q-input
                    v-model="form.wialon_username"
                    :label="t('clients.wialonUsername')"
                    outlined
                    hint="Ім'я користувача в Wialon"
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_circle" />
                    </template>
                  </q-input>

                  <!-- Інформація про поля -->
                  <q-banner dense rounded class="bg-blue-1 text-blue-9">
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue" />
                    </template>
                    <div class="text-caption">
                      <div><strong>Resource ID:</strong> для роботи з біллінгом</div>
                      <div><strong>User ID:</strong> для авторизації користувача</div>
                      <div><strong>Username:</strong> логін користувача</div>
                    </div>
                  </q-banner>
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
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ClientsApi } from 'src/api/clients'
import { countryCodes, getPhoneWithoutCode, formatPhoneWithCode } from 'src/constants/countryCodes'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
  initialData: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)

// Phone variables
const selectedCountryCode = ref('+380')
const phoneNumber = ref('')

const selectedCountryMask = computed(() => {
  const country = countryCodes.find((c) => c.code === selectedCountryCode.value)
  return country ? country.mask : ''
})

// Default form
const defaultForm = {
  name: '',
  full_name: '',
  description: '',
  address: '',
  contact_person: '',
  phone: '',
  email: '',
  wialon_id: '',
  wialon_resource_id: '',
  wialon_username: '',
  is_active: true,
}

const form = ref({ ...defaultForm })

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.editData)

// Methods
const onSubmit = async () => {
  loading.value = true
  try {
    // Збираємо номер телефону з коду країни та номера
    const formData = {
      ...form.value,
      phone: formatPhoneWithCode(phoneNumber.value, selectedCountryCode.value),
    }

    if (isEdit.value) {
      await ClientsApi.updateClient(props.editData.id, formData)
      $q.notify({
        color: 'positive',
        message: t('clients.updateSuccess'),
        icon: 'check',
      })
    } else {
      await ClientsApi.createClient(formData)
      $q.notify({
        color: 'positive',
        message: t('clients.createSuccess'),
        icon: 'check',
      })
    }
    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error saving client:', error)
    $q.notify({
      color: 'negative',
      message:
        error.response?.data?.message ||
        t(`common.errors.${isEdit.value ? 'updating' : 'creating'}`),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Відстеження змін
watch(
  () => [props.editData, props.initialData],
  ([newEditData, newInitialData]) => {
    if (newEditData) {
      // Режим редагування
      form.value = { ...defaultForm, ...newEditData }

      const phone = newEditData.phone || ''
      const countryCode = countryCodes.find((c) => phone.startsWith(c.code))
      selectedCountryCode.value = countryCode?.code || '+380'
      phoneNumber.value = getPhoneWithoutCode(phone)
    } else if (newInitialData) {
      // Режим створення з початковими даними
      form.value = { ...defaultForm, ...newInitialData }

      const phone = newInitialData.phone || ''
      const countryCode = countryCodes.find((c) => phone.startsWith(c.code))
      selectedCountryCode.value = countryCode?.code || '+380'
      phoneNumber.value = getPhoneWithoutCode(phone)
    } else {
      // Режим створення без даних
      form.value = { ...defaultForm }
      selectedCountryCode.value = '+380'
      phoneNumber.value = ''
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.country-select {
  min-width: 120px;
}

:deep(.q-field__native > span) {
  opacity: 1 !important;
}

:deep(.q-select__dropdown-icon) {
  margin-left: 4px;
}

:deep(.q-field__prefix) {
  padding-right: 6px;
}
</style>
