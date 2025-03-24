<template>
  <div class="chart-container">
    <LineChart :chart-data="chartData" :chart-options="chartOptions" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
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

// Логування даних для відлагодження
onMounted(() => {
  console.log('OverdueChart data:', props.data)
})

// Налаштування для графіка
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      bottom: 20,
      left: 15,
      right: 15,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grace: '5%',
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
    },
    x: {
      grid: {
        display: false, // Прибираємо вертикальні лінії сітки
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 15,
        padding: 10,
        usePointStyle: true, // Використовуємо стиль точок для легенди
        pointStyle: 'circle', // Круглі точки
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false, // Показувати підказку навіть без прямого перетину з точкою
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          return (
            label +
            new Intl.NumberFormat('uk-UA', {
              style: 'currency',
              currency: 'UAH',
            }).format(context.raw)
          )
        },
      },
    },
  },
  elements: {
    line: {
      tension: 0.4, // Невелике згладжування ліній
    },
    point: {
      radius: 5, // Розмір точок
      hoverRadius: 7, // Розмір точок при наведенні
      hitRadius: 10, // Область для визначення наведення
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
}))

// Підготовка даних для графіка
const chartData = computed(() => {
  // Перевірка наявності даних
  if (!props.data || props.data.length === 0) {
    console.warn('No data for chart')
    return { labels: [], datasets: [] }
  }

  // Сортування даних за місяцем і роком
  const sortedData = [...props.data].sort((a, b) => {
    if (a.year !== b.year) {
      return parseInt(a.year) - parseInt(b.year)
    }
    return parseInt(a.month) - parseInt(b.month)
  })

  console.log('Sorted data for chart:', sortedData)

  // Формування підписів для осі X
  const labels = sortedData.map((item) => {
    // Формат "Місяць Рік"
    const monthNames = Array.from({ length: 12 }, (_, i) => t(`payments.months.${i + 1}`))
    return `${monthNames[parseInt(item.month) - 1]} ${item.year}`
  })

  // Формування наборів даних
  const datasets = [
    {
      label: t('dashboard.overdueAmount'),
      data: sortedData.map((item) => parseFloat(item.amount || 0)),
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderColor: '#f44336',
      borderWidth: 2,
      pointBackgroundColor: '#f44336',
      fill: true,
    },
    {
      label: t('dashboard.paidAmount'),
      data: sortedData.map((item) => parseFloat(item.paidamount || 0)),
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderColor: '#4caf50',
      borderWidth: 2,
      pointBackgroundColor: '#4caf50',
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
