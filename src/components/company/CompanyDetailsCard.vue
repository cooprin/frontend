<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">{{ $t('company.details.title') }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="saveCompanyDetails" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <!-- Логотип компанії -->
          <div class="col-12 col-md-4 flex flex-center column">
            <q-img
              :src="logoSrc"
              spinner-color="primary"
              style="height: 150px; max-width: 300px"
              fit="contain"
              @error="handleLogoError"
            />

            <div class="q-mt-md">
              <q-file
                v-model="logoFile"
                :label="$t('company.details.logo')"
                accept="image/*"
                outlined
                dense
                bottom-slots
              >
                <template v-slot:prepend>
                  <q-icon name="image" />
                </template>

                <template v-slot:append>
                  <q-icon
                    v-if="logoFile"
                    name="close"
                    @click.stop="logoFile = null"
                    class="cursor-pointer"
                  />
                </template>

                <template v-slot:after>
                  <div class="row q-gutter-sm">
                    <q-btn
                      :label="$t('company.details.uploadLogo')"
                      color="primary"
                      size="sm"
                      :disable="!logoFile"
                      @click="uploadLogo"
                      :loading="uploadingLogo"
                    />
                    <q-btn
                      :label="$t('company.details.removeLogo')"
                      color="grey"
                      size="sm"
                      :disable="!form.logo_path"
                      @click="removeLogo"
                    />
                  </div>
                </template>
              </q-file>
            </div>
          </div>

          <!-- Основні дані компанії -->
          <div class="col-12 col-md-8">
            <div class="row q-col-gutter-md">
              <!-- Юридична назва -->
              <div class="col-12">
                <q-input
                  v-model="form.legal_name"
                  :label="$t('company.details.legalName')"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  outlined
                  dense
                />
              </div>

              <!-- Коротка назва -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.short_name"
                  :label="$t('company.details.shortName')"
                  outlined
                  dense
                />
              </div>

              <!-- Організаційно-правова форма -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.legal_form"
                  :label="$t('company.details.legalForm')"
                  outlined
                  dense
                />
              </div>

              <!-- Код ЄДРПОУ -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.edrpou"
                  :label="$t('company.details.edrpou')"
                  outlined
                  dense
                />
              </div>

              <!-- ІПН -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.tax_number"
                  :label="$t('company.details.taxNumber')"
                  outlined
                  dense
                />
              </div>

              <!-- Юридична адреса -->
              <div class="col-12">
                <q-input
                  v-model="form.legal_address"
                  :label="$t('company.details.legalAddress')"
                  outlined
                  dense
                />
              </div>

              <!-- Фактична адреса -->
              <div class="col-12">
                <q-input
                  v-model="form.actual_address"
                  :label="$t('company.details.actualAddress')"
                  outlined
                  dense
                />
              </div>

              <!-- Телефон -->
              <div class="col-12 col-md-6">
                <q-input v-model="form.phone" :label="$t('company.details.phone')" outlined dense />
              </div>

              <!-- Email -->
              <div class="col-12 col-md-6">
                <q-input v-model="form.email" :label="$t('company.details.email')" outlined dense />
              </div>

              <!-- Веб-сайт -->
              <div class="col-12">
                <q-input
                  v-model="form.website"
                  :label="$t('company.details.website')"
                  outlined
                  dense
                />
              </div>

              <!-- Директор -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.director_name"
                  :label="$t('company.details.director')"
                  outlined
                  dense
                />
              </div>

              <!-- Посада директора -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.director_position"
                  :label="$t('company.details.directorPosition')"
                  outlined
                  dense
                />
              </div>

              <!-- Головний бухгалтер -->
              <div class="col-12">
                <q-input
                  v-model="form.accountant_name"
                  :label="$t('company.details.accountant')"
                  outlined
                  dense
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-end q-gutter-sm">
          <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { CompanyApi } from 'src/api/company'

const $q = useQuasar()
const { t } = useI18n()

// Стани
const form = ref({
  legal_name: '',
  short_name: '',
  legal_form: '',
  edrpou: '',
  tax_number: '',
  legal_address: '',
  actual_address: '',
  phone: '',
  email: '',
  website: '',
  director_name: '',
  director_position: '',
  accountant_name: '',
  logo_path: null,
})

const saving = ref(false)
const logoFile = ref(null)
const uploadingLogo = ref(false)

// Обчислюване значення для src логотипу
const logoSrc = computed(() => {
  if (!form.value.logo_path) {
    return 'https://cdn.quasar.dev/img/no-image.png'
  }
  return CompanyApi.getDocumentUrl(form.value.logo_path)
})

// Обробник помилки завантаження логотипу
const handleLogoError = () => {
  // Якщо не вдалося завантажити логотип, показуємо placeholder
  form.value.logo_path = null
}

// Методи
const loadCompanyDetails = async () => {
  try {
    const response = await CompanyApi.getCompanyDetails()
    if (response.data.organization) {
      form.value = {
        ...form.value,
        ...response.data.organization,
      }
    }
  } catch (error) {
    console.error('Error loading company details:', error)
  }
}

const saveCompanyDetails = async () => {
  saving.value = true
  try {
    await CompanyApi.saveCompanyDetails(form.value)
    $q.notify({
      color: 'positive',
      message: t('company.details.saveSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error saving company details:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const uploadLogo = async () => {
  if (!logoFile.value) return

  uploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('logo', logoFile.value)

    const response = await CompanyApi.uploadLogo(formData)
    form.value.logo_path = response.data.logo_path
    logoFile.value = null

    $q.notify({
      color: 'positive',
      message: t('company.details.logoUploadSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.uploading'),
      icon: 'error',
    })
  } finally {
    uploadingLogo.value = false
  }
}

const removeLogo = async () => {
  try {
    form.value.logo_path = null
    await CompanyApi.saveCompanyDetails({
      ...form.value,
      logo_path: null,
    })
    $q.notify({
      color: 'positive',
      message: t('company.details.saveSuccess'),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error removing logo:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  }
}

// Життєвий цикл
onMounted(() => {
  loadCompanyDetails()
})
</script>
