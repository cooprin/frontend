// src/components/dashboard/PieChart.vue
<template>
  <canvas ref="pieChartRef"></canvas>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
})

const { chartData } = toRefs(props)
const pieChartRef = ref(null)
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = pieChartRef.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'pie',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.raw
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0)
              const percentage = Math.round((value / total) * 100)

              return `${label}: ${new Intl.NumberFormat('uk-UA', {
                style: 'currency',
                currency: 'UAH',
              }).format(value)} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

onMounted(() => {
  if (chartData.value) {
    createChart()
  }
})

watch(
  chartData,
  () => {
    if (pieChartRef.value) {
      createChart()
    }
  },
  { deep: true },
)
</script>
