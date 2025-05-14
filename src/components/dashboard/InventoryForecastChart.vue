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
  period: {
    type: Number,
    default: 90,
  },
})

const { data, period } = toRefs(props)
const chartRef = ref(null)
const { locale } = useI18n()
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')

  // Підготуємо дані для графіка
  const dates = [...new Set(data.value.map((item) => item.date))].sort()

  // Групуємо дані за типами
  const groupedByType = {}
  data.value.forEach((item) => {
    if (!groupedByType[item.product_type]) {
      groupedByType[item.product_type] = {
        label: item.product_type,
        color: generateColorFromString(item.product_type),
        data: {},
      }
    }
    groupedByType[item.product_type].data[item.date] = item.quantity
  })

  // Формуємо датасети
  const datasets = Object.values(groupedByType).map((typeData) => {
    const values = dates.map((date) => typeData.data[date] || null)
    return {
      label: typeData.label,
      data: values,
      borderColor: typeData.color,
      backgroundColor: typeData.color.replace('1)', '0.1)'),
      tension: 0.4,
      borderWidth: 2,
      fill: false,
    }
  })

  // Знаходимо точку розділу між реальними даними та прогнозом
  const today = new Date()
  const forecastStartIndex = dates.findIndex((date) => new Date(date) > today)

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: (context) => {
              // Виділяємо вертикальну лінію, що розділяє реальні дані та прогноз
              if (forecastStartIndex > 0 && context.index === forecastStartIndex - 1) {
                return 'rgba(255, 0, 0, 0.5)'
              }
              return 'rgba(0, 0, 0, 0.1)'
            },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (tooltipItems) {
              const date = new Date(tooltipItems[0].label)
              return date.toLocaleDateString()
            },
            label: function (context) {
              const isForecast = context.dataIndex >= forecastStartIndex
              return `${context.dataset.label}: ${context.raw}${isForecast ? ' (прогноз)' : ''}`
            },
          },
        },
        annotation: {
          annotations: {
            forecastLine: {
              type: 'line',
              xMin: forecastStartIndex > 0 ? dates[forecastStartIndex - 1] : null,
              xMax: forecastStartIndex > 0 ? dates[forecastStartIndex - 1] : null,
              borderColor: 'rgba(255, 0, 0, 0.5)',
              borderWidth: 2,
              label: {
                enabled: true,
                content: 'Прогноз',
                position: 'top',
              },
            },
          },
        },
      },
    },
  })
}

// Функція для генерації кольору на основі рядка
const generateColorFromString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const h = Math.abs(hash % 360)
  return `hsla(${h}, 70%, 60%, 1)`
}

onMounted(() => {
  if (data.value && data.value.length > 0) {
    createChart()
  }
})

// Спостерігаємо за зміною даних та періоду
watch(
  [data, period],
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
