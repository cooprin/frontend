<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">{{ $t('tickets.title') }}</div>

    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        outside-arrows
        mobile-arrows
      >
        <q-tab name="new" :label="$t('tickets.tabs.new')" />
        <q-tab name="inProgress" :label="$t('tickets.tabs.inProgress')" />
        <q-tab name="all" :label="$t('tickets.tabs.all')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="new">
          <new-tickets-card />
        </q-tab-panel>

        <q-tab-panel name="inProgress">
          <in-progress-tickets-card />
        </q-tab-panel>

        <q-tab-panel name="all">
          <all-tickets-card />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Ticket Detail Dialog -->
    <q-dialog
      v-model="ticketDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <ticket-detail-dialog
        v-if="selectedTicket"
        :ticket-id="selectedTicket"
        @close="closeTicketDetail"
        @ticket-updated="onTicketUpdated"
      />
    </q-dialog>

    <!-- Create Ticket Dialog -->
    <create-ticket-dialog v-model="createTicketDialog" @ticket-created="onTicketCreated" />
  </q-page>
</template>

<script setup>
import { ref, provide, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NewTicketsCard from 'components/tickets/NewTicketsCard.vue'
import InProgressTicketsCard from 'components/tickets/InProgressTicketsCard.vue'
import AllTicketsCard from 'components/tickets/AllTicketsCard.vue'
import TicketDetailDialog from 'components/tickets/TicketDetailDialog.vue'
import CreateTicketDialog from 'components/tickets/CreateTicketDialog.vue'

defineOptions({
  components: {
    TicketDetailDialog,
    CreateTicketDialog,
  },
})

const route = useRoute()
const router = useRouter()

// State
const tab = ref('new')
const ticketDetailDialog = ref(false)
const selectedTicket = ref(null)
const createTicketDialog = ref(false)

// Methods
const openTicketDetail = (ticketId) => {
  selectedTicket.value = ticketId
  ticketDetailDialog.value = true
}

const showCreateDialog = () => {
  createTicketDialog.value = true
}

const onTicketUpdated = () => {
  // Refresh current tab data by emitting event to child components
  // This will be handled by each card component
}

const onTicketCreated = () => {
  createTicketDialog.value = false
  onTicketUpdated()
}

const closeTicketDetail = () => {
  ticketDetailDialog.value = false
  selectedTicket.value = null
}

// Provide methods to child components
provide('openTicketDetail', openTicketDetail)
provide('showCreateDialog', showCreateDialog)
provide('refreshTickets', onTicketUpdated)

// Handle URL parameters for direct ticket access
onMounted(() => {
  const ticketId = route.query.ticketId
  if (ticketId) {
    openTicketDetail(ticketId)
  }

  // Set active tab from URL
  const urlTab = route.query.tab
  if (urlTab && ['new', 'inProgress', 'all'].includes(urlTab)) {
    tab.value = urlTab
  }
})

// Watch tab changes and update URL
watch(
  () => tab.value,
  (newTab) => {
    router.push({
      query: {
        ...route.query,
        tab: newTab,
      },
    })
  },
)
</script>
