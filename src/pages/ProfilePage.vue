<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-center">{{ $t('pages.profile.title') }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- Зміна аватара -->
          <div class="q-mb-md text-center">
            <q-avatar size="100px">
              <img
                :src="avatarPreview || authStore.currentUser?.avatar || defaultAvatar"
                alt="avatar"
              />
            </q-avatar>
            <q-uploader
              v-model="avatar"
              class="q-mt-md"
              label="{{ $t('pages.profile.uploadAvatar') }}"
              accept="image/*"
              auto-upload="false"
              @added="onAvatarAdded"
            />
          </div>

          <!-- Зміна імені -->
          <q-input v-model="fullName" label="{{ $t('pages.profile.fullName') }}" outlined dense />

          <!-- Зміна пароля -->
          <q-input
            v-model="password"
            label="{{ $t('pages.profile.newPassword') }}"
            outlined
            dense
            type="password"
            class="q-mt-md"
          />

          <q-input
            v-model="confirmPassword"
            label="{{ $t('pages.profile.confirmPassword') }}"
            outlined
            dense
            type="password"
            class="q-mt-md"
          />

          <q-btn
            :label="$t('pages.profile.saveChanges')"
            color="primary"
            class="q-mt-lg"
            @click="saveProfile"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ProfilePage',
  setup() {
    const q = useQuasar()
    const { t } = useI18n()
    const authStore = useAuthStore()
    const fullName = ref(authStore.currentUser?.full_name || '')
    const password = ref('')
    const confirmPassword = ref('')
    const avatar = ref(null)
    const avatarPreview = ref(null)
    const defaultAvatar = 'https://cdn.quasar.dev/img/avatar.png'

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

    const saveProfile = async () => {
      if (password.value !== confirmPassword.value) {
        q.notify({
          type: 'negative',
          message: t('pages.profile.passwordMismatch'),
        })
        return
      }

      try {
        await authStore.updateProfile({
          full_name: fullName.value,
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

    return {
      authStore,
      fullName,
      password,
      confirmPassword,
      avatar,
      avatarPreview,
      defaultAvatar,
      onAvatarAdded,
      saveProfile,
    }
  },
}
</script>
