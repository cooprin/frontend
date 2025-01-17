<template>
  <q-page class="flex flex-center">
    <q-card class="profile-card">
      <q-card-section>
        <div class="text-h6 text-center">{{ $t('pages.profile.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <!-- Зміна аватара -->
          <div class="row justify-center items-center q-mb-md">
            <q-img
              v-if="avatarPreview || user?.avatar"
              :src="avatarPreview || `${api.defaults.baseURL}${user.avatar}`"
              class="avatar-preview"
            />

            <q-file
              v-model="avatarFile"
              label="Виберіть аватар"
              accept="image/*"
              @update:model-value="onAvatarAdded"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-btn color="primary" :loading="loading" @click="uploadAvatar" :disable="!avatarFile">
              Завантажити
            </q-btn>
          </div>

          <!-- Зміна імені -->
          <q-input v-model="firstName" :label="$t('pages.profile.firstName')" outlined dense />
          <q-input v-model="lastName" :label="$t('pages.profile.lastName')" outlined dense />

          <!-- Зміна пароля -->
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
            class="q-mt-lg"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'

const authStore = useAuthStore()
const q = useQuasar()
const { t } = useI18n()

// Оновлені поля
const firstName = ref(authStore.user?.first_name || '')
const lastName = ref(authStore.user?.last_name || '')
const password = ref('')
const confirmPassword = ref('')
const avatarFile = ref(null)
const avatarPreview = ref(null)
const loading = ref(false)

const onAvatarAdded = (files) => {
  const file = files[0] // Вибираємо перший файл
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Збереження профілю
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
      avatar: avatarFile.value, // передаємо avatarFile
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
.q-avatar {
  margin: auto;
}
</style>
