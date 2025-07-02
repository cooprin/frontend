<template>
  <q-dialog v-model="showDialog" persistent @hide="onDialogHide">
    <q-card style="min-width: 500px; max-width: 700px; width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('tickets.createTicket.title') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
        <q-form @submit="createTicket" ref="ticketForm" class="q-gutter-md">
          <!-- Client Selection -->
          <q-select
            v-model="form.client_id"
            :options="clientSearch.filteredOptions.value"
            :label="$t('tickets.createTicket.client')"
            outlined
            dense
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="(val, update) => clientSearch.filterOptions(val, update)"
            @popup-show="clientSearch.resetFilter"
            :loading="loadingClients"
            :rules="[(val) => !!val || $t('tickets.createTicket.clientRequired')]"
            clearable
          />

          <!-- Title -->
          <q-input
            v-model="form.title"
            :label="$t('tickets.createTicket.title')"
            outlined
            dense
            :rules="[
              (val) => !!val || $t('tickets.createTicket.titleRequired'),
              (val) => val.length >= 10 || $t('tickets.createTicket.titleMinLength'),
            ]"
            counter
            maxlength="200"
          />

          <!-- Description -->
          <q-input
            v-model="form.description"
            :label="$t('tickets.createTicket.description')"
            type="textarea"
            outlined
            dense
            rows="4"
            autogrow
            :rules="[
              (val) => !!val || $t('tickets.createTicket.descriptionRequired'),
              (val) => val.length >= 20 || $t('tickets.createTicket.descriptionMinLength'),
            ]"
            counter
            maxlength="2000"
          />

          <!-- Category, Priority, Assigned To -->
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-select
                v-model="form.category_id"
                :options="categorySearch.filteredOptions.value"
                :label="$t('tickets.createTicket.category')"
                outlined
                dense
                emit-value
                map-options
                option-label="label"
                option-value="value"
                use-input
                input-debounce="300"
                @filter="(val, update) => categorySearch.filterOptions(val, update)"
                @popup-show="categorySearch.resetFilter"
                clearable
              />
            </div>

            <div class="col-4">
              <q-select
                v-model="form.priority"
                :options="priorityOptions"
                :label="$t('tickets.createTicket.priority')"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <div class="col-4">
              <q-select
                v-model="form.assigned_to"
                :options="staffSearch.filteredOptions.value"
                :label="$t('tickets.createTicket.assignTo')"
                outlined
                dense
                emit-value
                map-options
                use-input
                input-debounce="300"
                @filter="(val, update) => staffSearch.filterOptions(val, update)"
                @popup-show="staffSearch.resetFilter"
                clearable
              />
            </div>
          </div>

          <!-- Due Date -->
          <q-input
            v-model="form.due_date"
            :label="$t('tickets.createTicket.dueDate')"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { TicketsApi } from 'src/api/tickets'
import { ClientsApi } from 'src/api/clients'
import { date } from 'quasar'
import { useSearchableSelect } from 'src/composables/useSearchableSelect'

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

// Form data
const form = ref({
  client_id: null,
  title: '',
  description: '',
  category_id: null,
  priority: 'medium',
  assigned_to: null,
  due_date: '',
})

// Options
const clientOptions = ref([])
const categoryOptions = ref([])
const staffOptions = ref([])
const allStaffOptions = ref([])

// Searchable selects
const clientSearch = useSearchableSelect(clientOptions)
const categorySearch = useSearchableSelect(categoryOptions)
const staffSearch = useSearchableSelect(staffOptions)

// Computed
const priorityOptions = computed(() => [
  { label: t('tickets.priorities.low'), value: 'low' },
  { label: t('tickets.priorities.medium'), value: 'medium' },
  { label: t('tickets.priorities.high'), value: 'high' },
  { label: t('tickets.priorities.urgent'), value: 'urgent' },
])

const dueDateOptions = (dateStr) => {
  return dateStr >= date.formatDate(new Date(), 'YYYY/MM/DD')
}

// Methods
const createTicket = async () => {
  if (!ticketForm.value.validate()) {
    return
  }

  creating.value = true
  try {
    const response = await TicketsApi.createTicket(form.value)

    if (response.data.success) {
      $q.notify({
        color: 'positive',
        message: t('tickets.createTicket.success'),
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
      icon: 'error',
    })
  } finally {
    creating.value = false
  }
}

const resetForm = () => {
  form.value = {
    client_id: null,
    title: '',
    description: '',
    category_id: null,
    priority: 'medium',
    assigned_to: null,
    due_date: '',
  }

  if (ticketForm.value) {
    ticketForm.value.resetValidation()
  }
}

const onDialogHide = () => {
  resetForm()
}

const loadInitialClients = async () => {
  loadingClients.value = true
  try {
    const response = await ClientsApi.getClients({
      is_active: true,
      perPage: 'All',
    })

    clientOptions.value = response.data.clients.map((client) => ({
      label: client.name,
      value: client.id,
    }))
    clientSearch.initializeOptions(clientOptions.value)
  } catch (error) {
    console.error('Error loading initial clients:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loadingClients.value = false
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
    categorySearch.initializeOptions(categoryOptions.value)
  } catch (error) {
    console.error('Error loading categories:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

const loadStaff = async () => {
  try {
    const response = await TicketsApi.getStaff()
    if (response.data.success) {
      allStaffOptions.value = response.data.staff.map((user) => ({
        label: user.label || `${user.first_name} ${user.last_name}`,
        value: user.id,
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

// Load data when dialog opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadCategories()
      loadStaff()
      loadInitialClients()
    }
  },
)

// Load data on mount if dialog is already open
onMounted(() => {
  if (props.modelValue) {
    loadCategories()
    loadStaff()
    loadInitialClients()
  }
})
</script>
