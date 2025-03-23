<template>
  <div class="chart-container">
    <LineChart :chart-data="chartData" :chart-options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const { t } = useI18n()

// Налаштування для графіка
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grace: '5%', // Додаємо трохи простору зверху
      ticks: {
        callback: function (value) {
          return new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
        },
      },
      // Додаємо адаптивність
      adapters: {
        minmax: function (minmax) {
          return { min: minmax.min, max: minmax.max * 1.1 } // Додаємо 10% запасу зверху
        },
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH',
          }).format(context.raw)
        },
      },
    },
  },
}

// Підготовка даних для графіка
const chartData = computed(() => {
  const labels = props.data.map((item) => {
    // Формат "Місяць Рік"
    const monthNames = Array.from({ length: 12 }, (_, i) => t(`payments.months.${i + 1}`))
    return `${monthNames[item.month - 1]} ${item.year}`
  })

  const datasets = [
    {
      label: t('dashboard.overdueAmount'),
      data: props.data.map((item) => item.amount),
      borderColor: '#f44336',
      backgroundColor: 'rgba(244, 67, 54, 0.2)',
      tension: 0.4,
      fill: true,
    },
    {
      label: t('dashboard.paidAmount'),
      data: props.data.map((item) => item.paidAmount),
      borderColor: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      tension: 0.4,
      fill: true,
    },
  ]

  return {
    labels,
    datasets,
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
