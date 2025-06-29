<template>
  <q-dialog v-model="showDialog" persistent @hide="onDialogHide">
    <q-card style="min-width: 600px; max-width: 800px; width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('tickets.createTicket.title') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg scroll" style="max-height: 70vh">
        <q-form @submit="createTicket" ref="ticketForm" class="q-gutter-md">
          <!-- Client Selection -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.client_id"
                :options="clientOptions"
                :label="$t('tickets.createTicket.client')"
                :hint="$t('tickets.createTicket.clientHint')"
                outlined
                dense
                emit-value
                map-options
                use-input
                input-debounce="300"
                :loading="loadingClients"
                @filter="filterClients"
                :rules="[(val) => !!val || $t('tickets.createTicket.clientRequired')]"
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
                      <q-item-label caption v-if="opt.email">{{ opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ $t('tickets.createTicket.noClientsFound') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Object Selection (if client has objects) -->
            <div class="col-12 col-md-6" v-if="clientObjects.length > 0">
              <q-select
                v-model="form.object_id"
                :options="clientObjects"
                :label="$t('tickets.createTicket.object')"
                :hint="$t('tickets.createTicket.objectHint')"
                outlined
                dense
                emit-value
                map-options
                clearable
              >
                <template v-slot:option="{ opt }">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="directions_car" color="orange" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.label }}</q-item-label>
                      <q-item-label caption v-if="opt.description">{{
                        opt.description
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Title -->
          <q-input
            v-model="form.title"
            :label="$t('tickets.createTicket.title')"
            :hint="$t('tickets.createTicket.titleHint')"
            outlined
            dense
            :rules="[
              (val) => !!val || $t('tickets.createTicket.titleRequired'),
              (val) => val.length >= 10 || $t('tickets.createTicket.titleMinLength'),
              (val) => val.length <= 200 || $t('tickets.createTicket.titleMaxLength'),
            ]"
            counter
            maxlength="200"
          />

          <!-- Description -->
          <q-input
            v-model="form.description"
            :label="$t('tickets.createTicket.description')"
            :hint="$t('tickets.createTicket.descriptionHint')"
            type="textarea"
            outlined
            dense
            rows="4"
            autogrow
            :rules="[
              (val) => !!val || $t('tickets.createTicket.descriptionRequired'),
              (val) => val.length >= 20 || $t('tickets.createTicket.descriptionMinLength'),
              (val) => val.length <= 2000 || $t('tickets.createTicket.descriptionMaxLength'),
            ]"
            counter
            maxlength="2000"
          />

          <!-- Category and Priority -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.category_id"
                :options="categoryOptions"
                :label="$t('tickets.createTicket.category')"
                :hint="$t('tickets.createTicket.categoryHint')"
                outlined
                dense
                emit-value
                map-options
                clearable
              >
                <template v-slot:option="{ opt }">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="folder" color="blue-grey" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.label }}</q-item-label>
                      <q-item-label caption v-if="opt.description">{{
                        opt.description
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.priority"
                :options="priorityOptions"
                :label="$t('tickets.createTicket.priority')"
                :hint="$t('tickets.createTicket.priorityHint')"
                outlined
                dense
                emit-value
                map-options
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
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Assigned To and Status -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.assigned_to"
                :options="staffOptions"
                :label="$t('tickets.createTicket.assignTo')"
                :hint="$t('tickets.createTicket.assignToHint')"
                outlined
                dense
                emit-value
                map-options
                clearable
                use-input
                input-debounce="300"
                @filter="filterStaff"
              >
                <template v-slot:option="{ opt }">
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="24px">
                        <q-icon name="person" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.label }}</q-item-label>
                      <q-item-label caption v-if="opt.email">{{ opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                :label="$t('tickets.createTicket.initialStatus')"
                :hint="$t('tickets.createTicket.statusHint')"
                outlined
                dense
                emit-value
                map-options
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
            </div>
          </div>

          <!-- Due Date -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.due_date"
                :label="$t('tickets.createTicket.dueDate')"
                :hint="$t('tickets.createTicket.dueDateHint')"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.due_date" mask="YYYY-MM-DD" :options="dueDateOptions">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup :label="$t('common.close')" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- Estimated Hours -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.estimated_hours"
                :label="$t('tickets.createTicket.estimatedHours')"
                :hint="$t('tickets.createTicket.estimatedHoursHint')"
                type="number"
                outlined
                dense
                min="0"
                step="0.5"
                suffix="h"
              />
            </div>
          </div>

          <!-- File Attachments -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('tickets.createTicket.attachments') }}</div>
            <q-file
              v-model="attachments"
              :label="$t('tickets.createTicket.selectFiles')"
              :hint="$t('tickets.createTicket.filesHint')"
              outlined
              dense
              multiple
              counter
              max-files="5"
              max-file-size="10485760"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              @rejected="onFileRejected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>

              <template v-slot:file="{ file }">
                <q-chip
                  :label="file.name"
                  removable
                  @remove="removeFile(file)"
                  color="primary"
                  text-color="white"
                  icon="insert_drive_file"
                />
              </template>
            </q-file>
          </div>

          <!-- Additional Options -->
          <q-expansion-item
            icon="settings"
            :label="$t('tickets.createTicket.additionalOptions')"
            class="q-mb-md"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Email Notifications -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.notify_client"
                      :label="$t('tickets.createTicket.notifyClient')"
                      color="primary"
                    />
                  </div>

                  <div class="col-12">
                    <q-checkbox
                      v-model="form.notify_assigned"
                      :label="$t('tickets.createTicket.notifyAssigned')"
                      color="primary"
                    />
                  </div>

                  <!-- Tags -->
                  <div class="col-12">
                    <q-select
                      v-model="form.tags"
                      :options="tagOptions"
                      :label="$t('tickets.createTicket.tags')"
                      :hint="$t('tickets.createTicket.tagsHint')"
                      outlined
                      dense
                      multiple
                      use-chips
                      use-input
                      new-value-mode="add-unique"
                      @new-value="createTag"
                    />
                  </div>

                  <!-- Internal Notes -->
                  <div class="col-12">
                    <q-input
                      v-model="form.internal_notes"
                      :label="$t('tickets.createTicket.internalNotes')"
                      :hint="$t('tickets.createTicket.internalNotesHint')"
                      type="textarea"
                      outlined
                      dense
                      rows="2"
                      autogrow
                      maxlength="500"
                      counter
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn :label="$t('common.cancel')" color="grey" v-close-popup :disable="creating" />
        <q-btn
          :label="$t('tickets.createTicket.createTicket')"
          color="primary"
          @click="createTicket"
          :loading="creating"
          icon="add"
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
})

