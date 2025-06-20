<template>
  <div>
    <!-- Кнопка створення -->
    <q-btn :label="t('wialonSync.rules.create')" color="primary" icon="add" @click="createRule" />

    <!-- Таблиця -->
    <q-table :rows="rules" :columns="columns" :loading="loading" row-key="id" class="q-mt-md">
      <!-- Дії -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="editRule(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Діалог -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 700px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? t('wialonSync.rules.edit') : t('wialonSync.rules.create') }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model="form.name" :label="t('wialonSync.rules.form.name')" outlined dense />

            <q-input
              v-model="form.description"
              :label="t('wialonSync.rules.form.description')"
              type="textarea"
              outlined
              dense
              rows="2"
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="form.rule_type"
                  :options="typeOptions"
                  :label="t('wialonSync.rules.form.type')"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="col-3">
                <q-input
                  v-model.number="form.execution_order"
                  :label="t('wialonSync.rules.form.executionOrder')"
                  type="number"
                  outlined
                  dense
                  min="1"
                />
              </div>
            </div>

            <q-input
              v-model="form.sql_query"
              :label="t('wialonSync.rules.form.sqlQuery')"
              type="textarea"
              outlined
              rows="6"
            />

            <q-input
              v-model="form.parameters"
              :label="t('wialonSync.rules.form.parameters')"
              type="textarea"
              outlined
              dense
              rows="3"
              :hint="t('wialonSync.common.jsonFormat')"
            />

            <q-toggle
              v-model="form.is_active"
              :label="t('wialonSync.rules.form.isActive')"
              color="positive"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('wialonSync.common.cancel')" v-close-popup />
          <q-btn
            flat
            :label="t('wialonSync.common.save')"
            color="primary"
            :loading="saving"
            @click="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { WialonSyncApi } from 'src/api/wialon-sync'

const $q = useQuasar()
const { t } = useI18n()
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const isEditing = ref(false)
const rules = ref([])

const form = ref({
  id: null,
  name: '',
  description: '',
  rule_type: '',
  sql_query: '',
  parameters: '{}',
  execution_order: 1,
  is_active: true,
})

const typeOptions = computed(() => [
  { label: t('wialonSync.rules.types.client_mapping'), value: 'client_mapping' },
  { label: t('wialonSync.rules.types.object_mapping'), value: 'object_mapping' },
  { label: t('wialonSync.rules.types.equipment_check'), value: 'equipment_check' },
  { label: t('wialonSync.rules.types.name_comparison'), value: 'name_comparison' },
  { label: t('wialonSync.rules.types.owner_validation'), value: 'owner_validation' },
  { label: t('wialonSync.rules.types.custom'), value: 'custom' },
])

const columns = [
  {
    name: 'name',
    label: t('wialonSync.rules.columns.name'),
    align: 'left',
    field: 'name',
  },
  {
    name: 'actions',
    label: t('wialonSync.common.actions'),
    align: 'center',
  },
]

// Завантаження правил з бази
async function loadRules() {
  loading.value = true
  try {
    const response = await WialonSyncApi.getRules()
    rules.value = response.data.rules || []
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

function createRule() {
  console.log('Creating new rule') // Для діагностики
  isEditing.value = false
  form.value = {
    id: null,
    name: '',
    description: '',
    rule_type: '',
    sql_query: '',
    parameters: '{}',
    execution_order: 1,
    is_active: true,
  }
  console.log('Form data for new rule:', form.value) // Для діагностики
  showDialog.value = true
}

function editRule(rule) {
  console.log('Editing rule:', rule) // Для діагностики
  isEditing.value = true
  form.value = {
    id: rule.id,
    name: rule.name || '',
    description: rule.description || '',
    rule_type: rule.rule_type || '',
    sql_query: rule.sql_query || '',
    parameters:
      typeof rule.parameters === 'object'
        ? JSON.stringify(rule.parameters, null, 2)
        : rule.parameters || '{}',
    execution_order: rule.execution_order || 1,
    is_active: rule.is_active ?? true,
  }
  console.log('Form data:', form.value) // Для діагностики
  showDialog.value = true
}

// Збереження в базу
async function save() {
  saving.value = true
  try {
    // Валідація
    if (!form.value.name?.trim()) {
      throw new Error(t('wialonSync.common.nameRequired'))
    }
    if (!form.value.rule_type) {
      throw new Error(t('wialonSync.common.ruleTypeRequired'))
    }
    if (!form.value.sql_query?.trim()) {
      throw new Error(t('wialonSync.common.sqlQueryRequired'))
    }

    // Парсинг параметрів JSON
    let parsedParameters = {}
    try {
      parsedParameters = JSON.parse(form.value.parameters || '{}')
    } catch {
      throw new Error(t('wialonSync.common.invalidJsonFormat'))
    }

    const ruleData = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || '',
      rule_type: form.value.rule_type,
      sql_query: form.value.sql_query.trim(),
      parameters: parsedParameters,
      execution_order: parseInt(form.value.execution_order) || 1,
      is_active: Boolean(form.value.is_active),
    }

    if (isEditing.value) {
      // Оновлення існуючого правила
      await WialonSyncApi.updateRule(form.value.id, ruleData)
      $q.notify({
        color: 'positive',
        message: t('wialonSync.common.ruleUpdated'),
        icon: 'check',
      })
    } else {
      // Створення нового правила
      await WialonSyncApi.createRule(ruleData)
      $q.notify({
        color: 'positive',
        message: t('wialonSync.common.ruleCreated'),
        icon: 'check',
      })
    }

    showDialog.value = false
    form.value = {
      id: null,
      name: '',
      description: '',
      rule_type: '',
      sql_query: '',
      parameters: '{}',
      execution_order: 1,
      is_active: true,
    }
    isEditing.value = false

    // Перезавантажити список
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

// Завантажити дані при створенні компонента
onMounted(() => {
  loadRules()
})
</script>
