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

  // Підготуємо дані для графіка
  const labels = data.value.map((item) => item.product_type_name)
  const quantities = data.value.map((item) => item.total_quantity)

  // Генеруємо кольори для кожного типу
  const backgroundColors = data.value.map((item, index) => {
    const hue = (index * 137.5) % 360 // Golden angle for better color distribution
    return `hsla(${hue}, 70%, 60%, 0.7)`
  })

  const borderColors = backgroundColors.map((color) => color.replace('0.7', '1'))

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: quantities,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.raw / total) * 100).toFixed(1)
              return `${context.label}: ${context.raw} (${percentage}%)`
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

// Спостерігаємо за зміною даних
watch(
  data,
  () => {
    if (chartRef.value && data.value.length > 0) {
      createChart()
    }
  },
  { deep: true },
)

// Додаємо спостереження за зміною мови
watch(locale, () => {
  if (chartRef.value && data.value.length > 0) {
    createChart()
  }
})
</script>