const emit = defineEmits(['update:modelValue', 'ticket-created'])

const $q = useQuasar()
const { t } = useI18n()

// Local dialog state
const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// State
const creating = ref(false)
const loadingClients = ref(false)
const ticketForm = ref(null)
const attachments = ref([])

// Form data
const form = ref({
  client_id: '',
  object_id: '',
  title: '',
  description: '',
  category_id: '',
  priority: 'medium',
  assigned_to: '',
  status: 'open',
  due_date: '',
  estimated_hours: null,
  notify_client: true,
  notify_assigned: true,
  tags: [],
  internal_notes: '',
})

// Options
const clientOptions = ref([])
const clientObjects = ref([])
const categoryOptions = ref([])
const staffOptions = ref([])
const allStaffOptions = ref([])
const tagOptions = ref([])

// Computed
const priorityOptions = computed(() => [
  { label: t('tickets.priorities.low'), value: 'low' },
  { label: t('tickets.priorities.medium'), value: 'medium' },
  { label: t('tickets.priorities.high'), value: 'high' },
  { label: t('tickets.priorities.urgent'), value: 'urgent' },
])

const statusOptions = computed(() => [
  { label: t('tickets.statuses.open'), value: 'open' },
  { label: t('tickets.statuses.in_progress'), value: 'in_progress' },
])

const dueDateOptions = (dateStr) => {
  // Only allow future dates
  return dateStr >= date.formatDate(new Date(), 'YYYY/MM/DD')
}

// Methods
const createTicket = async () => {
  if (!ticketForm.value.validate()) {
    return
  }

  creating.value = true
  try {
    const formData = new FormData()

    // Add form fields
    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null && form.value[key] !== '' && form.value[key] !== undefined) {
        if (Array.isArray(form.value[key])) {
          form.value[key].forEach((item) => {
            formData.append(`${key}[]`, item)
          })
        } else {
          formData.append(key, form.value[key])
        }
      }
    })

    // Add attachments
    if (attachments.value && attachments.value.length > 0) {
      attachments.value.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file)
      })
    }

    const response = await TicketsApi.createTicket(formData)

    if (response.data.success) {
      $q.notify({
        color: 'positive',
        message: t('tickets.createTicket.success'),
        caption: t('tickets.createTicket.successDetails', {
          number: response.data.ticket.ticket_number,
        }),
        icon: 'check_circle',
      })

      resetForm()
      showDialog.value = false
      emit('ticket-created', response.data.ticket)
    }
  } catch (error) {
    console.error('Error creating ticket:', error)
    $q.notify({
      color: 'negative',
      message: t('tickets.createTicket.error'),
      caption: error.response?.data?.message || t('tickets.createTicket.errorDetails'),
      icon: 'error',
    })
  } finally {
    creating.value = false
  }
}

