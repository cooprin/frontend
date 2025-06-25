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
const { t, locale } = useI18n()
let chart = null

const getStatusColor = (status) => {
  const colors = {
    open: '#2196F3', // blue
    in_progress: '#FF9800', // orange
    waiting_client: '#FFC107', // amber
    resolved: '#4CAF50', // green
    closed: '#9E9E9E', // grey
    cancelled: '#F44336', // red
  }
  return colors[status] || '#9E9E9E'
}

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')

  const labels = data.value.map((item) => t(`tickets.statuses.${item.status}`))
  const chartData = data.value.map((item) => item.count)
  const backgroundColors = data.value.map((item) => getStatusColor(item.status))

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.raw
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0)
              const percentage = Math.round((value / total) * 100)

              return `${label}: ${value} (${percentage}%)`
            },
          },
        },
      },
      cutout: '60%',
      elements: {
        arc: {
          borderWidth: 2,
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

watch(
  data,
  () => {
    if (chartRef.value && data.value.length > 0) {
      createChart()
    }
  },
  { deep: true },
)

watch(locale, () => {
  if (chartRef.value && data.value.length > 0) {
    createChart()
  }
})
</script>
