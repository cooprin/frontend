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
      bottom: 30,
      left: 20,
      right: 20,
      top: 20,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grace: '10%', // Збільшено відступ зверху
      ticks: {
        callback: function (value) {
          return new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
        },
        padding: 10, // Більший відступ для підписів
      },
      grid: {
        color: 'rgba(200, 200, 200, 0.2)', // Світліша сітка
      },
    },
    x: {
      grid: {
        display: false, // Прибираємо вертикальні лінії сітки
      },
      ticks: {
        padding: 10, // Більший відступ для підписів
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 18,
        padding: 15,
        usePointStyle: true, // Використовуємо стиль точок для легенди
        pointStyle: 'circle', // Круглі точки
        font: {
          size: 13, // Більший шрифт для легенди
        },
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false, // Показувати підказку навіть без прямого перетину з точкою
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // Світліший фон
      titleColor: '#333', // Темний колір для заголовка
      bodyColor: '#333', // Темний колір для тексту
      borderColor: 'rgba(200, 200, 200, 0.5)', // Додаємо рамку
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
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
      tension: 0.4, // Оптимальна плавність для бізнес-графіків (між 0 і 1)
      capBezierPoints: true, // Забезпечує кращу поведінку кривих Безьє на краях
      borderWidth: 3, // Товстіші лінії
      fill: true, // Включаємо заливку
    },
    point: {
      radius: 4, // Розмір точок
      hoverRadius: 8, // Розмір точок при наведенні
      hitRadius: 12, // Область для визначення наведення
      borderWidth: 2, // Ширина рамки точок
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
  animation: {
    duration: 1000, // Довша анімація
    easing: 'easeOutQuart', // Плавніша анімація
  },
  bezierCurve: true, // Додаткове включення кривих Безьє
  cubicInterpolationMode: 'monotone', // Забезпечує плавніші переходи без різких піків
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
      backgroundColor: 'rgba(244, 67, 54, 0.15)', // Більш прозора заливка
      borderColor: '#f44336',
      borderWidth: 3,
      pointBackgroundColor: '#f44336',
      fill: true,
      tension: 0.4, // Плавність лінії для кожного набору даних
      cubicInterpolationMode: 'monotone', // Режим інтерполяції для кожного набору даних
    },
    {
      label: t('dashboard.paidAmount'),
      data: sortedData.map((item) => parseFloat(item.paidamount || 0)),
      backgroundColor: 'rgba(76, 175, 80, 0.15)', // Більш прозора заливка
      borderColor: '#4caf50',
      borderWidth: 3,
      pointBackgroundColor: '#4caf50',
      fill: true,
      tension: 0.4, // Плавність лінії для кожного набору даних
      cubicInterpolationMode: 'monotone', // Режим інтерполяції для кожного набору даних
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
