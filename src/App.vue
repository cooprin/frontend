<template>
  <router-view></router-view>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Функція для оновлення назви вкладки
const updateTitle = (to) => {
  document.title = to.meta.title || 'Назва за замовчуванням';
};

// Встановлюємо назву при першому завантаженні
updateTitle(route);

// Спостерігаємо за змінами маршруту і оновлюємо назву
watch(route, (newRoute) => {
  updateTitle(newRoute);
});

// Дебаг: підтверджуємо, що компонент монтується
console.log('App component mounted');
</script>

<style>
/* Ваші стилі тут */
</style>
