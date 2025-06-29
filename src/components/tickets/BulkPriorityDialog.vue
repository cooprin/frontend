<template>
  <q-dialog v-model="showDialog" persistent @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 700px; width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ $t('tickets.bulk.priority.title', { count: tickets.length }) }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
        <!-- Selected Tickets with Current Priority -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            {{ $t('tickets.bulk.priority.selectedTickets') }}
          </div>
          <q-scroll-area style="height: 150px" class="bg-grey-1 rounded-borders q-pa-sm">
            <q-list dense>
              <q-item v-for="ticket in tickets" :key="ticket.id" class="q-pa-xs">
                <q-item-section avatar>
                  <q-chip
                    :label="ticket.ticket_number"
                    color="primary"
                    text-color="white"
                    size="sm"
                    dense
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2">{{ ticket.title }}</q-item-label>
                  <q-item-label caption v-if="ticket.client_name">
                    {{ ticket.client_name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="getPriorityColor(ticket.priority)"
                    text-color="white"
                    :icon="getPriorityIcon(ticket.priority)"
                    :label="$t(`tickets.priorities.${ticket.priority}`)"
                    dense
                    size="sm"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </div>

        <!-- Priority Statistics -->
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            {{ $t('tickets.bulk.priority.currentDistribution') }}
          </div>
          <div class="row q-gutter-sm">
            <q-chip
              v-for="priority in priorityStats"
              :key="priority.value"
              :color="getPriorityColor(priority.value)"
              text-color="white"
              :icon="getPriorityIcon(priority.value)"
              :label="`${$t(`tickets.priorities.${priority.value}`)}: ${priority.count}`"
              dense
            />
          </div>
        </q-card>

        <q-form @submit="updatePriority" ref="priorityForm" class="q-gutter-md">
          <!-- New Priority Selection -->
          <q-select
            v-model="form.new_priority"
            :options="priorityOptions"
            :label="$t('tickets.bulk.priority.newPriority')"
            :hint="$t('tickets.bulk.priority.newPriorityHint')"
            outlined
            dense
            emit-value
            map-options
            :rules="[(val) => !!val || $t('tickets.bulk.priority.priorityRequired')]"
          >
            <template v-slot:option="{ opt }">
              <q-item>
                <q-item-section avatar>
                  <q-chip
                    :color="getPriorityColor(opt.value)"
                    text-color="white"
                    :icon="getPriorityIcon(opt.value)"
                    dense
                    size="sm"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                  <q-item-label caption v-if="opt.description">
                    {{ opt.description }}
                  </q-item-label>
                  <q-item-label caption v-if="opt.sla">
                    {{ $t('tickets.bulk.priority.sla') }}: {{ opt.sla }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side v-if="getAffectedCount(opt.value) > 0">
                  <q-chip
                    color="orange"
                    text-color="white"
                    :label="getAffectedCount(opt.value)"
                    size="sm"
                    dense
                  >
                    <q-tooltip>
                      {{ $t('tickets.bulk.priority.ticketsWillChange') }}
                    </q-tooltip>
                  </q-chip>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Priority Change Warning -->
          <q-banner
            v-if="form.new_priority === 'urgent'"
            class="bg-red-1 text-red-8"
            icon="warning"
          >
            <div class="text-weight-medium">
              {{ $t('tickets.bulk.priority.urgentWarning') }}
            </div>
            <div class="text-caption">
              {{ $t('tickets.bulk.priority.urgentWarningDetails') }}
            </div>
          </q-banner>

          <q-banner
            v-if="form.new_priority === 'low' && hasUrgentTickets"
            class="bg-orange-1 text-orange-8"
            icon="info"
          >
            <div class="text-weight-medium">
              {{ $t('tickets.bulk.priority.downgradeWarning') }}
            </div>
            <div class="text-caption">
              {{ $t('tickets.bulk.priority.downgradeWarningDetails') }}
            </div>
          </q-banner>

          <!-- Automatic Actions based on Priority -->
          <q-card flat bordered v-if="form.new_priority" class="q-pa-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('tickets.bulk.priority.automaticActions') }}
            </div>

            <!-- Urgent Priority Actions -->
            <div v-if="form.new_priority === 'urgent'" class="q-gutter-sm">
              <q-checkbox
                v-model="form.notify_management"
                :label="$t('tickets.bulk.priority.notifyManagement')"
                color="red"
              />

              <q-checkbox
                v-model="form.escalate_immediately"
                :label="$t('tickets.bulk.priority.escalateImmediately')"
                color="red"
              />

              <q-checkbox
                v-model="form.set_due_date"
                :label="$t('tickets.bulk.priority.setUrgentDueDate')"
                color="red"
              />
            </div>

            <!-- High Priority Actions -->
            <div v-if="form.new_priority === 'high'" class="q-gutter-sm">
              <q-checkbox
                v-model="form.notify_assignees"
                :label="$t('tickets.bulk.priority.notifyAssignees')"
                color="orange"
              />

              <q-checkbox
                v-model="form.set_due_date"
                :label="$t('tickets.bulk.priority.setHighDueDate')"
                color="orange"
              />
            </div>

            <!-- Low Priority Actions -->
            <div v-if="form.new_priority === 'low'" class="q-gutter-sm">
              <q-checkbox
                v-model="form.clear_due_date"
                :label="$t('tickets.bulk.priority.clearDueDate')"
                color="green"
              />

              <q-checkbox
                v-model="form.reduce_notifications"
                :label="$t('tickets.bulk.priority.reduceNotifications')"
                color="green"
              />
            </div>
          </q-card>

          <!-- Priority Change Reason -->
          <q-input
            v-model="form.reason"
            :label="getPriorityReasonLabel()"
            :hint="getPriorityReasonHint()"
            type="textarea"
            outlined
            dense
            rows="3"
            autogrow
            maxlength="500"
            counter
            :rules="getPriorityReasonRules()"
          />

          <!-- Due Date Override (for urgent/high) -->
          <div
            v-if="
              (form.new_priority === 'urgent' || form.new_priority === 'high') && form.set_due_date
            "
          >
            <q-input
              v-model="form.custom_due_date"
              :label="$t('tickets.bulk.priority.customDueDate')"
              :hint="$t('tickets.bulk.priority.customDueDateHint')"
              outlined
              dense
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="form.custom_due_date"
                      mask="YYYY-MM-DD HH:mm"
                      :options="dueDateOptions"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="$t('common.close')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Notification Options -->
          <div class="q-gutter-sm">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('tickets.bulk.priority.notifications') }}
            </div>

            <q-checkbox
              v-model="form.notify_clients"
              :label="$t('tickets.bulk.priority.notifyClients')"
              color="primary"
            />

            <q-checkbox
              v-model="form.log_priority_change"
              :label="$t('tickets.bulk.priority.logPriorityChange')"
              color="primary"
            />
          </div>

          <!-- Impact Analysis -->
          <q-expansion-item
            icon="analytics"
            :label="$t('tickets.bulk.priority.impactAnalysis')"
            class="q-mt-md"
          >
            <q-card>
              <q-card-section>
                <div class="text-body2 q-mb-sm">
                  {{ $t('tickets.bulk.priority.impactSummary') }}:
                </div>
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="priority_high" color="blue" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.priority.totalTickets', { count: tickets.length }) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.new_priority">
                    <q-item-section avatar>
                      <q-icon name="trending_up" :color="getPriorityColor(form.new_priority)" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{
                          $t('tickets.bulk.priority.willChangeTo', {
                            count: getAffectedCount(form.new_priority),
                            priority: getPriorityLabel(form.new_priority),
                          })
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.notify_management">
                    <q-item-section avatar>
                      <q-icon name="supervisor_account" color="red" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.priority.managementWillBeNotified') }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.escalate_immediately">
                    <q-item-section avatar>
                      <q-icon name="rocket_launch" color="red" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.priority.ticketsWillEscalate') }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.set_due_date">
                    <q-item-section avatar>
                      <q-icon name="schedule" color="orange" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.priority.dueDatesWillBeSet') }}
                      </q-item-label>
                      <q-item-label caption v-if="form.custom_due_date">
                        {{ $t('tickets.bulk.priority.customDate') }}: {{ form.custom_due_date }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn :label="$t('common.cancel')" color="grey" v-close-popup :disable="updating" />
        <q-btn
          :label="$t('tickets.bulk.priority.updatePriority', { count: tickets.length })"
          color="primary"
          @click="updatePriority"
          :loading="updating"
          icon="priority_high"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { TicketsApi } from 'src/api/tickets'
import { date } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tickets: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'updated'])

const $q = useQuasar()
const { t } = useI18n()

// Local dialog state
const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// State
const updating = ref(false)
const priorityForm = ref(null)

// Form data
const form = ref({
  new_priority: '',
  reason: '',
  custom_due_date: '',
  notify_clients: false,
  notify_assignees: true,
  notify_management: true,
  log_priority_change: true,
  escalate_immediately: false,
  set_due_date: true,
  clear_due_date: false,
  reduce_notifications: false,
})

// Computed
const priorityOptions = computed(() => [
  {
    label: t('tickets.priorities.low'),
    value: 'low',
    description: t('tickets.bulk.priority.descriptions.low'),
    sla: t('tickets.bulk.priority.sla.low'),
  },
  {
    label: t('tickets.priorities.medium'),
    value: 'medium',
    description: t('tickets.bulk.priority.descriptions.medium'),
    sla: t('tickets.bulk.priority.sla.medium'),
  },
  {
    label: t('tickets.priorities.high'),
    value: 'high',
    description: t('tickets.bulk.priority.descriptions.high'),
    sla: t('tickets.bulk.priority.sla.high'),
  },
  {
    label: t('tickets.priorities.urgent'),
    value: 'urgent',
    description: t('tickets.bulk.priority.descriptions.urgent'),
    sla: t('tickets.bulk.priority.sla.urgent'),
  },
])

const priorityStats = computed(() => {
  const stats = {}
  props.tickets.forEach((ticket) => {
    stats[ticket.priority] = (stats[ticket.priority] || 0) + 1
  })

  return Object.entries(stats).map(([priority, count]) => ({
    value: priority,
    count,
  }))
})

const hasUrgentTickets = computed(() => {
  return props.tickets.some((ticket) => ticket.priority === 'urgent' || ticket.priority === 'high')
})

const dueDateOptions = (dateStr) => {
  // Only allow future dates
  return dateStr >= date.formatDate(new Date(), 'YYYY/MM/DD')
}

// Methods
const updatePriority = async () => {
  if (!priorityForm.value.validate()) {
    return
  }

  updating.value = true
  try {
    const ticketIds = props.tickets.map((ticket) => ticket.id)

    const updateData = {
      ticket_ids: ticketIds,
      new_priority: form.value.new_priority,
      reason: form.value.reason || null,
      custom_due_date: form.value.custom_due_date || null,
      notify_clients: form.value.notify_clients,
      notify_assignees: form.value.notify_assignees,
      notify_management: form.value.notify_management,
      log_priority_change: form.value.log_priority_change,
      escalate_immediately: form.value.escalate_immediately,
      set_due_date: form.value.set_due_date,
      clear_due_date: form.value.clear_due_date,
      reduce_notifications: form.value.reduce_notifications,
    }

    const response = await TicketsApi.bulkUpdatePriority(updateData)

    if (response.data.success) {
      $q.notify({
        color: 'positive',
        message: t('tickets.bulk.priority.success', {
          count: ticketIds.length,
          priority: getPriorityLabel(form.value.new_priority),
        }),
        caption: t('tickets.bulk.priority.successDetails'),
        icon: 'check_circle',
      })

      resetForm()
      showDialog.value = false
      emit('updated')
    }
  } catch (error) {
    console.error('Error bulk updating priority:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.bulk.priority.error'),
      caption: error.response?.data?.message || t('tickets.bulk.priority.errorDetails'),
      icon: 'error',
    })
  } finally {
    updating.value = false
  }
}

