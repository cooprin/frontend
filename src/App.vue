<template>
  <router-view></router-view>
</template>

<script setup>
console.log('App component mounted') // для дебагу
watch: {
  $route(to) {
    document.title = to.meta.title || 'Назва за замовчуванням';
  }
}
</script>
