<template>
  <div>
    <!-- Кнопка створення -->
    <q-btn label="Створити правило" color="primary" icon="add" @click="showDialog = true" />

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
            {{ isEditing ? 'Редагувати правило' : 'Створити правило' }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model="form.name" label="Назва правила" outlined dense />

            <q-input
              v-model="form.description"
              label="Опис"
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
                  label="Тип правила"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="col-3">
                <q-input
                  v-model.number="form.execution_order"
                  label="Порядок"
                  type="number"
                  outlined
                  dense
                  min="1"
                />
              </div>
            </div>

            <q-input v-model="form.sql_query" label="SQL запит" type="textarea" outlined rows="6" />

            <q-input
              v-model="form.parameters"
              label="Параметри (JSON)"
              type="textarea"
              outlined
              dense
              rows="3"
              hint='Формат: {"key": "value"}'
            />

            <q-toggle v-model="form.is_active" label="Активне правило" color="positive" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Скасувати" v-close-popup />
          <q-btn flat label="Зберегти" color="primary" :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { WialonSyncApi } from 'src/api/wialon-sync'

const $q = useQuasar()
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

const typeOptions = [
  { label: 'Зіставлення клієнтів', value: 'client_mapping' },
  { label: "Зіставлення об'єктів", value: 'object_mapping' },
  { label: 'Перевірка обладнання', value: 'equipment_check' },
  { label: 'Порівняння назв', value: 'name_comparison' },
  { label: 'Перевірка власників', value: 'owner_validation' },
  { label: 'Власне правило', value: 'custom' },
]

const columns = [
  {
    name: 'name',
    label: 'Назва',
    align: 'left',
    field: 'name',
  },
  {
    name: 'actions',
    label: 'Дії',
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
      message: 'Помилка завантаження правил',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

function editRule(rule) {
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
  showDialog.value = true
}

// Збереження в базу
async function save() {
  saving.value = true
  try {
    // Валідація
    if (!form.value.name?.trim()) {
      throw new Error("Назва правила обов'язкова")
    }
    if (!form.value.rule_type) {
      throw new Error("Тип правила обов'язковий")
    }
    if (!form.value.sql_query?.trim()) {
      throw new Error("SQL запит обов'язковий")
    }

    // Парсинг параметрів JSON
    let parsedParameters = {}
    try {
      parsedParameters = JSON.parse(form.value.parameters || '{}')
    } catch {
      throw new Error('Невірний формат JSON в параметрах')
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
        message: 'Правило оновлено',
        icon: 'check',
      })
    } else {
      // Створення нового правила
      await WialonSyncApi.createRule(ruleData)
      $q.notify({
        color: 'positive',
        message: 'Правило створено',
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
      message: error.message || 'Помилка збереження правила',
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
