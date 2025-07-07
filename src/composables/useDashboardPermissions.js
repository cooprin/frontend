import { computed } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useI18n } from 'vue-i18n'
import { MENU_PERMISSIONS } from 'src/constants/permissions'

export function useDashboardPermissions() {
  const authStore = useAuthStore()
  const { t } = useI18n()

  // Мапінг дозволів для кожного типу дашборду
  const dashboardPermissions = {
    welcome: null, // Welcome доступний всім
    overdue: MENU_PERMISSIONS.DASHBOARDS.OVERDUE.READ,
    tickets: MENU_PERMISSIONS.DASHBOARDS.TICKETS.READ,
    inventory: MENU_PERMISSIONS.DASHBOARDS.INVENTORY.READ,
  }

  // Перевірка доступу до конкретного дашборду
  const hasAccessToDashboard = (dashboardType) => {
    const permission = dashboardPermissions[dashboardType]
    if (!permission) return true // Welcome доступний всім

    // Використовуємо hasAnyPermission замість hasPermission
    return authStore.hasAnyPermission([permission])
  }

  // Список доступних дашбордів
  const availableDashboards = computed(() => {
    const allDashboards = [
      { label: t('dashboard.types.welcome'), value: 'welcome' },
      { label: t('dashboard.types.overduePayments'), value: 'overdue' },
      { label: t('dashboard.types.tickets'), value: 'tickets' },
      { label: t('dashboard.types.inventory'), value: 'inventory' },
    ]

    return allDashboards.filter((dashboard) => hasAccessToDashboard(dashboard.value))
  })

  // Дефолтний дашборд (завжди welcome)
  const getDefaultDashboard = () => {
    return 'welcome'
  }

  return {
    hasAccessToDashboard,
    availableDashboards,
    getDefaultDashboard,
  }
}
