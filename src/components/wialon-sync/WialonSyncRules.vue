<template>
  <div>
    <!-- Панель управління -->
    <div class="row q-gutter-md q-mb-lg items-center">
      <q-btn label="Створити правило" color="primary" icon="add" @click="showCreateDialog" />

      <q-btn
        label="Оновити"
        color="secondary"
        icon="refresh"
        :loading="loading"
        @click="loadRules"
        outline
      />

      <q-space />

      <!-- Пошук -->
      <q-input v-model="filter" placeholder="Пошук..." dense outlined style="min-width: 250px">
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
      <!-- Дії -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="editRule(props.row)">
            <q-tooltip>Редагувати</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Діалог створення/редагування правила -->
    <q-dialog v-model="showRuleDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">
            {{ editingRule ? 'Редагувати правило' : 'Створити правило' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveRule" class="q-gutter-md">
            <div class="row q-gutter-md">
              <div class="col-12 col-md-8">
                <q-input v-model="ruleForm.name" label="Назва" outlined dense />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="ruleForm.execution_order"
                  label="Порядок виконання"
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
              label="Опис"
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
                  label="Тип правила"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-md-6">
                <q-toggle v-model="ruleForm.is_active" label="Активне" color="positive" />
              </div>
            </div>

            <q-input
              v-model="ruleForm.sql_query"
              label="SQL запит"
              type="textarea"
              outlined
              rows="8"
            />

            <q-input
              v-model="parametersJson"
              label="Параметри (JSON)"
              type="textarea"
              outlined
              rows="4"
              hint="Формат JSON"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Скасувати" v-close-popup />
          <q-btn label="Зберегти" color="primary" :loading="saving" @click="saveRule" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { WialonSyncApi } from 'src/api/wialon-sync'

const $q = useQuasar()

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
  { label: 'Зіставлення клієнтів', value: 'client_mapping' },
  { label: "Зіставлення об'єктів", value: 'object_mapping' },
  { label: 'Перевірка обладнання', value: 'equipment_check' },
  { label: 'Порівняння назв', value: 'name_comparison' },
  { label: 'Валідація власника', value: 'owner_validation' },
  { label: 'Користувацьке', value: 'custom' },
])

// Computed колонки таблиці
const columns = computed(() => [
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
    name: 'actions',
    label: 'Дії',
    align: 'center',
  },
])

// Methods
const loadRules = async () => {
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
      throw new Error("Назва обов'язкова")
    }

    if (!ruleForm.value.rule_type) {
      throw new Error("Тип правила обов'язковий")
    }

    if (!ruleForm.value.sql_query?.trim()) {
      throw new Error("SQL запит обов'язковий")
    }

    let parsedParameters = {}
    try {
      const trimmedJson = parametersJson.value.trim()
      if (trimmedJson) {
        parsedParameters = JSON.parse(trimmedJson)
      }
    } catch (jsonError) {
      throw new Error('Неправильний формат JSON: ' + jsonError.message)
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
      message: editingRule.value ? 'Правило оновлено' : 'Правило створено',
      icon: 'check',
    })

    showRuleDialog.value = false
    await loadRules()
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

// Lifecycle
onMounted(() => {
  loadRules()
})
</script>

<style scoped></style>
