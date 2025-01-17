<template>
  <q-page class="flex flex-center">
    <q-card class="profile-card">
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('pages.profile.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <!-- Avatar Section -->
          <div class="row justify-center items-center q-mb-md column">
            <!-- Avatar Preview -->
            <q-img
              v-if="avatarPreview || user?.avatar"
              :src="avatarPreview || `${api.defaults.baseURL}${user.avatar}`"
              class="avatar-preview q-mb-md"
              style="width: 150px; height: 150px; border-radius: 50%"
            />

            <div class="row items-center q-gutter-md">
              <q-file
                v-model="avatarFile"
                label="Виберіть аватар"
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
                :loading="loading"
                @click="uploadAvatar"
                :disable="!avatarFile"
              >
                Завантажити
              </q-btn>
            </div>
          </div>

          <!-- Profile Fields -->
          <q-input v-model="firstName" :label="$t('pages.profile.firstName')" outlined dense />
          <q-input v-model="lastName" :label="$t('pages.profile.lastName')" outlined dense />

          <!-- Password Fields -->
          <q-input
            v-model="password"
            :label="$t('pages.profile.newPassword')"
            type="password"
            outlined
            dense
          />
          <q-input
            v-model="confirmPassword"
            :label="$t('pages.profile.confirmPassword')"
            type="password"
            outlined
            dense
          />

          <q-btn
            :label="t('pages.profile.saveChanges')"
            type="submit"
            color="primary"
            :loading="authStore.loading"
            class="q-mt-lg full-width"
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

// User data
const user = computed(() => authStore.user)
const firstName = ref(user.value?.first_name || '')
const lastName = ref(user.value?.last_name || '')
const password = ref('')
const confirmPassword = ref('')
const avatarFile = ref(null)
const avatarPreview = ref(null)
const loading = ref(false)

const onAvatarAdded = (files) => {
  if (!files) {
    avatarPreview.value = null
    return
  }

  const file = files
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)

    await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    q.notify({
      type: 'positive',
      message: t('pages.profile.avatarSuccess'),
    })

    // Update user data after successful upload
    await authStore.fetchUser()
  } catch {
    q.notify({
      type: 'negative',
      message: t('pages.profile.avatarError'),
    })
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    q.notify({
      type: 'negative',
      message: t('pages.profile.passwordMismatch'),
    })
    return
  }

  try {
    await authStore.updateProfile({
      first_name: firstName.value,
      last_name: lastName.value,
      password: password.value,
    })

    q.notify({
      type: 'positive',
      message: t('pages.profile.success'),
    })
  } catch {
    q.notify({
      type: 'negative',
      message: t('pages.profile.error'),
    })
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

.q-avatar {
  margin: auto;
}
</style>
