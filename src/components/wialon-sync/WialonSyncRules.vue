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
          <span>Правила не знайдено</span>
        </div>
      </template>
    </q-table>

    <!-- Діалог створення/редагування правила -->
    <q-dialog v-model="showRuleDialog" persistent>
      <q-card style="min-width: 600px">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Опції для типів правил
const typeOptions = computed(() => [
  { label: t('wialonSync.rules.types.client_mapping'), value: 'client_mapping' },
  { label: t('wialonSync.rules.types.object_mapping'), value: 'object_mapping' },
  { label: t('wialonSync.rules.types.equipment_check'), value: 'equipment_check' },
  { label: t('wialonSync.rules.types.name_comparison'), value: 'name_comparison' },
  { label: t('wialonSync.rules.types.owner_validation'), value: 'owner_validation' },
  { label: t('wialonSync.rules.types.custom'), value: 'custom' },
])

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
async function loadRules() {
  loading.value = true
  try {
    const response = await WialonSyncApi.getRules({
      limit: pagination.value.rowsPerPage,
      offset: (pagination.value.page - 1) * pagination.value.rowsPerPage,
    })

    rules.value = response.data.rules || []
    pagination.value.rowsNumber = response.data.total || 0
  } catch (error) {
    console.error('Error loading rules:', error)
    $q.notify({
      color: 'negative',
      message: 'Помилка завантаження правил',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

function showCreateDialog() {
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

function editRule(rule) {
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

async function saveRule() {
  saving.value = true
  try {
    if (!ruleForm.value.name?.trim()) {
      throw new Error(t('wialonSync.common.nameRequired'))
    }

    if (!ruleForm.value.rule_type) {
      throw new Error(t('wialonSync.common.ruleTypeRequired'))
    }

    if (!ruleForm.value.sql_query?.trim()) {
      throw new Error(t('wialonSync.common.sqlQueryRequired'))
    }

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

async function onRequest(props) {
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

function getTypeColor(type) {
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

function getTypeIcon(type) {
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

function getTypeLabel(type) {
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

async function toggleRuleActive(rule, isActive) {
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
      message: isActive ? 'Правило активовано' : 'Правило деактивовано',
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

async function executeRule(rule) {
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

async function deleteRule(rule) {
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

// Lifecycle
onMounted(() => {
  loadRules()
})
</script>

<style scoped></style>
