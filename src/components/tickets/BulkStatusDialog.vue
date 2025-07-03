<template>
  <q-dialog v-model="showDialog" persistent @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 700px; width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ $t('tickets.bulk.status.title', { count: tickets.length }) }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
        <!-- Selected Tickets with Current Status -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            {{ $t('tickets.bulk.status.selectedTickets') }}
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
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="getStatusColor(ticket.status)"
                    text-color="white"
                    :icon="getStatusIcon(ticket.status)"
                    :label="$t(`tickets.statuses.${ticket.status}`)"
                    dense
                    size="sm"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </div>

        <q-form @submit="updateStatus" ref="statusForm" class="q-gutter-md">
          <!-- New Status Selection -->
          <q-select
            v-model="form.new_status"
            :options="statusOptions"
            :label="$t('tickets.bulk.status.newStatus')"
            :hint="$t('tickets.bulk.status.newStatusHint')"
            outlined
            dense
            emit-value
            map-options
            :rules="[(val) => !!val || $t('tickets.bulk.status.statusRequired')]"
          >
            <template v-slot:option="{ opt }">
              <q-item>
                <q-item-section avatar>
                  <q-chip
                    :color="getStatusColor(opt.value)"
                    text-color="white"
                    :icon="getStatusIcon(opt.value)"
                    dense
                    size="sm"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                  <q-item-label caption v-if="opt.description">
                    {{ opt.description }}
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
                      {{ $t('tickets.bulk.status.ticketsWillChange') }}
                    </q-tooltip>
                  </q-chip>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Automatic Actions based on Status -->
          <q-card flat bordered v-if="form.new_status" class="q-pa-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('tickets.bulk.status.automaticActions') }}
            </div>

            <!-- Resolved Status Actions -->
            <div v-if="form.new_status === 'resolved'" class="q-gutter-sm">
              <q-checkbox
                v-model="form.set_resolved_date"
                :label="$t('tickets.bulk.status.setResolvedDate')"
                color="primary"
              />

              <q-checkbox
                v-model="form.require_resolution_comment"
                :label="$t('tickets.bulk.status.requireResolutionComment')"
                color="primary"
              />
            </div>

            <!-- Closed Status Actions -->
            <div v-if="form.new_status === 'closed'" class="q-gutter-sm">
              <q-checkbox
                v-model="form.set_closed_date"
                :label="$t('tickets.bulk.status.setClosedDate')"
                color="primary"
              />

              <q-checkbox
                v-model="form.archive_tickets"
                :label="$t('tickets.bulk.status.archiveTickets')"
                color="primary"
              />
            </div>

            <!-- In Progress Status Actions -->
            <div v-if="form.new_status === 'in_progress'" class="q-gutter-sm">
              <q-checkbox
                v-model="form.assign_to_current_user"
                :label="$t('tickets.bulk.status.assignToMe')"
                color="primary"
              />

              <q-checkbox
                v-model="form.set_start_date"
                :label="$t('tickets.bulk.status.setStartDate')"
                color="primary"
              />
            </div>

            <!-- Cancelled Status Actions -->
            <div v-if="form.new_status === 'cancelled'" class="q-gutter-sm">
              <q-checkbox
                v-model="form.require_cancellation_reason"
                :label="$t('tickets.bulk.status.requireCancellationReason')"
                color="primary"
              />
            </div>
          </q-card>

          <!-- Status Change Comment -->
          <q-input
            v-model="form.comment"
            :label="getCommentLabel()"
            :hint="getCommentHint()"
            type="textarea"
            outlined
            dense
            rows="3"
            autogrow
            maxlength="1000"
            counter
            :rules="getCommentRules()"
          />

          <!-- Notification Options -->
          <div class="q-gutter-sm">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('tickets.bulk.status.notifications') }}
            </div>

            <q-checkbox
              v-model="form.notify_assignees"
              :label="$t('tickets.bulk.status.notifyAssignees')"
              color="primary"
            />

            <q-checkbox
              v-model="form.notify_clients"
              :label="$t('tickets.bulk.status.notifyClients')"
              color="primary"
            />

            <q-checkbox
              v-model="form.send_status_email"
              :label="$t('tickets.bulk.status.sendStatusEmail')"
              color="primary"
            />
          </div>

          <!-- Impact Analysis -->
          <q-expansion-item
            icon="analytics"
            :label="$t('tickets.bulk.status.impactAnalysis')"
            class="q-mt-md"
          >
            <q-card>
              <q-card-section>
                <div class="text-body2 q-mb-sm">{{ $t('tickets.bulk.status.impactSummary') }}:</div>
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="update" color="blue" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.status.totalTickets', { count: tickets.length }) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.new_status">
                    <q-item-section avatar>
                      <q-icon name="trending_up" color="green" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{
                          $t('tickets.bulk.status.willChangeTo', {
                            count: getAffectedCount(form.new_status),
                            status: getStatusLabel(form.new_status),
                          })
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.assign_to_current_user">
                    <q-item-section avatar>
                      <q-icon name="person_add" color="purple" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{
                          $t('tickets.bulk.status.willAssignToYou', {
                            count: getUnassignedCount(),
                          })
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.notify_clients || form.notify_assignees">
                    <q-item-section avatar>
                      <q-icon name="notifications" color="orange" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.status.notificationsWillBeSent') }}
                      </q-item-label>
                      <q-item-label caption>
                        <span v-if="form.notify_assignees">{{
                          $t('tickets.bulk.status.toAssignees')
                        }}</span>
                        <span v-if="form.notify_assignees && form.notify_clients">, </span>
                        <span v-if="form.notify_clients">{{
                          $t('tickets.bulk.status.toClients')
                        }}</span>
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
          :label="$t('tickets.bulk.status.updateStatus', { count: tickets.length })"
          color="primary"
          @click="updateStatus"
          :loading="updating"
          icon="update"
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
const statusForm = ref(null)

// Form data
const form = ref({
  new_status: '',
  comment: '',
  notify_assignees: true,
  notify_clients: false,
  send_status_email: false,
  // Automatic actions
  set_resolved_date: true,
  set_closed_date: true,
  set_start_date: true,
  assign_to_current_user: false,
  require_resolution_comment: false,
  require_cancellation_reason: true,
  archive_tickets: false,
})

// Computed
const statusOptions = computed(() => [
  {
    label: t('tickets.statuses.open'),
    value: 'open',
    description: t('tickets.bulk.status.descriptions.open'),
  },
  {
    label: t('tickets.statuses.in_progress'),
    value: 'in_progress',
    description: t('tickets.bulk.status.descriptions.in_progress'),
  },
  {
    label: t('tickets.statuses.waiting_client'),
    value: 'waiting_client',
    description: t('tickets.bulk.status.descriptions.waiting_client'),
  },
  {
    label: t('tickets.statuses.resolved'),
    value: 'resolved',
    description: t('tickets.bulk.status.descriptions.resolved'),
  },
  {
    label: t('tickets.statuses.closed'),
    value: 'closed',
    description: t('tickets.bulk.status.descriptions.closed'),
  },
  {
    label: t('tickets.statuses.cancelled'),
    value: 'cancelled',
    description: t('tickets.bulk.status.descriptions.cancelled'),
  },
])

// Methods
const updateStatus = async () => {
  if (!statusForm.value.validate()) {
    return
  }

  updating.value = true
  try {
    const ticketIds = props.tickets.map((ticket) => ticket.id)

    const updateData = {
      ticket_ids: ticketIds,
      new_status: form.value.new_status,
      comment: form.value.comment || null,
      notify_assignees: form.value.notify_assignees,
      notify_clients: form.value.notify_clients,
      send_status_email: form.value.send_status_email,
      // Automatic actions
      set_resolved_date: form.value.set_resolved_date,
      set_closed_date: form.value.set_closed_date,
      set_start_date: form.value.set_start_date,
      assign_to_current_user: form.value.assign_to_current_user,
      archive_tickets: form.value.archive_tickets,
    }

    const response = await TicketsApi.bulkUpdateStatus(updateData)

    if (response.data.success) {
      $q.notify({
        color: 'positive',
        message: t('tickets.bulk.status.success', {
          count: ticketIds.length,
          status: getStatusLabel(form.value.new_status),
        }),
        caption: t('tickets.bulk.status.successDetails'),
        icon: 'check_circle',
      })

      resetForm()
      showDialog.value = false
      emit('updated')
    }
  } catch (error) {
    console.error('Error bulk updating status:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.bulk.status.error'),
      caption: error.response?.data?.message || t('tickets.bulk.status.errorDetails'),
      icon: 'error',
    })
  } finally {
    updating.value = false
  }
}

