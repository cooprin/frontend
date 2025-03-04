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

                  <!-- Телефон -->
                  <q-input v-model="form.phone" :label="t('clients.phone')" outlined />

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
                  />

                  <!-- Адреса -->
                  <q-input
                    v-model="form.address"
                    :label="t('clients.address')"
                    type="textarea"
                    outlined
                    autogrow
                  />

                  <!-- Опис -->
                  <q-input
                    v-model="form.description"
                    :label="t('clients.description')"
                    type="textarea"
                    outlined
                    autogrow
                  />

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
                  <!-- Wialon ID -->
                  <q-input v-model="form.wialon_id" :label="t('clients.wialonId')" outlined />

                  <!-- Wialon Username -->
                  <q-input
                    v-model="form.wialon_username"
                    :label="t('clients.wialonUsername')"
                    outlined
                  />
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)

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
    if (isEdit.value) {
      await ClientsApi.updateClient(props.editData.id, form.value)
      $q.notify({
        color: 'positive',
        message: t('clients.updateSuccess'),
        icon: 'check',
      })
    } else {
      await ClientsApi.createClient(form.value)
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
  () => props.editData,
  (newValue) => {
    if (newValue) {
      form.value = { ...defaultForm, ...newValue }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)
</script>
