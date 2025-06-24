<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <!-- Welcome Section -->
      <div class="col-12">
        <q-card class="welcome-card">
          <q-card-section>
            <div class="text-h5 text-weight-bold">
              {{ $t('portal.pages.dashboard.welcome') }}
            </div>
            <div class="text-subtitle1 text-grey-7">
              {{ userStore.user?.name }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistics Cards -->
      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="directions_car" size="48px" color="primary" />
            <div class="text-h4 text-weight-bold q-mt-sm">
              {{ statistics.objectsCount || 0 }}
            </div>
            <div class="text-subtitle2 text-grey-7">
              {{ $t('portal.pages.dashboard.objectsCount') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="receipt" size="48px" color="orange" />
            <div class="text-h4 text-weight-bold q-mt-sm">
              {{ statistics.unpaidInvoices || 0 }}
            </div>
            <div class="text-subtitle2 text-grey-7">
              {{ $t('portal.pages.dashboard.unpaidInvoices') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="support_agent" size="48px" color="green" />
            <div class="text-h4 text-weight-bold q-mt-sm">
              {{ statistics.openTickets || 0 }}
            </div>
            <div class="text-subtitle2 text-grey-7">
              {{ $t('portal.pages.dashboard.openTickets') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="schedule" size="48px" color="purple" />
            <div class="text-h4 text-weight-bold q-mt-sm">
              {{ lastActivity }}
            </div>
            <div class="text-subtitle2 text-grey-7">
              {{ $t('portal.pages.dashboard.lastActivity') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('common.quickActions') }}</div>
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="add"
                :label="$t('tickets.create')"
                @click="$router.push('/portal/tickets')"
              />
              <q-btn
                color="secondary"
                icon="chat"
                :label="$t('portal.chat')"
                @click="$router.push('/portal/chat')"
              />
              <q-btn
                color="accent"
                icon="folder"
                :label="$t('portal.myDocuments')"
                @click="$router.push('/portal/documents')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('common.recentActivity') }}</div>
            <q-list v-if="recentActivity.length > 0">
              <q-item v-for="item in recentActivity" :key="item.id">
                <q-item-section avatar>
                  <q-icon :name="item.icon" :color="item.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.title }}</q-item-label>
                  <q-item-label caption>{{ formatDate(item.date) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center text-grey-5 q-py-md">
              {{ $t('portal.messages.noData') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from 'stores/auth'
import { PortalApi } from 'src/api/portal'
import { TicketsApi } from 'src/api/tickets'
import { date } from 'quasar'

const userStore = useAuthStore()

const statistics = ref({
  objectsCount: 0,
  unpaidInvoices: 0,
  openTickets: 0,
})

const recentActivity = ref([])
const loading = ref(false)

const lastActivity = computed(() => {
  if (recentActivity.value.length > 0) {
    const latest = recentActivity.value[0]
    return date.formatDate(latest.date, 'DD.MM')
  }
  return '-'
})

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const loadDashboardData = async () => {
  try {
    loading.value = true

    // Load profile to get objects count
    const profileResponse = await PortalApi.getProfile()
    if (profileResponse.data.success) {
      statistics.value.objectsCount = profileResponse.data.client.objects_count || 0
    }

    // Load unpaid invoices count
    const invoicesResponse = await PortalApi.getInvoices({ status: 'issued', limit: 100 })
    if (invoicesResponse.data.success) {
      // Фільтруємо тільки ті, що дійсно неоплачені
      const unpaidCount = invoicesResponse.data.invoices.filter(
        (invoice) => !invoice.payment_date,
      ).length
      statistics.value.unpaidInvoices = unpaidCount
    }

    // Load open tickets count
    const ticketsResponse = await TicketsApi.getTickets({
      status: 'open',
      limit: 5,
    })
    if (ticketsResponse.data.success) {
      statistics.value.openTickets = ticketsResponse.data.pagination?.total || 0

      // Use recent tickets as activity
      recentActivity.value = ticketsResponse.data.tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        date: ticket.created_at,
        icon: 'support_agent',
        color: 'primary',
      }))
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
}
</style>
