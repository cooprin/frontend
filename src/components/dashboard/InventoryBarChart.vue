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

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')

  const labels = data.value.map((item) => item.warehouse_name)

  // Створимо три набори даних для різних діапазонів кількості
  const lowStockData = data.value.map((item) => item.low_stock_count || 0)
  const mediumStockData = data.value.map((item) => item.medium_stock_count || 0)
  const highStockData = data.value.map((item) => item.high_stock_count || 0)

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: t('dashboard.metrics.lowStockItems'),
          data: lowStockData,
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: 'rgba(231, 76, 60, 1)',
          borderWidth: 1,
        },
        {
          label: t('dashboard.metrics.mediumStockItems'),
          data: mediumStockData,
          backgroundColor: 'rgba(241, 196, 15, 0.7)',
          borderColor: 'rgba(241, 196, 15, 1)',
          borderWidth: 1,
        },
        {
          label: '> 10',
          data: highStockData,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: 'rgba(46, 204, 113, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            precision: 0, // Лише цілі числа
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ' + context.raw
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
