// src/components/dashboard/OverdueChart.vue
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
  showSplit: {
    type: Boolean,
    default: false,
  },
})

const { data, showSplit } = toRefs(props)
const chartRef = ref(null)
const { t } = useI18n()
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')

  const labels = data.value.map((item) => `${t(`payments.months.${item.month}`)} ${item.year}`)

  const datasets = []

  if (showSplit.value) {
    // Якщо потрібно показувати розбивку за типами послуг
    datasets.push({
      label: t('dashboard.metrics.objectsOverdue'),
      data: data.value.map((item) => parseFloat(item.objectamount || 0)),
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })

    datasets.push({
      label: t('dashboard.metrics.fixedServicesOverdue'),
      data: data.value.map((item) => parseFloat(item.fixedamount || 0)),
      backgroundColor: 'rgba(231, 76, 60, 0.2)',
      borderColor: 'rgba(231, 76, 60, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })

    datasets.push({
      label: t('dashboard.metrics.paidAmount'),
      data: data.value.map((item) => parseFloat(item.paidamount || 0)),
      backgroundColor: 'rgba(46, 204, 113, 0.2)',
      borderColor: 'rgba(46, 204, 113, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })
  } else {
    // Стандартний варіант, як раніше
    datasets.push({
      label: t('dashboard.metrics.overdueAmount'),
      data: data.value.map((item) => parseFloat(item.amount || 0)),
      backgroundColor: 'rgba(231, 76, 60, 0.2)',
      borderColor: 'rgba(231, 76, 60, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })

    datasets.push({
      label: t('dashboard.metrics.paidAmount'),
      data: data.value.map((item) => parseFloat(item.paidamount || 0)),
      backgroundColor: 'rgba(46, 204, 113, 0.2)',
      borderColor: 'rgba(46, 204, 113, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })
  }

  chart = new Chart(ctx, {
    type: 'line', // Изменили тип с 'bar' на 'line'
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return new Intl.NumberFormat('uk-UA', {
                style: 'currency',
                currency: 'UAH',
                maximumFractionDigits: 0,
              }).format(value)
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                context.dataset.label +
                ': ' +
                new Intl.NumberFormat('uk-UA', {
                  style: 'currency',
                  currency: 'UAH',
                }).format(context.raw)
              )
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

watch(
  data,
  () => {
    if (chartRef.value && data.value.length > 0) {
      createChart()
    }
  },
  { deep: true },
)
</script>
