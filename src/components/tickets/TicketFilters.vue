<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center">
        <div class="text-subtitle2">{{ $t('tickets.filters.title') }}</div>
        <q-space />
        <q-btn
          flat
          dense
          :icon="showFilters ? 'expand_less' : 'expand_more'"
          :label="showFilters ? $t('common.hideFilters') : $t('common.showFilters')"
          @click="showFilters = !showFilters"
        />
      </div>
    </q-card-section>

    <q-slide-transition>
      <q-card-section v-show="showFilters" class="q-pt-none">
        <div class="row q-col-gutter-md">
          <!-- Search -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="localFilters.search"
              :label="$t('tickets.filters.search')"
              outlined
              dense
              clearable
              @update:model-value="debouncedEmit"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Category -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="localFilters.category_id"
              :options="categoryOptions"
              :label="$t('tickets.filters.category')"
              outlined
              dense
              emit-value
              map-options
              clearable
              @update:model-value="emitChange"
            />
          </div>

          <!-- Priority -->
          <div class="col-12 col-md-2">
            <q-select
              v-model="localFilters.priority"
              :options="priorityOptions"
              :label="$t('tickets.filters.priority')"
              outlined
              dense
              emit-value
              map-options
              clearable
              @update:model-value="emitChange"
            />
          </div>

          <!-- Assigned To -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="localFilters.assigned_to"
              :options="staffOptions"
              :label="$t('tickets.filters.assignedTo')"
              outlined
              dense
              emit-value
              map-options
              clearable
              use-input
              input-debounce="300"
              @filter="filterStaff"
              @update:model-value="emitChange"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar size="24px">
                      <q-icon name="person" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Clear Filters -->
          <div class="col-12 col-md-1">
            <q-btn
              flat
              dense
              color="negative"
              icon="clear"
              :label="$t('common.clearFilters')"
              @click="clearFilters"
              class="full-width"
            />
          </div>
        </div>

        <!-- Quick Filters -->
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-auto">
            <q-chip
              clickable
              :color="localFilters.assigned_to === 'unassigned' ? 'primary' : 'grey-4'"
              :text-color="localFilters.assigned_to === 'unassigned' ? 'white' : 'black'"
              icon="person_off"
              :label="$t('tickets.filters.unassigned')"
              @click="toggleUnassigned"
            />
          </div>

          <div class="col-auto">
            <q-chip
              clickable
              :color="localFilters.assigned_to === currentUserId ? 'primary' : 'grey-4'"
              :text-color="localFilters.assigned_to === currentUserId ? 'white' : 'black'"
              icon="person"
              :label="$t('tickets.filters.assignedToMe')"
              @click="toggleAssignedToMe"
            />
          </div>

          <div class="col-auto">
            <q-chip
              clickable
              :color="localFilters.priority === 'urgent' ? 'red' : 'grey-4'"
              :text-color="localFilters.priority === 'urgent' ? 'white' : 'black'"
              icon="priority_high"
              :label="$t('tickets.filters.urgentOnly')"
              @click="toggleUrgent"
            />
          </div>

          <div class="col-auto">
            <q-chip
              clickable
              :color="localFilters.priority === 'high' ? 'orange' : 'grey-4'"
              :text-color="localFilters.priority === 'high' ? 'white' : 'black'"
              icon="warning"
              :label="$t('tickets.filters.highPriorityOnly')"
              @click="toggleHighPriority"
            />
          </div>
        </div>
      </q-card-section>
    </q-slide-transition>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth'
import { TicketsApi } from 'src/api/tickets'
import { debounce } from 'quasar'
import { UsersApi } from 'src/api/users'

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['filter-change'])

const { t } = useI18n()
const authStore = useAuthStore()

// State
const showFilters = ref(false)
const localFilters = ref({ ...props.filters })
const categoryOptions = ref([])
const staffOptions = ref([])
const allStaffOptions = ref([])

// Computed
const currentUserId = computed(() => authStore.user?.id)

const priorityOptions = computed(() => [
  { label: t('tickets.priorities.low'), value: 'low' },
  { label: t('tickets.priorities.medium'), value: 'medium' },
  { label: t('tickets.priorities.high'), value: 'high' },
  { label: t('tickets.priorities.urgent'), value: 'urgent' },
])

// Methods
const emitChange = () => {
  emit('filter-change')
}

const debouncedEmit = debounce(() => {
  emitChange()
}, 500)

const clearFilters = () => {
  localFilters.value = {
    search: '',
    category_id: '',
    priority: '',
    assigned_to: '',
  }
  emitChange()
}

const toggleUnassigned = () => {
  if (localFilters.value.assigned_to === 'unassigned') {
    localFilters.value.assigned_to = ''
  } else {
    localFilters.value.assigned_to = 'unassigned'
  }
  emitChange()
}

const toggleAssignedToMe = () => {
  if (localFilters.value.assigned_to === currentUserId.value) {
    localFilters.value.assigned_to = ''
  } else {
    localFilters.value.assigned_to = currentUserId.value
  }
  emitChange()
}

const toggleUrgent = () => {
  if (localFilters.value.priority === 'urgent') {
    localFilters.value.priority = ''
  } else {
    localFilters.value.priority = 'urgent'
  }
  emitChange()
}

const toggleHighPriority = () => {
  if (localFilters.value.priority === 'high') {
    localFilters.value.priority = ''
  } else {
    localFilters.value.priority = 'high'
  }
  emitChange()
}

const fetchCategories = async () => {
  try {
    const response = await TicketsApi.getCategories()
    categoryOptions.value = [
      { label: t('common.all'), value: '' },
      ...response.data.categories.map((cat) => ({
        label: t(`tickets.categories.${cat.name}`),
        value: cat.id,
      })),
    ]
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchStaff = async () => {
  try {
    // Використовуємо існуючий API для користувачів
    const response = await UsersApi.getUsers({
      perPage: 'All', // Отримуємо всіх користувачів
      sortBy: 'first_name',
    })

    allStaffOptions.value = [
      { label: t('tickets.filters.unassigned'), value: 'unassigned' },
      ...response.data.users.map((user) => ({
        label: `${user.first_name} ${user.last_name}`,
        value: user.id,
      })),
    ]
    staffOptions.value = [...allStaffOptions.value]
  } catch (error) {
    console.error('Error fetching staff:', error)
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

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters }
  },
  { deep: true },
)

// Watch for local filter changes
watch(
  localFilters,
  (newFilters) => {
    // Update parent component filters
    Object.assign(props.filters, newFilters)
  },
  { deep: true },
)

// Initial load
onMounted(() => {
  fetchCategories()
  fetchStaff()
})
</script>

<style scoped>
.q-chip {
  cursor: pointer;
  transition: all 0.3s ease;
}

.q-chip:hover {
  transform: scale(1.05);
}
</style>
