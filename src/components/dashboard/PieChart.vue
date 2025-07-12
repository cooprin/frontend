<template>
  <canvas ref="pieChartRef"></canvas>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from 'vue'
import Chart from 'chart.js/auto'
import { useI18n } from 'vue-i18n' // Добавили импорт useI18n
import { useCurrency } from 'src/composables/useCurrency'

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
})

const { chartData } = toRefs(props)
const pieChartRef = ref(null)
const { locale } = useI18n() // Добавили получение locale
let chart = null
const { formatCurrency: formatCurrencyFromComposable } = useCurrency()

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

              return `${label}: ${formatCurrencyFromComposable(value)} (${percentage}%)`
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

// Наблюдаем за изменением данных
watch(
  chartData,
  () => {
    if (pieChartRef.value) {
      createChart()
    }
  },
  { deep: true },
)

// Добавляем наблюдение за изменением языка
watch(locale, () => {
  if (pieChartRef.value && chartData.value) {
    createChart()
  }
})
</script>
