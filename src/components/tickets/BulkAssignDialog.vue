<template>
  <q-dialog v-model="showDialog" persistent @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 700px; width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ $t('tickets.bulk.assign.title', { count: tickets.length }) }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
        <!-- Selected Tickets Summary -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            {{ $t('tickets.bulk.assign.selectedTickets') }}
          </div>
          <q-scroll-area style="height: 120px" class="bg-grey-1 rounded-borders q-pa-sm">
            <div class="row q-gutter-xs">
              <q-chip
                v-for="ticket in tickets"
                :key="ticket.id"
                :label="ticket.ticket_number"
                color="primary"
                text-color="white"
                size="sm"
                dense
              >
                <q-tooltip>{{ ticket.title }}</q-tooltip>
              </q-chip>
            </div>
          </q-scroll-area>
        </div>

        <q-form @submit="assignTickets" ref="assignForm" class="q-gutter-md">
          <!-- Assignee Selection -->
          <q-select
            v-model="form.assigned_to"
            :options="staffSearch.filteredOptions.value"
            :label="$t('tickets.bulk.assign.assignTo')"
            :hint="$t('tickets.bulk.assign.assignToHint')"
            outlined
            dense
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="(val, update) => staffSearch.filterOptions(val, update)"
            @popup-show="staffSearch.resetFilter"
            :rules="[(val) => !!val || $t('tickets.bulk.assign.assigneeRequired')]"
            clearable
          >
            <template v-slot:option="{ opt }">
              <q-item>
                <q-item-section avatar>
                  <q-avatar size="32px">
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                  <q-item-label caption v-if="opt.department">
                    {{ opt.department }}
                  </q-item-label>
                  <q-item-label caption v-if="opt.workload !== undefined">
                    {{ $t('tickets.bulk.assign.currentWorkload') }}: {{ opt.workload }}
                    {{ $t('tickets.bulk.assign.tickets') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side v-if="opt.online !== undefined">
                  <q-chip
                    :color="opt.online ? 'green' : 'grey'"
                    text-color="white"
                    :label="opt.online ? $t('common.online') : $t('common.offline')"
                    size="sm"
                    dense
                  />
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:selected-item="{ opt }">
              <div class="row items-center">
                <q-avatar size="24px" class="q-mr-sm">
                  <q-icon name="person" />
                </q-avatar>
                <div>
                  <div class="text-body2">{{ opt.label }}</div>
                  <div class="text-caption text-grey-6" v-if="opt.department">
                    {{ opt.department }}
                  </div>
                </div>
              </div>
            </template>

            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ $t('tickets.bulk.assign.noStaffFound') }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Assignment Comment -->
          <q-input
            v-model="form.comment"
            :label="$t('tickets.bulk.assign.comment')"
            :hint="$t('tickets.bulk.assign.commentHint')"
            type="textarea"
            outlined
            dense
            rows="3"
            autogrow
            maxlength="500"
            counter
          />

          <!-- Assignment Options -->
          <div class="q-gutter-sm">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('tickets.bulk.assign.options') }}
            </div>

            <q-checkbox
              v-model="form.notify_assignee"
              :label="$t('tickets.bulk.assign.notifyAssignee')"
              color="primary"
            />

            <q-checkbox
              v-model="form.notify_clients"
              :label="$t('tickets.bulk.assign.notifyClients')"
              color="primary"
            />

            <q-checkbox
              v-model="form.change_status"
              :label="$t('tickets.bulk.assign.changeStatus')"
              color="primary"
            />

            <!-- Status Selection (if enabled) -->
            <q-slide-transition>
              <q-select
                v-show="form.change_status"
                v-model="form.new_status"
                :options="statusOptions"
                :label="$t('tickets.bulk.assign.newStatus')"
                :hint="$t('tickets.bulk.assign.newStatusHint')"
                outlined
                dense
                emit-value
                map-options
                class="q-ml-lg"
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
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-slide-transition>
          </div>

          <!-- Preview Changes -->
          <q-expansion-item
            icon="preview"
            :label="$t('tickets.bulk.assign.previewChanges')"
            class="q-mt-md"
          >
            <q-card>
              <q-card-section>
                <div class="text-body2 q-mb-sm">
                  {{ $t('tickets.bulk.assign.changesPreview') }}:
                </div>
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="person_add" color="blue" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{
                          $t('tickets.bulk.assign.willAssign', {
                            count: tickets.length,
                            assignee: getAssigneeName(),
                          })
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.change_status && form.new_status">
                    <q-item-section avatar>
                      <q-icon name="update" color="green" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{
                          $t('tickets.bulk.assign.willChangeStatus', {
                            status: getStatusLabel(form.new_status),
                          })
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.comment">
                    <q-item-section avatar>
                      <q-icon name="comment" color="orange" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.assign.willAddComment') }}
                      </q-item-label>
                      <q-item-label caption> "{{ form.comment }}" </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="form.notify_assignee || form.notify_clients">
                    <q-item-section avatar>
                      <q-icon name="notifications" color="purple" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ $t('tickets.bulk.assign.willSendNotifications') }}
                      </q-item-label>
                      <q-item-label caption>
                        <span v-if="form.notify_assignee">{{
                          $t('tickets.bulk.assign.toAssignee')
                        }}</span>
                        <span v-if="form.notify_assignee && form.notify_clients">, </span>
                        <span v-if="form.notify_clients">{{
                          $t('tickets.bulk.assign.toClients')
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
        <q-btn :label="$t('common.cancel')" color="grey" v-close-popup :disable="assigning" />
        <q-btn
          :label="$t('tickets.bulk.assign.assignTickets', { count: tickets.length })"
          color="primary"
          @click="assignTickets"
          :loading="assigning"
          icon="person_add"
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
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

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

const emit = defineEmits(['update:modelValue', 'assigned'])

const $q = useQuasar()
const { t } = useI18n()

// Local dialog state
const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// State
const assigning = ref(false)
const assignForm = ref(null)

// Form data
const form = ref({
  assigned_to: '',
  comment: '',
  notify_assignee: true,
  notify_clients: false,
  change_status: false,
  new_status: 'in_progress',
})

// Options
const staffOptions = ref([])
const allStaffOptions = ref([])
// Searchable select for staff
const staffSearch = useSearchableSelect(staffOptions)

// Computed
const statusOptions = computed(() => [
  { label: t('tickets.statuses.open'), value: 'open' },
  { label: t('tickets.statuses.in_progress'), value: 'in_progress' },
  { label: t('tickets.statuses.waiting_client'), value: 'waiting_client' },
])

// Methods
const assignTickets = async () => {
  if (!assignForm.value.validate()) {
    return
  }

  assigning.value = true
  try {
    const ticketIds = props.tickets.map((ticket) => ticket.id)

    const assignmentData = {
      ticket_ids: ticketIds,
      assigned_to: form.value.assigned_to,
      comment: form.value.comment || null,
      notify_assignee: form.value.notify_assignee,
      notify_clients: form.value.notify_clients,
    }

    // Add status change if enabled
    if (form.value.change_status && form.value.new_status) {
      assignmentData.new_status = form.value.new_status
    }

    const response = await TicketsApi.bulkAssignTickets(assignmentData)

    if (response.data.success) {
      $q.notify({
        color: 'positive',
        message: t('tickets.bulk.assign.success', { count: ticketIds.length }),
        caption: t('tickets.bulk.assign.successDetails', {
          assignee: getAssigneeName(),
        }),
        icon: 'check_circle',
      })

      resetForm()
      showDialog.value = false
      emit('assigned')
    }
  } catch (error) {
    console.error('Error bulk assigning tickets:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.bulk.assign.error'),
      caption: error.response?.data?.message || t('tickets.bulk.assign.errorDetails'),
      icon: 'error',
    })
  } finally {
    assigning.value = false
  }
}

