<template>
  <q-page padding class="flex flex-center column">
    <div class="text-h2 text-weight-bold q-mb-md">404</div>
    <div class="text-h5 text-grey q-mb-xl">{{ $t('pages.error.notFound') }}</div>
    <q-btn color="primary" :label="$t('pages.error.returnHome')" to="/" icon="home" />
  </q-page>
</template>

<script setup>
// компонент не потребує логіки
</script>
