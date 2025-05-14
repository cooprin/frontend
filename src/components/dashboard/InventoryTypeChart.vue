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
const { locale } = useI18n()
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')

  const labels = data.value.map((item) => item.product_type_name)
  const quantities = data.value.map((item) => item.quantity)

  // Генеруємо різні кольори для кожного типу продукту
  const backgroundColors = data.value.map((_, index) => {
    const hue = (index * 137) % 360 // Золотий перетин для різноманітності кольорів
    return `hsla(${hue}, 70%, 60%, 0.7)`
  })

  const borderColors = data.value.map((_, index) => {
    const hue = (index * 137) % 360
    return `hsla(${hue}, 70%, 60%, 1)`
  })

  chart = new Chart(ctx, {
    type: 'pie',
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
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.raw
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0)
              const percentage = Math.round((value / total) * 100)
              return `${label}: ${value} (${percentage}%)`
            },
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
