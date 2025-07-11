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
      :rows-per-page-options="pagination.rowsPerPageOptions"
      :rows-per-page-label="$t('common.rowsPerPage')"
      :pagination-label="paginationLabel"
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
            {{ getTypeLabel(props.value) }}
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
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">
            {{ editingRule ? 'Edit Rule' : 'Create Rule' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveRule" class="q-gutter-md">
            <div class="row q-gutter-md">
              <div class="col-12 col-md-8">
                <q-input v-model="ruleForm.name" label="Rule Name" outlined dense />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="ruleForm.execution_order"
                  label="Execution Order"
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
              label="Description"
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
                  label="Rule Type"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-toggle v-model="ruleForm.is_active" label="Active Rule" color="positive" />
              </div>
            </div>

            <q-input
              v-model="ruleForm.sql_query"
              label="SQL Query"
              type="textarea"
              outlined
              rows="8"
            />

            <q-input
              v-model="parametersJson"
              label="Parameters"
              type="textarea"
              outlined
              rows="4"
              hint='JSON format: {"key": "value"}'
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Save" color="primary" :loading="saving" @click="saveRule" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
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
const editingRule = ref(false)

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
  rowsPerPage: 15,
  rowsNumber: 0,
  rowsPerPageOptions: [10, 15, 20, 25, 50],
})

// Опції для типів правил (англійською)
const typeOptions = [
  { label: 'Client Mapping', value: 'client_mapping' },
  { label: 'Object Mapping', value: 'object_mapping' },
  { label: 'Equipment Check', value: 'equipment_check' },
  { label: 'Name Comparison', value: 'name_comparison' },
  { label: 'Owner Validation', value: 'owner_validation' },
  { label: 'Custom Rule', value: 'custom' },
]

// Computed колонки таблиці
const columns = computed(() => [
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
    name: 'actions',
    label: t('wialonSync.common.actions'),
    align: 'center',
  },
])

// Methods
const loadRules = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || undefined,
      descending: pagination.value.descending,
      search: filter.value || undefined,
    }

    // Видалити undefined параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await WialonSyncApi.getRules(params)

    rules.value = response.data.rules || []
    pagination.value.rowsNumber = response.data.total || 0
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

  let parametersString = '{}'
  try {
    if (rule.parameters) {
      if (typeof rule.parameters === 'string') {
        JSON.parse(rule.parameters)
        parametersString = rule.parameters
      } else if (typeof rule.parameters === 'object') {
        parametersString = JSON.stringify(rule.parameters, null, 2)
      }
    }
  } catch (error) {
    console.warn('Invalid parameters JSON, using empty object:', error)
    parametersString = '{}'
  }

  ruleForm.value = {
    id: rule.id,
    name: rule.name || '',
    description: rule.description || '',
    rule_type: rule.rule_type || '',
    sql_query: rule.sql_query || '',
    parameters: typeof rule.parameters === 'object' ? rule.parameters : {},
    execution_order: rule.execution_order || 1,
    is_active: rule.is_active ?? true,
  }

  parametersJson.value = parametersString
  showRuleDialog.value = true
}

const saveRule = async () => {
  saving.value = true
  try {
    if (!ruleForm.value.name?.trim()) {
      throw new Error('Name is required')
    }

    if (!ruleForm.value.rule_type) {
      throw new Error('Rule type is required')
    }

    if (!ruleForm.value.sql_query?.trim()) {
      throw new Error('SQL query is required')
    }

    let parsedParameters = {}
    try {
      const trimmedJson = parametersJson.value.trim()
      if (trimmedJson) {
        parsedParameters = JSON.parse(trimmedJson)
      }
    } catch (jsonError) {
      throw new Error('Invalid JSON format for parameters: ' + jsonError.message)
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

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} ${t('common.of')} ${totalRowsNumber}`
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

const getTypeLabel = (type) => {
  const labels = {
    client_mapping: t('wialonSync.rules.types.client_mapping'),
    object_mapping: t('wialonSync.rules.types.object_mapping'),
    equipment_check: t('wialonSync.rules.types.equipment_check'),
    name_comparison: t('wialonSync.rules.types.name_comparison'),
    owner_validation: t('wialonSync.rules.types.owner_validation'),
    custom: t('wialonSync.rules.types.custom'),
  }
  return labels[type] || type
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

    $q.notify({
      color: 'positive',
      message: isActive
        ? t('wialonSync.common.ruleActivated')
        : t('wialonSync.common.ruleDeactivated'),
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
watch(
  filter,
  () => {
    pagination.value.page = 1
    loadRules()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  loadRules()
})
</script>

<style scoped></style>
