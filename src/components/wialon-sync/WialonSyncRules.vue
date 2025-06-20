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
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? 'Редагувати правило' : 'Створити правило' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.name" label="Назва" outlined />
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
})

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
  form.value.id = rule.id
  form.value.name = rule.name
  showDialog.value = true
}

// Збереження в базу
async function save() {
  saving.value = true
  try {
    if (isEditing.value) {
      // Оновлення існуючого правила
      await WialonSyncApi.updateRule(form.value.id, {
        name: form.value.name,
      })
      $q.notify({
        color: 'positive',
        message: 'Правило оновлено',
        icon: 'check',
      })
    } else {
      // Створення нового правила
      await WialonSyncApi.createRule({
        name: form.value.name,
      })
      $q.notify({
        color: 'positive',
        message: 'Правило створено',
        icon: 'check',
      })
    }

    showDialog.value = false
    form.value = { id: null, name: '' }
    isEditing.value = false

    // Перезавантажити список
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

// Завантажити дані при створенні компонента
onMounted(() => {
  loadRules()
})
</script>
