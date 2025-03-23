<template>
  <div class="chart-container">
    <BarChart :chart-data="chartData" :chart-options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BarChart } from 'vue-chart-3'
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
      backgroundColor: 'rgba(244, 67, 54, 0.6)',
      borderColor: '#f44336',
      borderWidth: 1,
    },
    {
      label: t('dashboard.paidAmount'),
      data: props.data.map((item) => item.paidAmount),
      backgroundColor: 'rgba(76, 175, 80, 0.6)',
      borderColor: '#4caf50',
      borderWidth: 1,
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
  height: 300px; /* Встановлена фіксована висота */
}
</style>
