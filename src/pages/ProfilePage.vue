<template>
  <q-page class="flex flex-center">
    <q-card class="profile-card">
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('pages.profile.title') }}</div>
      </q-card-section>

      <!-- Avatar Section -->
      <q-card-section>
        <div class="column justify-center items-center q-mb-md">
          <!-- Old Avatar -->
          <q-img
            v-if="user?.avatar && !avatarPreview"
            :src="`${api.defaults.baseURL}${user.avatar}`"
            class="avatar-preview q-mb-md"
            style="border: 2px solid #ddd"
            alt="Old Avatar"
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
          <q-input
            v-model="profileData.firstName"
            :label="$t('pages.profile.firstName')"
            outlined
            dense
          />
          <q-input
            v-model="profileData.lastName"
            :label="$t('pages.profile.lastName')"
            outlined
            dense
          />

          <q-btn
            :label="$t('pages.profile.saveChanges')"
            type="submit"
            color="primary"
            :loading="profileLoading"
            :disable="!hasProfileChanges"
            class="full-width"
          />
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
          />
          <q-input
            v-model="passwordData.newPassword"
            :label="$t('pages.profile.newPassword')"
            type="password"
            outlined
            dense
          />
          <q-input
            v-model="passwordData.confirmPassword"
            :label="$t('pages.profile.confirmPassword')"
            type="password"
            outlined
            dense
          />

          <q-btn
            :label="$t('pages.profile.changePassword')"
            type="submit"
            color="secondary"
            :loading="passwordLoading"
            :disable="!canChangePassword"
            class="full-width"
          />
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

// Profile data
const profileData = ref({
  firstName: user.value?.first_name || '',
  lastName: user.value?.last_name || '',
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
    profileData.value.lastName !== user.value?.last_name
  )
})

const canChangePassword = computed(() => {
  return (
    passwordData.value.currentPassword &&
    passwordData.value.newPassword &&
    passwordData.value.confirmPassword &&
    passwordData.value.newPassword === passwordData.value.confirmPassword
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
