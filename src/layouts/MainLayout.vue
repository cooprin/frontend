<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Хедер -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" />
        <q-toolbar-title>
          <div>My CRM App</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Основний вміст -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Футер -->
    <q-footer class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>© 2025 My CRM</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",
};
</script>

<style scoped>
/* Можна додати стилі для хедера і футера */
</style>
