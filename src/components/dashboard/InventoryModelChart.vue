<template>
  <canvas ref="chartRef"></canvas>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from 'vue'
import Chart from 'chart.js/auto'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const { data } = toRefs(props)
const chartRef = ref(null)
const { locale } = useI18n() // Не використовуємо t, щоб уникнути помилки ESLint
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')

  // Підготуємо дані для графіка
  const labels = data.value.map((item) => `${item.model_name} (${item.manufacturer_name})`)
  const quantities = data.value.map((item) => item.quantity)
  const backgroundColors = data.value.map((item) => {
    // Генеруємо кольори на основі типу продукту, щоб однакові типи мали схожі кольори
    // Для цього використаємо хеш-функцію для назви типу
    const hash = item.product_type_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue = (hash * 10) % 360
    return `hsla(${hue}, 70%, 60%, 0.7)`
  })

  const borderColors = backgroundColors.map((color) => color.replace('0.7', '1'))

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          data: quantities,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y', // Горизонтальні стовпчики для кращої читабельності
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Ховаємо легенду, бо вона не потрібна для одного набору даних
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const modelData = data.value[context.dataIndex]
              return [
                `Кількість: ${context.raw}`,
                `Тип: ${modelData.product_type_name}`,
                `Виробник: ${modelData.manufacturer_name}`,
              ]
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0, // Лише цілі числа
          },
        },
      },
    },
  })
}

onMounted(() => {
  if (data.value && data.value.length > 0) {
    createChart()
  }
})

// Наблюдаем за изменением данных
watch(
  data,
  () => {
    if (chartRef.value && data.value.length > 0) {
      createChart()
    }
  },
  { deep: true },
)

// Добавляем наблюдение за изменением языка
watch(locale, () => {
  if (chartRef.value && data.value.length > 0) {
    createChart()
  }
})
</script>
