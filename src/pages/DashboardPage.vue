<template>
  <q-page padding>
    <h5>{{ $t('pages.DashboardPage.hello') }}, {{ authStore.currentUser?.full_name }}!</h5>
    <!-- Тут буде контент дашборду -->
  </q-page>
</template>

<script setup>
import { useAuthStore } from 'stores/auth'

const authStore = useAuthStore()
</script>
