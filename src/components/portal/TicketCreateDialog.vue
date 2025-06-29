<template>
  <q-dialog v-model="show" persistent>
    <q-card style="width: 600px; max-width: 90vw">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ $t('tickets.create') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="createTicket" class="q-gutter-md">
          <!-- Title -->
          <q-input
            v-model="form.title"
            :label="$t('tickets.ticketTitle')"
            filled
            :rules="[(val) => !!val || $t('validation.required')]"
            maxlength="500"
            counter
          />

          <!-- Category -->
          <q-select
            v-model="form.category_id"
            :options="categoryOptions"
            :label="$t('tickets.category')"
            filled
            emit-value
            map-options
            :rules="[(val) => !!val || $t('validation.required')]"
          />

          <!-- Object -->
          <q-select
            v-model="form.object_id"
            :options="objectOptions"
            :label="$t('tickets.object')"
            filled
            emit-value
            map-options
            clearable
          />

          <!-- Priority -->
          <q-select
            v-model="form.priority"
            :options="priorityOptions"
            :label="$t('tickets.priority')"
            filled
            emit-value
            map-options
          />

          <!-- Description -->
          <q-input
            v-model="form.description"
            :label="$t('tickets.description')"
            type="textarea"
            filled
            rows="4"
            maxlength="2000"
            counter
            :rules="[(val) => !!val || $t('validation.required')]"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="$t('common.cancel')" v-close-popup :disable="loading" />
        <q-btn
          color="primary"
          :label="$t('tickets.create')"
          @click="createTicket"
          :loading="loading"
          :disable="!isFormValid"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TicketsApi } from 'src/api/tickets'
import { Notify } from 'quasar'

const { t: $t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  objects: {
    type: Array,
    default: () => [],
  },
  preselectedObjectId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'created'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const loading = ref(false)

const form = ref({
  title: '',
  category_id: null,
  object_id: null,
  priority: 'medium',
  description: '',
})

// Options for selects
const categoryOptions = computed(() =>
  props.categories.map((cat) => ({
    label: cat.name.startsWith('tickets.') ? $t(cat.name) : cat.name,
    value: cat.id,
  })),
)

const objectOptions = computed(() =>
  props.objects.map((obj) => ({
    label: `${obj.name} (${obj.wialon_id})`,
    value: obj.id,
  })),
)

const priorityOptions = [
  { label: $t('tickets.priorities.low'), value: 'low' },
  { label: $t('tickets.priorities.medium'), value: 'medium' },
  { label: $t('tickets.priorities.high'), value: 'high' },
  { label: $t('tickets.priorities.urgent'), value: 'urgent' },
]

const isFormValid = computed(() => {
  return !!(form.value.title && form.value.category_id && form.value.description)
})

// Watch for preselected object
watch(
  () => props.preselectedObjectId,
  (newVal) => {
    if (newVal && show.value) {
      form.value.object_id = newVal
    }
  },
  { immediate: true },
)

// Reset form when dialog opens
watch(show, (newVal) => {
  if (newVal) {
    resetForm()
    if (props.preselectedObjectId) {
      form.value.object_id = props.preselectedObjectId
    }
  }
})

const resetForm = () => {
  form.value = {
    title: '',
    category_id: null,
    object_id: null,
    priority: 'medium',
    description: '',
  }
}

const createTicket = async () => {
  if (!isFormValid.value) {
    Notify.create({
      type: 'negative',
      message: $t('validation.fillRequired'),
    })
    return
  }

  try {
    loading.value = true

    const response = await TicketsApi.createTicket(form.value)

    if (response.data.success) {
      emit('created', response.data.ticket)
      show.value = false
      resetForm()
    }
  } catch (error) {
    console.error('Error creating ticket:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || $t('tickets.createError'),
    })
  } finally {
    loading.value = false
  }
}
</script>