const resetForm = () => {
  form.value = {
    new_priority: '',
    reason: '',
    custom_due_date: '',
    notify_clients: false,
    notify_assignees: true,
    notify_management: true,
    log_priority_change: true,
    escalate_immediately: false,
    set_due_date: true,
    clear_due_date: false,
    reduce_notifications: false,
  }

  if (priorityForm.value) {
    priorityForm.value.resetValidation()
  }
}

const onDialogHide = () => {
  resetForm()
}

const getAffectedCount = (priority) => {
  return props.tickets.filter((ticket) => ticket.priority !== priority).length
}

const getPriorityLabel = (priority) => {
  const priorityOption = priorityOptions.value.find((opt) => opt.value === priority)
  return priorityOption ? priorityOption.label : priority
}

const getPriorityReasonLabel = () => {
  const baseLabel = t('tickets.bulk.priority.reason')
  if (form.value.new_priority === 'urgent') {
    return `${baseLabel} *`
  }
  return baseLabel
}

const getPriorityReasonHint = () => {
  if (form.value.new_priority === 'urgent') {
    return t('tickets.bulk.priority.urgentReasonHint')
  }
  if (form.value.new_priority === 'low' && hasUrgentTickets.value) {
    return t('tickets.bulk.priority.downgradeReasonHint')
  }
  return t('tickets.bulk.priority.reasonHint')
}