const resetForm = () => {
  form.value = {
    client_id: '',
    object_id: '',
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    assigned_to: '',
    status: 'open',
    due_date: '',
    estimated_hours: null,
    notify_client: true,
    notify_assigned: true,
    tags: [],
    internal_notes: '',
  }
  attachments.value = []
  clientObjects.value = []

  if (ticketForm.value) {
    ticketForm.value.resetValidation()
  }
}

const onDialogHide = () => {
  resetForm()
}

const filterClients = async (val, update) => {
  if (val.length < 2) {
    update(() => {
      clientOptions.value = []
    })
    return
  }

  loadingClients.value = true
  try {
    // This would be a clients search API call
    update(() => {
      clientOptions.value = [
        {
          label: `${val} Company`,
          value: 'client1',
          email: `contact@${val.toLowerCase()}.com`,
        },
        {
          label: `${val} LLC`,
          value: 'client2',
          email: `info@${val.toLowerCase()}llc.com`,
        },
      ]
    })
  } catch (error) {
    console.error('Error searching clients:', error)
  } finally {
    loadingClients.value = false
  }
}

const loadClientObjects = async (clientId) => {
  if (!clientId) {
    clientObjects.value = []
    return
  }

  try {
    // This would be a client objects API call
    clientObjects.value = [
      { label: 'Vehicle #1', value: 'obj1', description: 'Mercedes Sprinter' },
      { label: 'Vehicle #2', value: 'obj2', description: 'Ford Transit' },
    ]
  } catch (error) {
    console.error('Error loading client objects:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await TicketsApi.getCategories()
    categoryOptions.value = response.data.categories.map((cat) => ({
      label: cat.name.startsWith('tickets.categories.')
        ? t(cat.name)
        : t(`tickets.categories.${cat.name}`),
      value: cat.id,
    }))
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const loadStaff = async () => {
  try {
    const response = await TicketsApi.getStaff()
    if (response.data.success) {
      allStaffOptions.value = response.data.staff.map((user) => ({
        label: user.label || `${user.first_name} ${user.last_name}`,
        value: user.id,
        email: user.email,
      }))
      staffOptions.value = [...allStaffOptions.value]
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

const filterStaff = (val, update) => {
  update(() => {
    if (val === '') {
      staffOptions.value = allStaffOptions.value
    } else {
      const needle = val.toLowerCase()
      staffOptions.value = allStaffOptions.value.filter(
        (option) => option.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const loadTags = async () => {
  try {
    // This would be a tags API call
    tagOptions.value = ['urgent', 'hardware', 'software', 'network', 'maintenance', 'installation']
  } catch (error) {
    console.error('Error loading tags:', error)
  }
}

const createTag = (val) => {
  if (val && val.length > 0) {
    if (!tagOptions.value.includes(val)) {
      tagOptions.value.push(val)
    }
    return val
  }
}

const removeFile = (file) => {
  const index = attachments.value.indexOf(file)
  if (index > -1) {
    attachments.value.splice(index, 1)
  }
}

const onFileRejected = (rejectedEntries) => {
  rejectedEntries.forEach((entry) => {
    if (entry.failedPropValidation === 'max-file-size') {
      $q.notify({
        color: 'negative',
        message: t('tickets.createTicket.fileTooLarge', { name: entry.file.name }),
        icon: 'error',
      })
    } else if (entry.failedPropValidation === 'accept') {
      $q.notify({
        color: 'negative',
        message: t('tickets.createTicket.fileTypeNotAllowed', { name: entry.file.name }),
        icon: 'error',
      })
    }
  })
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

const getStatusColor = (status) => {
  const colors = {
    open: 'blue',
    in_progress: 'orange',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    open: 'fiber_new',
    in_progress: 'play_arrow',
  }
  return icons[status] || 'help'
}

// Watch for client changes to load objects
watch(
  () => form.value.client_id,
  (newClientId) => {
    loadClientObjects(newClientId)
    form.value.object_id = '' // Reset object selection
  },
)

// Load initial data when dialog opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadCategories()
      loadStaff()
      loadTags()
    }
  },
)
</script>

<style scoped>
:deep(.q-field__counter) {
  color: var(--q-primary);
}

.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
