<template>
  <router-view></router-view>
</template>

<script setup>
import { watch } from 'vue'; // Імпортуємо watch
import { useRoute } from 'vue-router'; // Отримуємо поточний маршрут

const route = useRoute(); // Підключаємо Vue Router

// Спостерігаємо за змінами маршруту
watch(
  () => route.meta.title, // Відстежуємо зміни в meta.title
  (newTitle) => {
    document.title = newTitle || 'CRM for You (Cooprin)'; // Встановлюємо назву вкладки
  },
);
//for test
// Для першого завантаження сторінки
document.title = route.meta.title || 'CRM for You (Cooprin)';

console.log('App component mounted');
</script>
