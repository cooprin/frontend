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
            <q-input v-model="ruleForm.name" label="Назва" outlined dense />

            <q-input
              v-model="ruleForm.sql_query"
              label="SQL запит"
              type="textarea"
              outlined
              rows="8"
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
  sql_query: '',
})

// Пагінація
const pagination = ref({
  sortBy: 'execution_order',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Computed колонки таблиці
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: 'Назва',
    align: 'left',
    field: 'name',
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
    sql_query: '',
  }
  showRuleDialog.value = true
}

const editRule = (rule) => {
  editingRule.value = true
  ruleForm.value = {
    id: rule.id,
    name: rule.name || '',
    sql_query: rule.sql_query || '',
  }
  showRuleDialog.value = true
}

const saveRule = async () => {
  saving.value = true
  try {
    const ruleData = {
      name: ruleForm.value.name.trim(),
      sql_query: ruleForm.value.sql_query.trim(),
      rule_type: 'custom',
      execution_order: 1,
      is_active: true,
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
      message: 'Помилка збереження правила',
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
