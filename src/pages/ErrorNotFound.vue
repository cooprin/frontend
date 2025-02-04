<template>
  <q-page class="column items-center justify-center">
    <div class="text-center">
      <div class="text-h1 text-weight-bold q-mb-md">404</div>
      <div class="text-h4 text-grey-7 q-mb-xl">{{ $t('pages.error.notFound') }}</div>
      <q-btn
        color="primary"
        :label="$t('pages.error.returnHome')"
        :to="{ name: 'dashboard' }"
        icon="home"
        no-caps
        unelevated
        size="lg"
      />
    </div>
  </q-page>
</template>

<script setup>
// No setup needed
</script>
