<template>
  <q-page class="flex flex-center">
    <q-card class="profile-card">
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('pages.profile.title') }}</div>
      </q-card-section>

      <!-- Avatar Section -->
      <q-card-section>
        <div class="column justify-center items-center q-mb-md">
          <!-- Current Avatar -->
          <q-img
            v-if="user?.avatar_url && !avatarPreview"
            :src="getAvatarUrl"
            class="avatar-preview q-mb-md"
            style="border: 2px solid #ddd"
            alt="Current Avatar"
          />
          <!-- New Avatar Preview -->
          <q-img
            v-if="avatarPreview"
            :src="avatarPreview"
            class="avatar-preview q-mb-md"
            style="border: 2px dashed #666"
            alt="New Avatar Preview"
          />

          <div class="row justify-center items-center q-gutter-md">
            <q-file
              v-model="avatarFile"
              :label="$t('pages.profile.selectAvatar')"
              accept="image/*"
              @update:model-value="onAvatarAdded"
              style="max-width: 200px"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-btn
              color="primary"
              :loading="avatarLoading"
              @click="uploadAvatar"
              :disable="!avatarFile"
              class="q-ml-md"
            >
              {{ $t('pages.profile.uploadAvatar') }}
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <!-- Profile Information Form -->
      <q-card-section>
        <q-form @submit.prevent="onSubmitProfile" class="q-gutter-md">
          <!-- Email (readonly) -->
          <q-input v-model="user.email" label="Email" outlined dense readonly disable />

          <!-- Role (readonly) -->
          <q-input
            v-model="user.role_name"
            :label="$t('pages.profile.role')"
            outlined
            dense
            readonly
            disable
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
          </q-input>

          <!-- Editable fields -->
          <q-input
            v-model="profileData.firstName"
            :label="$t('pages.profile.firstName')"
            outlined
            dense
            :rules="[(val) => !!val || $t('pages.profile.required')]"
          />

          <q-input
            v-model="profileData.lastName"
            :label="$t('pages.profile.lastName')"
            outlined
            dense
            :rules="[(val) => !!val || $t('pages.profile.required')]"
          />

          <q-input
            v-model="profileData.phone"
            :label="$t('pages.profile.phone')"
            outlined
            dense
            mask="(###) ###-####"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>

          <div class="row justify-center">
            <q-btn
              :label="$t('pages.profile.saveChanges')"
              type="submit"
              color="primary"
              :loading="profileLoading"
              :disable="!hasProfileChanges"
            />
          </div>
        </q-form>
      </q-card-section>

      <!-- Password Change Form -->
      <q-card-section>
        <q-form @submit.prevent="onSubmitPassword" class="q-gutter-md">
          <div class="text-subtitle2 q-mb-md">{{ $t('pages.profile.changePassword') }}</div>

          <q-input
            v-model="passwordData.currentPassword"
            :label="$t('pages.profile.currentPassword')"
            type="password"
            outlined
            dense
            :rules="[(val) => !!val || $t('pages.profile.required')]"
          />
          <q-input
            v-model="passwordData.newPassword"
            :label="$t('pages.profile.newPassword')"
            type="password"
            outlined
            dense
            :rules="[
              (val) => !!val || $t('pages.profile.required'),
              (val) => val.length >= 8 || $t('pages.profile.passwordLength'),
            ]"
          />
          <q-input
            v-model="passwordData.confirmPassword"
            :label="$t('pages.profile.confirmPassword')"
            type="password"
            outlined
            dense
            :rules="[
              (val) => !!val || $t('pages.profile.required'),
              (val) => val === passwordData.value.newPassword || $t('pages.profile.passwordMatch'),
            ]"
          />

          <div class="row justify-center">
            <q-btn
              :label="$t('pages.profile.changePassword')"
              type="submit"
              color="secondary"
              :loading="passwordLoading"
              :disable="!canChangePassword"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'

const authStore = useAuthStore()
const q = useQuasar()
const { t } = useI18n()

// State management
const user = computed(() => authStore.user)
const avatarFile = ref(null)
const avatarPreview = ref(null)
const avatarLoading = ref(false)
const profileLoading = ref(false)
const passwordLoading = ref(false)

const getAvatarUrl = computed(() => {
  if (!authStore.user?.avatar_url) {
    return 'https://cdn.quasar.dev/img/avatar.png'
  }

  try {
    const avatarPath = authStore.user.avatar_url
    return `${process.env.API_URL}/${avatarPath}`
  } catch {
    return 'https://cdn.quasar.dev/img/avatar.png'
  }
})

// Profile data
const profileData = ref({
  firstName: user.value?.first_name || '',
  lastName: user.value?.last_name || '',
  phone: user.value?.phone || '',
})

// Password data
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Computed properties for validation
const hasProfileChanges = computed(() => {
  return (
    profileData.value.firstName !== user.value?.first_name ||
    profileData.value.lastName !== user.value?.last_name ||
    profileData.value.phone !== user.value?.phone
  )
})

const canChangePassword = computed(() => {
  return (
    passwordData.value.currentPassword &&
    passwordData.value.newPassword &&
    passwordData.value.confirmPassword &&
    passwordData.value.newPassword === passwordData.value.confirmPassword &&
    passwordData.value.newPassword.length >= 8
  )
})

// Avatar handling
const onAvatarAdded = (files) => {
  if (!files) {
    avatarPreview.value = null
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(files)
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return

  avatarLoading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)

    const response = await api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.success) {
      await authStore.fetchUser()
      avatarFile.value = null
      avatarPreview.value = null

      q.notify({
        type: 'positive',
        message: t('pages.profile.avatarSuccess'),
      })
    }
  } catch {
    q.notify({
      type: 'negative',
      message: t('pages.profile.avatarError'),
    })
  } finally {
    avatarLoading.value = false
  }
}

// Profile update handling
const onSubmitProfile = async () => {
  if (!hasProfileChanges.value) return

  profileLoading.value = true
  try {
    const response = await api.put('/user/update-profile', {
      first_name: profileData.value.firstName,
      last_name: profileData.value.lastName,
      phone: profileData.value.phone,
    })

    if (response.data.success) {
      await authStore.fetchUser()
      q.notify({
        type: 'positive',
        message: t('pages.profile.profileSuccess'),
      })
    }
  } catch {
    q.notify({
      type: 'negative',
      message: t('pages.profile.profileError'),
    })
  } finally {
    profileLoading.value = false
  }
}

// Password change handling
const onSubmitPassword = async () => {
  if (!canChangePassword.value) return

  passwordLoading.value = true
  try {
    const response = await api.put('/user/change-password', {
      current_password: passwordData.value.currentPassword,
      new_password: passwordData.value.newPassword,
    })

    if (response.data.success) {
      passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }

      q.notify({
        type: 'positive',
        message: t('pages.profile.passwordSuccess'),
      })
    }
  } catch {
    q.notify({
      type: 'negative',
      message: t('pages.profile.passwordError'),
    })
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped>
.profile-card {
  width: 100%;
  max-width: 400px;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.full-width {
  width: 100%;
}
</style>
