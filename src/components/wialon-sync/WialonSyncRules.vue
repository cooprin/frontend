<template>
  <div>
    <!-- Панель управління -->
    <div class="row q-gutter-md q-mb-lg items-center">
      <q-btn
        :label="$t('wialonSync.rules.create')"
        color="primary"
        icon="add"
        @click="showCreateDialog"
      />

      <q-btn
        :label="$t('wialonSync.common.refresh')"
        color="secondary"
        icon="refresh"
        :loading="loading"
        @click="loadRules"
        outline
      />

      <q-space />

      <!-- Фільтри -->
      <q-select
        v-model="filters.type"
        :options="typeOptions"
        :label="$t('wialonSync.rules.columns.type')"
        dense
        outlined
        clearable
        style="min-width: 200px"
      />

      <q-toggle
        v-model="filters.activeOnly"
        :label="$t('wialonSync.rules.columns.isActive')"
        color="primary"
      />

      <!-- Пошук -->
      <q-input
        v-model="filter"
        :placeholder="$t('wialonSync.common.search')"
        dense
        outlined
        style="min-width: 250px"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Статистика -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-primary">{{ stats.total }}</div>
          <div class="text-caption">Всього правил</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-positive">{{ stats.active }}</div>
          <div class="text-caption">Активних</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-grey">{{ stats.inactive }}</div>
          <div class="text-caption">Неактивних</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-blue">{{ stats.executions }}</div>
          <div class="text-caption">Виконань сьогодні</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Таблиця правил -->
    <q-table
      :rows="filteredRules"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      @request="onRequest"
      binary-state-sort
      flat
      bordered
    >
      <!-- Тип правила -->
      <template v-slot:body-cell-rule_type="props">
        <q-td :props="props">
          <q-chip
            :color="getTypeColor(props.value)"
            text-color="white"
            :icon="getTypeIcon(props.value)"
            size="sm"
          >
            {{ $t(`wialonSync.rules.types.${props.value}`) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Порядок виконання -->
      <template v-slot:body-cell-execution_order="props">
        <q-td :props="props">
          <q-badge :color="props.value <= 5 ? 'positive' : 'orange'" :label="props.value" />
        </q-td>
      </template>

      <!-- Активність -->
      <template v-slot:body-cell-is_active="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.value"
            @update:model-value="toggleRuleActive(props.row, $event)"
            color="positive"
          />
        </q-td>
      </template>

      <!-- Останнє виконання -->
      <template v-slot:body-cell-last_execution="props">
        <q-td :props="props">
          <div v-if="props.value">
            {{ formatDateTime(props.value) }}
          </div>
          <span v-else class="text-grey-7">Ніколи</span>
        </q-td>
      </template>

      <!-- Дії -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="editRule(props.row)">
            <q-tooltip>{{ $t('wialonSync.rules.edit') }}</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="play_arrow"
            color="positive"
            :disable="!props.row.is_active"
            @click="executeRule(props.row)"
          >
            <q-tooltip>Виконати правило</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="visibility" @click="showRuleDetails(props.row)">
            <q-tooltip>{{ $t('wialonSync.common.showDetails') }}</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="delete" color="negative" @click="deleteRule(props.row)">
            <q-tooltip>Видалити</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Порожня таблиця -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm">
          <q-icon size="2em" name="rule" />
          <span>Правила синхронізації не знайдені</span>
        </div>
      </template>
    </q-table>

    <!-- Діалог створення/редагування правила -->
    <q-dialog v-model="showRuleDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">
            {{ editingRule ? $t('wialonSync.rules.edit') : $t('wialonSync.rules.create') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveRule" class="q-gutter-md">
            <div class="row q-gutter-md">
              <div class="col-12 col-md-8">
                <q-input
                  v-model="ruleForm.name"
                  :label="$t('wialonSync.rules.form.name')"
                  :rules="[(val) => !!val || 'Назва є обов\'язковою']"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="ruleForm.execution_order"
                  :label="$t('wialonSync.rules.form.executionOrder')"
                  type="number"
                  outlined
                  dense
                  min="1"
                  max="999"
                />
              </div>
            </div>

            <q-input
              v-model="ruleForm.description"
              :label="$t('wialonSync.rules.form.description')"
              type="textarea"
              outlined
              dense
              autogrow
            />

            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="ruleForm.rule_type"
                  :options="typeOptions"
                  :label="$t('wialonSync.rules.form.type')"
                  :rules="[(val) => !!val || 'Тип правила є обов\'язковим']"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="ruleForm.is_active"
                  :label="$t('wialonSync.rules.form.isActive')"
                  color="positive"
                />
              </div>
            </div>

            <q-input
              v-model="ruleForm.sql_query"
              :label="$t('wialonSync.rules.form.sqlQuery')"
              type="textarea"
              outlined
              rows="8"
              :rules="[(val) => !!val || 'SQL запит є обов\'язковим']"
            />

            <q-input
              v-model="parametersJson"
              :label="$t('wialonSync.rules.form.parameters')"
              type="textarea"
              outlined
              rows="4"
              hint='JSON формат: {"key": "value"}'
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn :label="$t('common.save')" color="primary" :loading="saving" @click="saveRule" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог деталей правила -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Деталі правила</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedRule">
          <div class="row q-gutter-md">
            <!-- Загальна інформація -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Загальна інформація</div>

                <div class="q-gutter-sm">
                  <div><strong>Назва:</strong> {{ selectedRule.name }}</div>
                  <div><strong>Опис:</strong> {{ selectedRule.description || '-' }}</div>
                  <div>
                    <strong>Тип:</strong>
                    <q-chip
                      :color="getTypeColor(selectedRule.rule_type)"
                      text-color="white"
                      size="sm"
                    >
                      {{ $t(`wialonSync.rules.types.${selectedRule.rule_type}`) }}
                    </q-chip>
                  </div>
                  <div><strong>Порядок виконання:</strong> {{ selectedRule.execution_order }}</div>
                  <div>
                    <strong>Активне:</strong>
                    <q-icon
                      :name="selectedRule.is_active ? 'check_circle' : 'cancel'"
                      :color="selectedRule.is_active ? 'positive' : 'negative'"
                    />
                  </div>
                  <div>
                    <strong>Створено:</strong> {{ formatDateTime(selectedRule.created_at) }}
                  </div>
                  <div><strong>Автор:</strong> {{ selectedRule.created_by_name || '-' }}</div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Статистика виконань -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Статистика виконань</div>

                <div class="q-gutter-sm">
                  <div>
                    <strong>Всього виконань:</strong> {{ selectedRule.total_executions || 0 }}
                  </div>
                  <div>
                    <strong>Останнє виконання:</strong>
                    {{
                      selectedRule.last_execution
                        ? formatDateTime(selectedRule.last_execution)
                        : 'Ніколи'
                    }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- SQL запит -->
            <q-card flat bordered class="col-12">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">SQL запит</div>

                <pre class="sql-query">{{ selectedRule.sql_query }}</pre>
              </q-card-section>
            </q-card>

            <!-- Параметри -->
            <q-card flat bordered class="col-12" v-if="selectedRule.parameters">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Параметри</div>

                <pre class="parameters">{{ JSON.stringify(selectedRule.parameters, null, 2) }}</pre>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :label="$t('wialonSync.rules.edit')"
            color="primary"
            @click="editRule(selectedRule)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { WialonSyncApi } from 'src/api/wialon-sync'

const $q = useQuasar()

// State
const loading = ref(false)
const saving = ref(false)
const rules = ref([])
const filter = ref('')
const showRuleDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedRule = ref(null)
const editingRule = ref(false)

// Фільтри
const filters = ref({
  type: null,
  activeOnly: false,
})

// Статистика
const stats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  executions: 0,
})

// Форма правила
const ruleForm = ref({
  name: '',
  description: '',
  rule_type: '',
  sql_query: '',
  parameters: {},
  execution_order: 1,
  is_active: true,
})

const parametersJson = ref('{}')

// Пагінація
const pagination = ref({
  sortBy: 'execution_order',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Опції для типів правил
const typeOptions = [
  { label: 'Зіставлення клієнтів', value: 'client_mapping' },
  { label: "Зіставлення об'єктів", value: 'object_mapping' },
  { label: 'Перевірка обладнання', value: 'equipment_check' },
  { label: 'Порівняння назв', value: 'name_comparison' },
  { label: 'Перевірка власників', value: 'owner_validation' },
  { label: 'Власне правило', value: 'custom' },
]

// Колонки таблиці
const columns = [
  {
    name: 'execution_order',
    required: true,
    label: 'Порядок',
    align: 'center',
    field: 'execution_order',
    sortable: true,
  },
  {
    name: 'name',
    required: true,
    label: 'Назва',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'rule_type',
    label: 'Тип',
    align: 'center',
    field: 'rule_type',
    sortable: true,
  },
  {
    name: 'is_active',
    label: 'Активне',
    align: 'center',
    field: 'is_active',
    sortable: true,
  },
  {
    name: 'total_executions',
    label: 'Виконань',
    align: 'center',
    field: 'total_executions',
    sortable: true,
  },
  {
    name: 'last_execution',
    label: 'Останнє виконання',
    align: 'center',
    field: 'last_execution',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Дії',
    align: 'center',
  },
]

// Computed
const filteredRules = computed(() => {
  let result = rules.value

  // Фільтр по типу
  if (filters.value.type) {
    result = result.filter((r) => r.rule_type === filters.value.type)
  }

  // Фільтр тільки активні
  if (filters.value.activeOnly) {
    result = result.filter((r) => r.is_active)
  }

  // Пошук
  if (filter.value) {
    const searchLower = filter.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.rule_type.toLowerCase().includes(searchLower),
    )
  }

  return result
})

// Methods
const loadRules = async () => {
  loading.value = true
  try {
    const response = await WialonSyncApi.getRules({
      limit: pagination.value.rowsPerPage,
      offset: (pagination.value.page - 1) * pagination.value.rowsPerPage,
    })

    rules.value = response.data.rules || []
    pagination.value.rowsNumber = response.data.pagination?.total || 0
    updateStats()
  } catch (error) {
    console.error('Error loading rules:', error)
    $q.notify({
      color: 'negative',
      message: 'Помилка завантаження правил синхронізації',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  editingRule.value = false
  ruleForm.value = {
    name: '',
    description: '',
    rule_type: '',
    sql_query: '',
    parameters: {},
    execution_order: rules.value.length + 1,
    is_active: true,
  }
  parametersJson.value = '{}'
  showRuleDialog.value = true
}

const editRule = (rule) => {
  editingRule.value = true
  ruleForm.value = { ...rule }
  parametersJson.value = JSON.stringify(rule.parameters || {}, null, 2)
  showDetailsDialog.value = false
  showRuleDialog.value = true
}

const saveRule = async () => {
  saving.value = true
  try {
    // Validate and parse parameters JSON
    try {
      const parsedParameters = JSON.parse(parametersJson.value)
      ruleForm.value.parameters = parsedParameters
    } catch {
      throw new Error('Невірний формат JSON для параметрів')
    }

    if (editingRule.value) {
      await WialonSyncApi.updateRule(ruleForm.value.id, ruleForm.value)
    } else {
      await WialonSyncApi.createRule(ruleForm.value)
    }

    $q.notify({
      color: 'positive',
      message: editingRule.value ? 'Правило оновлено' : 'Правило створено',
      icon: 'check',
    })

    showRuleDialog.value = false
    loadRules()
  } catch (error) {
    console.error('Error saving rule:', error)
    $q.notify({
      color: 'negative',
      message: error.message || 'Помилка збереження правила',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const toggleRuleActive = async (rule, isActive) => {
  try {
    await WialonSyncApi.updateRule(rule.id, { is_active: isActive })

    rule.is_active = isActive
    updateStats()

    $q.notify({
      color: 'positive',
      message: `Правило ${isActive ? 'активовано' : 'деактивовано'}`,
      icon: 'check',
    })
  } catch (error) {
    console.error('Error toggling rule:', error)
    $q.notify({
      color: 'negative',
      message: 'Помилка зміни статусу правила',
      icon: 'error',
    })
  }
}

const executeRule = async (rule) => {
  try {
    await WialonSyncApi.executeRule(rule.id)

    $q.notify({
      color: 'positive',
      message: `Правило "${rule.name}" виконано`,
      icon: 'play_arrow',
    })
  } catch (error) {
    console.error('Error executing rule:', error)
    $q.notify({
      color: 'negative',
      message: 'Помилка виконання правила',
      icon: 'error',
    })
  }
}

const deleteRule = async (rule) => {
  $q.dialog({
    title: 'Підтвердження',
    message: `Видалити правило "${rule.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await WialonSyncApi.deleteRule(rule.id)

      $q.notify({
        color: 'positive',
        message: 'Правило видалено',
        icon: 'delete',
      })

      loadRules()
    } catch (error) {
      console.error('Error deleting rule:', error)
      $q.notify({
        color: 'negative',
        message: 'Помилка видалення правила',
        icon: 'error',
      })
    }
  })
}

const showRuleDetails = (rule) => {
  selectedRule.value = rule
  showDetailsDialog.value = true
}

const onRequest = (props) => {
  pagination.value = props.pagination
  loadRules()
}

const updateStats = () => {
  stats.value = {
    total: rules.value.length,
    active: rules.value.filter((r) => r.is_active).length,
    inactive: rules.value.filter((r) => !r.is_active).length,
    executions: 0, // TODO: calculate today's executions
  }
}

// Utility methods
const getTypeColor = (type) => {
  const colors = {
    client_mapping: 'blue',
    object_mapping: 'green',
    equipment_check: 'orange',
    name_comparison: 'purple',
    owner_validation: 'teal',
    custom: 'indigo',
  }
  return colors[type] || 'grey'
}

const getTypeIcon = (type) => {
  const icons = {
    client_mapping: 'people',
    object_mapping: 'location_on',
    equipment_check: 'settings',
    name_comparison: 'text_fields',
    owner_validation: 'verified',
    custom: 'code',
  }
  return icons[type] || 'rule'
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadRules()
})
</script>

<style scoped>
.sql-query,
.parameters {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.sql-query {
  font-family: 'Courier New', monospace;
}
</style>
