<template>
  <div>
    <div class="text-h6 q-mb-md">{{ $t('company.emailTemplates.title') }}</div>
    <p class="text-grey-7 q-mb-lg">{{ $t('company.emailTemplates.desc') }}</p>

    <!-- Кнопка додавання шаблону -->
    <div class="row justify-end q-mb-md">
      <q-btn
        color="primary"
        icon="add"
        :label="$t('company.emailTemplates.addTemplate')"
        @click="openCreateDialog"
      />
    </div>

    <!-- Список шаблонів -->
    <q-table
      :rows="templates"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :no-data-label="$t('company.emailTemplates.noTemplates')"
    >
      <!-- Слот для статусу -->
      <template v-slot:body-cell-is_active="props">
        <q-td :props="props">
          <q-chip :color="props.row.is_active ? 'positive' : 'grey'" text-color="white" dense>
            {{ props.row.is_active ? $t('common.active') : $t('common.inactive') }}
          </q-chip>
        </q-td>
      </template>

      <!-- Слот для дій -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn flat round dense color="primary" icon="edit" @click="openEditDialog(props.row)">
            <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
          </q-btn>
          <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
            <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Діалог створення/редагування шаблону -->
    <q-dialog v-model="showDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{
              editingTemplate
                ? $t('company.emailTemplates.editTemplate')
                : $t('company.emailTemplates.createTemplate')
            }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveTemplate" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- Основна інформація -->
              <div class="col-12">
                <div class="text-subtitle1 q-mb-sm">
                  {{ $t('company.emailTemplates.basicInfo') }}
                </div>
              </div>

              <!-- Назва шаблону -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="templateForm.name"
                  :label="$t('company.emailTemplates.name')"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  outlined
                  dense
                />
              </div>

              <!-- Код шаблону -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="templateForm.code"
                  :label="$t('company.emailTemplates.code')"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  :readonly="!!editingTemplate"
                  outlined
                  dense
                  :hint="editingTemplate ? $t('company.emailTemplates.codeReadOnly') : ''"
                />
              </div>

              <!-- Тема листа -->
              <div class="col-12">
                <q-input
                  v-model="templateForm.subject"
                  :label="$t('company.emailTemplates.subject')"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  outlined
                  dense
                />
              </div>

              <!-- Опис -->
              <div class="col-12">
                <q-input
                  v-model="templateForm.description"
                  :label="$t('company.emailTemplates.description')"
                  type="textarea"
                  outlined
                  autogrow
                />
              </div>

              <!-- Активний -->
              <div class="col-12">
                <q-toggle
                  v-model="templateForm.is_active"
                  :label="$t('company.emailTemplates.isActive')"
                  color="primary"
                />
              </div>
            </div>

            <!-- Вкладки для HTML та текстової версії -->
            <q-tabs
              v-model="contentTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="html" :label="$t('company.emailTemplates.htmlTemplate')" />
              <q-tab name="text" label="Текстова версія" />
              <q-tab name="preview" :label="$t('company.emailTemplates.preview')" />
              <q-tab name="variables" label="Змінні" />
            </q-tabs>

            <q-tab-panels v-model="contentTab" animated>
              <!-- HTML шаблон -->
              <q-tab-panel name="html">
                <q-input
                  v-model="templateForm.body_html"
                  :label="$t('company.emailTemplates.htmlTemplate')"
                  type="textarea"
                  outlined
                  autogrow
                  rows="15"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  :placeholder="$t('company.emailTemplates.htmlPlaceholder')"
                />
              </q-tab-panel>

              <!-- Текстова версія -->
              <q-tab-panel name="text">
                <q-input
                  v-model="templateForm.body_text"
                  label="Текстова версія"
                  type="textarea"
                  outlined
                  autogrow
                  rows="15"
                  placeholder="Текстова версія email (опціонально)"
                />
              </q-tab-panel>

              <!-- Попередній перегляд -->
              <q-tab-panel name="preview">
                <div class="text-subtitle2 q-mb-md">{{ $t('company.emailTemplates.preview') }}</div>
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-weight-bold q-mb-sm">Тема: {{ templateForm.subject }}</div>
                    <div v-html="renderedPreview" class="email-preview"></div>
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- Змінні -->
              <q-tab-panel name="variables">
                <div class="text-subtitle2 q-mb-md">Доступні змінні для шаблону</div>
                <q-markup-table flat bordered>
                  <thead>
                    <tr>
                      <th class="text-left">Змінна</th>
                      <th class="text-left">Опис</th>
                      <th class="text-left">Приклад</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(desc, variable) in availableVariables" :key="variable">
                      <td>
                        <code>{{ formatVariable(variable) }}</code>
                      </td>
                      <td>{{ desc }}</td>
                      <td class="text-grey">{{ getVariableExample(variable) }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-tab-panel>
            </q-tab-panels>

            <!-- Кнопки дій -->
            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { EmailTemplatesApi } from 'src/api/email-templates'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const saving = ref(false)
const templates = ref([])
const showDialog = ref(false)
const editingTemplate = ref(null)
const contentTab = ref('html')

// Form
const templateForm = ref({
  name: '',
  code: '',
  subject: '',
  body_html: '',
  body_text: '',
  description: '',
  is_active: true,
})

// Доступні змінні для шаблонів
const availableVariables = {
  invoice_number: 'Номер рахунку',
  invoice_date: 'Дата рахунку',
  client_name: "Ім'я клієнта",
  company_name: 'Назва компанії',
  billing_period: 'Період розрахунку',
  total_amount: 'Загальна сума',
  due_date: 'Дата оплати',
  portal_url: 'Посилання на портал',
  company_address: 'Адреса компанії',
  company_phone: 'Телефон компанії',
  company_email: 'Email компанії',
}

// Computed
const columns = computed(() => [
  {
    name: 'name',
    required: true,
    label: t('company.emailTemplates.name'),
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'code',
    label: t('company.emailTemplates.code'),
    align: 'left',
    field: 'code',
    sortable: true,
  },
  {
    name: 'subject',
    label: 'Тема',
    align: 'left',
    field: 'subject',
    sortable: true,
  },
  {
    name: 'is_active',
    label: t('common.status'),
    align: 'center',
    field: 'is_active',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
    sortable: false,
  },
])

const renderedPreview = computed(() => {
  let preview = templateForm.value.body_html

  // Замінюємо змінні на приклади
  Object.keys(availableVariables).forEach((variable) => {
    const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g')
    const example = getVariableExample(variable)
    preview = preview.replace(regex, example)
  })

  return preview
})

// Methods
const loadTemplates = async () => {
  loading.value = true
  try {
    const response = await EmailTemplatesApi.getTemplates()
    templates.value = response.data.templates
  } catch (error) {
    console.error('Error loading templates:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  templateForm.value = {
    name: '',
    code: '',
    subject: '',
    body_html: '',
    body_text: '',
    description: '',
    is_active: true,
  }
  editingTemplate.value = null
  contentTab.value = 'html'
}

const openCreateDialog = () => {
  resetForm()
  showDialog.value = true
}

const openEditDialog = (template) => {
  editingTemplate.value = template
  templateForm.value = { ...template }
  showDialog.value = true
}

const saveTemplate = async () => {
  saving.value = true
  try {
    if (editingTemplate.value) {
      await EmailTemplatesApi.updateTemplate(editingTemplate.value.id, templateForm.value)
      $q.notify({
        color: 'positive',
        message: t('company.emailTemplates.updateSuccess'),
        icon: 'check',
      })
    } else {
      await EmailTemplatesApi.createTemplate(templateForm.value)
      $q.notify({
        color: 'positive',
        message: t('company.emailTemplates.createSuccess'),
        icon: 'check',
      })
    }

    showDialog.value = false
    loadTemplates()
  } catch (error) {
    console.error('Error saving template:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (template) => {
  $q.dialog({
    title: t('common.confirm'),
    message: t('company.emailTemplates.deleteConfirm', { name: template.name }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteTemplate(template)
  })
}

const deleteTemplate = async (template) => {
  try {
    await EmailTemplatesApi.deleteTemplate(template.id)
    $q.notify({
      color: 'positive',
      message: t('company.emailTemplates.deleteSuccess'),
      icon: 'check',
    })
    loadTemplates()
  } catch (error) {
    console.error('Error deleting template:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
      icon: 'error',
    })
  }
}

const getVariableExample = (variable) => {
  const examples = {
    invoice_number: '2024-0001',
    invoice_date: '15.03.2024',
    client_name: 'ТОВ "Приклад"',
    company_name: 'Наша Компанія',
    billing_period: 'Березень 2024',
    total_amount: '1 500,00',
    due_date: '15.04.2024',
    portal_url: 'https://portal.example.com',
    company_address: 'вул. Приклад, 1, Київ',
    company_phone: '+380 44 123 45 67',
    company_email: 'info@example.com',
  }
  return examples[variable] || `[${variable}]`
}

const formatVariable = (variable) => {
  return `{{${variable}}}`
}

// Lifecycle
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.email-preview {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 4px;
}

code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>