const resetForm = () => {
  form.value = {
    new_status: '',
    comment: '',
    notify_assignees: true,
    notify_clients: false,
    send_status_email: false,
    set_resolved_date: true,
    set_closed_date: true,
    set_start_date: true,
    assign_to_current_user: false,
    require_resolution_comment: false,
    require_cancellation_reason: true,
    archive_tickets: false,
  }

  if (statusForm.value) {
    statusForm.value.resetValidation()
  }
}

const onDialogHide = () => {
  resetForm()
}

const getAffectedCount = (status) => {
  return props.tickets.filter((ticket) => ticket.status !== status).length
}

const getUnassignedCount = () => {
  return props.tickets.filter((ticket) => !ticket.assigned_to).length
}

const getStatusLabel = (status) => {
  const statusOption = statusOptions.value.find((opt) => opt.value === status)
  return statusOption ? statusOption.label : status
}

const getCommentLabel = () => {
  const baseLabel = t('tickets.bulk.status.comment')
  if (form.value.require_resolution_comment && form.value.new_status === 'resolved') {
    return `${baseLabel} *`
  }
  if (form.value.require_cancellation_reason && form.value.new_status === 'cancelled') {
    return `${baseLabel} *`
  }
  return baseLabel
}

const getCommentHint = () => {
  if (form.value.new_status === 'resolved') {
    return t('tickets.bulk.status.resolutionCommentHint')
  }
  if (form.value.new_status === 'cancelled') {
    return t('tickets.bulk.status.cancellationCommentHint')
  }
  return t('tickets.bulk.status.commentHint')
}

