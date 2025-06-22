<template>
  <q-page class="column items-center justify-center">
    <div class="text-center">
      <div class="text-h1 text-weight-bold q-mb-md">404</div>
      <div class="text-h4 text-grey-7 q-mb-xl">{{ $t('pages.error.notFound') }}</div>
      <q-btn
        color="primary"
        :label="$t('pages.error.returnHome')"
        @click="goHome"
        icon="home"
        no-caps
        unelevated
        size="lg"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  if (authStore.isAuthenticated) {
    // Перенаправляємо на правильний dashboard залежно від типу користувача
    router.push(authStore.getDefaultRoute)
  } else {
    // Якщо не автентифікований - на логін
    router.push({ name: 'login' })
  }
}
</script>
