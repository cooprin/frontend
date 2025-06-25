<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">{{ $t('tickets.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="new" :label="$t('tickets.tabs.new')" />
          <q-tab name="in_progress" :label="$t('tickets.tabs.inProgress')" />
          <q-tab name="resolved" :label="$t('tickets.tabs.resolved')" />
          <q-tab name="all" :label="$t('tickets.tabs.all')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="new">
            <TicketsList
              :status-filter="['open']"
              :key="'new'"
              @ticket-selected="onTicketSelected"
            />
          </q-tab-panel>

          <q-tab-panel name="in_progress">
            <TicketsList
              :status-filter="['in_progress', 'waiting_client']"
              :key="'in_progress'"
              @ticket-selected="onTicketSelected"
            />
          </q-tab-panel>

          <q-tab-panel name="resolved">
            <TicketsList
              :status-filter="['resolved', 'closed', 'cancelled']"
              :key="'resolved'"
              @ticket-selected="onTicketSelected"
            />
          </q-tab-panel>

          <q-tab-panel name="all">
            <TicketsList :status-filter="[]" :key="'all'" @ticket-selected="onTicketSelected" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>

    <!-- Ticket Detail Dialog -->
    <q-dialog
      v-model="ticketDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <TicketDetail
        v-if="selectedTicket"
        :ticket-id="selectedTicket"
        @close="ticketDetailDialog = false"
        @ticket-updated="onTicketUpdated"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TicketsList from 'components/tickets/TicketsList.vue'
import TicketDetail from 'components/tickets/TicketDetail.vue'

const route = useRoute()

// State
const activeTab = ref('new')
const ticketDetailDialog = ref(false)
const selectedTicket = ref(null)

// Methods
const onTicketSelected = (ticketId) => {
  selectedTicket.value = ticketId
  ticketDetailDialog.value = true
}

const onTicketUpdated = () => {
  // Refresh current tab data
  // This will be handled by TicketsList component through key updates
}

// Handle URL parameters for direct ticket access
onMounted(() => {
  const ticketId = route.query.ticketId
  if (ticketId) {
    onTicketSelected(ticketId)
  }

  // Set active tab from URL
  const tab = route.query.tab
  if (tab && ['new', 'in_progress', 'resolved', 'all'].includes(tab)) {
    activeTab.value = tab
  }
})
</script>

<style scoped>
.q-tab-panels {
  background: transparent;
}

.q-tab-panel {
  padding: 16px 0;
}
</style>
