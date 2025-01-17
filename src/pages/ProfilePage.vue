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
            <q-avatar size="100px">
              <img
                :src="avatarPreview || authStore.user?.avatar_url || defaultAvatar"
                alt="avatar"
              />
            </q-avatar>
            <q-uploader
              v-model="avatar"
              :label="$t('pages.profile.uploadAvatar')"
              accept="image/*"
              auto-upload="false"
              @added="onAvatarAdded"
            />
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

const authStore = useAuthStore()
const q = useQuasar()
const { t } = useI18n()

// Оновлені поля
const firstName = ref(authStore.user?.first_name || '')
const lastName = ref(authStore.user?.last_name || '')
const password = ref('')
const confirmPassword = ref('')
const avatar = ref(null)
const avatarPreview = ref(null)
const defaultAvatar = 'https://cdn.quasar.dev/img/avatar.png'

// Завантаження аватара
const onAvatarAdded = (files) => {
  const file = files[0]
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
      avatar: avatar.value,
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
