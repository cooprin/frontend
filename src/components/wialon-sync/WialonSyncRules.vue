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
          <div class="text-caption">{{ $t('wialonSync.rules.stats.total') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-positive">{{ stats.active }}</div>
          <div class="text-caption">{{ $t('wialonSync.rules.stats.active') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-grey">{{ stats.inactive }}</div>
          <div class="text-caption">{{ $t('wialonSync.rules.stats.inactive') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="col">
        <q-card-section class="text-center">
          <div class="text-h6 text-blue">{{ stats.executions }}</div>
          <div class="text-caption">{{ $t('wialonSync.rules.stats.executions') }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Таблиця правил -->
    <q-table
      :rows="rules"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
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
          <span v-else class="text-grey-7">{{ $t('wialonSync.common.never') }}</span>
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
            <q-tooltip>{{ $t('wialonSync.common.executeRule') }}</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="visibility" @click="showRuleDetails(props.row)">
            <q-tooltip>{{ $t('wialonSync.common.showDetails') }}</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="delete" color="negative" @click="deleteRule(props.row)">
            <q-tooltip>{{ $t('wialonSync.common.delete') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Порожня таблиця -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm">
          <q-icon size="2em" name="rule" />
          <span>{{ $t('wialonSync.common.noRulesFound') }}</span>
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
                  :rules="[(val) => !!val || $t('wialonSync.common.nameRequired')]"
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
                  :rules="[(val) => !!val || $t('wialonSync.common.ruleTypeRequired')]"
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
              :rules="[(val) => !!val || $t('wialonSync.common.sqlQueryRequired')]"
            />

            <q-input
              v-model="parametersJson"
              :label="$t('wialonSync.rules.form.parameters')"
              type="textarea"
              outlined
              rows="4"
              :hint="$t('wialonSync.common.jsonFormat')"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('wialonSync.common.cancel')" v-close-popup />
          <q-btn
            :label="$t('wialonSync.common.save')"
            color="primary"
            :loading="saving"
            @click="saveRule"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог деталей правила -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('wialonSync.common.ruleDetails') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedRule && Object.keys(selectedRule).length > 0">
          <div class="row q-gutter-md">
            <!-- Загальна інформація -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('wialonSync.common.generalInfo') }}</div>

                <div class="q-gutter-sm">
                  <div>
                    <strong>{{ $t('wialonSync.rules.form.name') }}:</strong> {{ selectedRule.name }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.rules.form.description') }}:</strong>
                    {{ selectedRule.description || '-' }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.rules.columns.type') }}:</strong>
                    <q-chip
                      :color="getTypeColor(selectedRule.rule_type)"
                      text-color="white"
                      size="sm"
                    >
                      {{ $t(`wialonSync.rules.types.${selectedRule.rule_type}`) }}
                    </q-chip>
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.rules.form.executionOrder') }}:</strong>
                    {{ selectedRule.execution_order }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.rules.columns.isActive') }}:</strong>
                    <q-icon
                      :name="selectedRule.is_active ? 'check_circle' : 'cancel'"
                      :color="selectedRule.is_active ? 'positive' : 'negative'"
                    />
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.common.created') }}:</strong>
                    {{ formatDateTime(selectedRule.created_at) }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.common.author') }}:</strong>
                    {{ selectedRule.created_by_name || '-' }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Статистика виконань -->
            <q-card flat bordered class="col-12 col-md-6">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  {{ $t('wialonSync.common.executionStats') }}
                </div>

                <div class="q-gutter-sm">
                  <div>
                    <strong>{{ $t('wialonSync.common.totalExecutions') }}:</strong>
                    {{ selectedRule.total_executions || 0 }}
                  </div>
                  <div>
                    <strong>{{ $t('wialonSync.rules.columns.lastExecution') }}:</strong>
                    {{
                      selectedRule.last_execution
                        ? formatDateTime(selectedRule.last_execution)
                        : $t('wialonSync.common.never')
                    }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- SQL запит -->
            <q-card flat bordered class="col-12">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">{{ $t('wialonSync.rules.form.sqlQuery') }}</div>

                <pre class="sql-query">{{ selectedRule.sql_query }}</pre>
              </q-card-section>
            </q-card>

            <!-- Параметри -->
            <q-card flat bordered class="col-12" v-if="selectedRule.parameters">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">
                  {{ $t('wialonSync.rules.form.parameters') }}
                </div>

                <pre class="parameters">{{ formatParameters(selectedRule.parameters) }}</pre>
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
import { ref, watch, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WialonSyncApi } from 'src/api/wialon-sync'

const $q = useQuasar()
const { t } = useI18n()

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
  id: null,
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
  { label: t('wialonSync.rules.types.client_mapping'), value: 'client_mapping' },
  { label: t('wialonSync.rules.types.object_mapping'), value: 'object_mapping' },
  { label: t('wialonSync.rules.types.equipment_check'), value: 'equipment_check' },
  { label: t('wialonSync.rules.types.name_comparison'), value: 'name_comparison' },
  { label: t('wialonSync.rules.types.owner_validation'), value: 'owner_validation' },
  { label: t('wialonSync.rules.types.custom'), value: 'custom' },
]

// Колонки таблиці
const columns = [
  {
    name: 'execution_order',
    required: true,
    label: t('wialonSync.common.order'),
    align: 'center',
    field: 'execution_order',
    sortable: true,
  },
  {
    name: 'name',
    required: true,
    label: t('wialonSync.rules.columns.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'rule_type',
    label: t('wialonSync.rules.columns.type'),
    align: 'center',
    field: 'rule_type',
    sortable: true,
  },
  {
    name: 'is_active',
    label: t('wialonSync.rules.columns.isActive'),
    align: 'center',
    field: 'is_active',
    sortable: true,
  },
  {
    name: 'total_executions',
    label: t('wialonSync.common.executions'),
    align: 'center',
    field: 'total_executions',
    sortable: true,
  },
  {
    name: 'last_execution',
    label: t('wialonSync.rules.columns.lastExecution'),
    align: 'center',
    field: 'last_execution',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('wialonSync.common.actions'),
    align: 'center',
  },
]

// Methods
const loadRules = async () => {
  loading.value = true
  try {
    const params = {
      limit: pagination.value.rowsPerPage,
      offset: (pagination.value.page - 1) * pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      type: filters.value.type,
      activeOnly: filters.value.activeOnly,
      search: filter.value || undefined,
    }

    // Видаляємо undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await WialonSyncApi.getRules(params)

    rules.value = response.data.rules || []
    pagination.value.rowsNumber = response.data.total || 0
    updateStats()
  } catch (error) {
    console.error('Error loading rules:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorLoadingRules'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  editingRule.value = false
  ruleForm.value = {
    id: null,
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

  // Безпечний парсинг параметрів
  let parametersString = '{}'
  try {
    if (rule.parameters) {
      if (typeof rule.parameters === 'string') {
        // Якщо параметри приходять як рядок, перевіряємо валідність JSON
        JSON.parse(rule.parameters)
        parametersString = rule.parameters
      } else if (typeof rule.parameters === 'object') {
        // Якщо параметри - об'єкт, конвертуємо в рядок
        parametersString = JSON.stringify(rule.parameters, null, 2)
      }
    }
  } catch (error) {
    console.warn('Invalid parameters JSON, using empty object:', error)
    parametersString = '{}'
  }

  ruleForm.value = {
    id: rule.id, // Важливо додати ID для редагування!
    name: rule.name || '',
    description: rule.description || '',
    rule_type: rule.rule_type || '',
    sql_query: rule.sql_query || '',
    parameters: typeof rule.parameters === 'object' ? rule.parameters : {},
    execution_order: rule.execution_order || 1,
    is_active: rule.is_active ?? true,
  }

  parametersJson.value = parametersString
  showDetailsDialog.value = false
  showRuleDialog.value = true
}

const saveRule = async () => {
  saving.value = true
  try {
    // Перевірка обов'язкових полів
    if (!ruleForm.value.name?.trim()) {
      throw new Error(t('wialonSync.common.nameRequired'))
    }

    if (!ruleForm.value.rule_type) {
      throw new Error(t('wialonSync.common.ruleTypeRequired'))
    }

    if (!ruleForm.value.sql_query?.trim()) {
      throw new Error(t('wialonSync.common.sqlQueryRequired'))
    }

    // Безпечний парсинг JSON параметрів
    let parsedParameters = {}
    try {
      const trimmedJson = parametersJson.value.trim()
      if (trimmedJson) {
        parsedParameters = JSON.parse(trimmedJson)
      }
    } catch (jsonError) {
      throw new Error(t('wialonSync.common.invalidJsonFormat') + ': ' + jsonError.message)
    }

    const ruleData = {
      name: ruleForm.value.name.trim(),
      description: ruleForm.value.description?.trim() || '',
      rule_type: ruleForm.value.rule_type,
      sql_query: ruleForm.value.sql_query.trim(),
      parameters: parsedParameters,
      execution_order: parseInt(ruleForm.value.execution_order) || 1,
      is_active: Boolean(ruleForm.value.is_active),
    }

    if (editingRule.value && ruleForm.value.id) {
      await WialonSyncApi.updateRule(ruleForm.value.id, ruleData)
    } else {
      await WialonSyncApi.createRule(ruleData)
    }

    $q.notify({
      color: 'positive',
      message: editingRule.value
        ? t('wialonSync.common.ruleUpdated')
        : t('wialonSync.common.ruleCreated'),
      icon: 'check',
    })

    showRuleDialog.value = false
    await loadRules()
  } catch (error) {
    console.error('Error saving rule:', error)
    $q.notify({
      color: 'negative',
      message: error.message || t('wialonSync.common.errorSavingRule'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const toggleRuleActive = async (rule, isActive) => {
  try {
    const updateData = {
      name: rule.name,
      description: rule.description,
      rule_type: rule.rule_type,
      sql_query: rule.sql_query,
      parameters: rule.parameters || {},
      execution_order: rule.execution_order,
      is_active: isActive,
    }

    await WialonSyncApi.updateRule(rule.id, updateData)

    rule.is_active = isActive
    updateStats()

    $q.notify({
      color: 'positive',
      message: t(
        isActive ? 'wialonSync.common.ruleActivated' : 'wialonSync.common.ruleDeactivated',
      ),
      icon: 'check',
    })
  } catch (error) {
    console.error('Error toggling rule:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorTogglingRule'),
      icon: 'error',
    })
  }
}

const executeRule = async (rule) => {
  try {
    await WialonSyncApi.executeRule(rule.id)

    $q.notify({
      color: 'positive',
      message: t('wialonSync.common.ruleExecuted', { name: rule.name }),
      icon: 'play_arrow',
    })
  } catch (error) {
    console.error('Error executing rule:', error)
    $q.notify({
      color: 'negative',
      message: t('wialonSync.common.errorExecutingRule'),
      icon: 'error',
    })
  }
}

const deleteRule = async (rule) => {
  $q.dialog({
    title: t('wialonSync.common.confirm'),
    message: t('wialonSync.common.deleteRuleConfirm', { name: rule.name }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await WialonSyncApi.deleteRule(rule.id)

      $q.notify({
        color: 'positive',
        message: t('wialonSync.common.ruleDeleted'),
        icon: 'delete',
      })

      loadRules()
    } catch (error) {
      console.error('Error deleting rule:', error)
      $q.notify({
        color: 'negative',
        message: t('wialonSync.common.errorDeletingRule'),
        icon: 'error',
      })
    }
  })
}

const showRuleDetails = (rule) => {
  selectedRule.value = rule
  showDetailsDialog.value = true
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value = {
    ...pagination.value,
    page,
    rowsPerPage,
    sortBy,
    descending,
  }

  await loadRules()
}

const updateStats = () => {
  stats.value = {
    total: pagination.value.rowsNumber,
    active: rules.value.filter((r) => r.is_active).length,
    inactive: rules.value.filter((r) => !r.is_active).length,
    executions: rules.value.reduce((sum, r) => sum + (r.total_executions || 0), 0),
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

const formatParameters = (parameters) => {
  try {
    if (typeof parameters === 'string') {
      return JSON.stringify(JSON.parse(parameters), null, 2)
    }
    return JSON.stringify(parameters, null, 2)
  } catch {
    return parameters
  }
}

// Watchers
watch(
  () => filters.value,
  () => {
    pagination.value.page = 1
    loadRules()
  },
  { deep: true },
)

watch(
  () => filter.value,
  () => {
    pagination.value.page = 1
    loadRules()
  },
)

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