const getCommentRules = () => {
  const rules = []

  if (form.value.require_resolution_comment && form.value.new_status === 'resolved') {
    rules.push((val) => !!val || t('tickets.bulk.status.resolutionCommentRequired'))
  }

  if (form.value.require_cancellation_reason && form.value.new_status === 'cancelled') {
    rules.push((val) => !!val || t('tickets.bulk.status.cancellationReasonRequired'))
  }

  return rules
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    open: 'blue',
    in_progress: 'orange',
    waiting_client: 'purple',
    resolved: 'green',
    closed: 'grey',
    cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    open: 'fiber_new',
    in_progress: 'play_arrow',
    waiting_client: 'schedule',
    resolved: 'check_circle',
    closed: 'lock',
    cancelled: 'cancel',
  }
  return icons[status] || 'help'
}

// Watch for status changes to update automatic actions
watch(
  () => form.value.new_status,
  (newStatus) => {
    // Reset automatic actions when status changes
    form.value.assign_to_current_user = false
    form.value.require_resolution_comment = false
    form.value.require_cancellation_reason = false

    // Set defaults based on new status
    if (newStatus === 'resolved') {
      form.value.require_resolution_comment = true
    } else if (newStatus === 'cancelled') {
      form.value.require_cancellation_reason = true
    } else if (newStatus === 'in_progress') {
      form.value.assign_to_current_user = getUnassignedCount() > 0
    }
  },
)
</script>