const getPriorityReasonRules = () => {
  const rules = []

  if (form.value.new_priority === 'urgent') {
    rules.push((val) => !!val || t('tickets.bulk.priority.urgentReasonRequired'))
  }

  if (form.value.new_priority === 'low' && hasUrgentTickets.value) {
    rules.push((val) => !!val || t('tickets.bulk.priority.downgradeReasonRequired'))
  }

  return rules
}

// Utility methods
const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  }
  return colors[priority] || 'grey'
}

const getPriorityIcon = (priority) => {
  const icons = {
    low: 'keyboard_arrow_down',
    medium: 'remove',
    high: 'keyboard_arrow_up',
    urgent: 'priority_high',
  }
  return icons[priority] || 'remove'
}

// Watch for priority changes to update automatic actions
watch(
  () => form.value.new_priority,
  (newPriority) => {
    // Reset automatic actions when priority changes
    form.value.notify_management = false
    form.value.escalate_immediately = false
    form.value.set_due_date = false
    form.value.clear_due_date = false
    form.value.reduce_notifications = false
    form.value.notify_assignees = true

    // Set defaults based on new priority
    if (newPriority === 'urgent') {
      form.value.notify_management = true
      form.value.escalate_immediately = true
      form.value.set_due_date = true
    } else if (newPriority === 'high') {
      form.value.notify_assignees = true
      form.value.set_due_date = true
    } else if (newPriority === 'low') {
      form.value.clear_due_date = true
      form.value.reduce_notifications = true
      form.value.notify_assignees = false
    }
  },
)
</script>

<style scoped>
.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
