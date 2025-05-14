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

  // Обробляємо дані для теплової карти
  const labels = data.value.map((item) => item.product_type_name)
  const totalQuantity = data.value.reduce((sum, item) => sum + item.quantity, 0)

  // Обчислюємо відсоток від загальної кількості
  const percentages = data.value.map((item) => ({
    value: item.quantity,
    percentage: (item.quantity / totalQuantity) * 100,
  }))

  // Визначаємо кольори залежно від відсотка
  const getColorForPercentage = (percentage) => {
    // Зелений для низького відсотка, жовтий для середнього, червоний для високого
    const r = percentage < 30 ? 46 : percentage < 70 ? 241 : 231
    const g = percentage < 30 ? 204 : percentage < 70 ? 196 : 76
    const b = percentage < 30 ? 113 : percentage < 70 ? 15 : 60
    return `rgba(${r}, ${g}, ${b}, 0.7)`
  }

  const backgroundColors = percentages.map((item) => getColorForPercentage(item.percentage))
  const borderColors = backgroundColors.map((color) => color.replace('0.7', '1'))

  chart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: labels,
      datasets: [
        {
          data: percentages.map((item) => item.value),
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
              const value = context.raw
              const item = percentages[context.dataIndex]
              return [`Кількість: ${value}`, `Частка: ${item.percentage.toFixed(1)}%`]
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