const resetForm = () => {
  form.value = {
    assigned_to: '',
    comment: '',
    notify_assignee: true,
    notify_clients: false,
    change_status: false,
    new_status: 'in_progress',
  }

  if (assignForm.value) {
    assignForm.value.resetValidation()
  }
}

const onDialogHide = () => {
  resetForm()
}

const loadStaff = async () => {
  try {
    const response = await TicketsApi.getStaff()
    if (response.data.success) {
      allStaffOptions.value = response.data.staff.map((user) => ({
        label: user.label || `${user.first_name} ${user.last_name}`,
        value: user.id,
        email: user.email,
        department: user.department || 'Support',
        workload: 0, // TODO: Add workload calculation
        online: true, // TODO: Add online status
      }))
      staffOptions.value = [...allStaffOptions.value]
      staffSearch.initializeOptions(staffOptions.value)
    }
  } catch (error) {
    console.error('Error loading staff:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

const getAssigneeName = () => {
  if (!form.value.assigned_to) return ''
  const assignee = allStaffOptions.value.find((staff) => staff.value === form.value.assigned_to)
  return assignee ? assignee.label : ''
}

const getStatusLabel = (status) => {
  const statusOption = statusOptions.value.find((opt) => opt.value === status)
  return statusOption ? statusOption.label : status
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

// Load staff when dialog opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadStaff()
    }
  },
)
</script>
