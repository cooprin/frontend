<template>
  <div>
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ $t('company.invoiceTemplates.title') }}</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        :label="$t('company.invoiceTemplates.addTemplate')"
        @click="openCreateDialog"
      />
    </div>

    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="templates.length === 0" class="text-center q-pa-md">
      <q-icon name="description" size="3rem" color="grey-7" />
      <div class="text-h6 text-grey-7 q-mt-sm">
        {{ $t('company.invoiceTemplates.noTemplates') }}
      </div>
      <q-btn
        color="primary"
        class="q-mt-md"
        :label="$t('company.invoiceTemplates.createFirstTemplate')"
        @click="openCreateDialog"
      />
    </div>

    <div v-else>
      <q-list bordered separator>
        <q-item v-for="template in templates" :key="template.id" class="q-py-md">
          <q-item-section>
            <q-item-label class="text-subtitle1">{{ template.name }}</q-item-label>
            <q-item-label caption>{{ template.code }}</q-item-label>
            <div class="q-mt-xs">
              <q-badge v-if="template.is_default" color="primary">{{
                $t('company.invoiceTemplates.default')
              }}</q-badge>
              <q-badge v-if="!template.is_active" color="grey">{{
                $t('company.invoiceTemplates.inactive')
              }}</q-badge>
            </div>
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                round
                color="primary"
                icon="visibility"
                @click="previewTemplate(template)"
              >
                <q-tooltip>{{ $t('common.preview') }}</q-tooltip>
              </q-btn>
              <q-btn flat round color="primary" icon="edit" @click="openEditDialog(template)">
                <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="primary"
                icon="content_copy"
                @click="duplicateTemplate(template)"
              >
                <q-tooltip>{{ $t('company.invoiceTemplates.duplicate') }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="!template.is_default"
                flat
                round
                color="primary"
                icon="star_outline"
                @click="setAsDefault(template)"
              >
                <q-tooltip>{{ $t('company.invoiceTemplates.setAsDefault') }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="!template.usage_count && !template.is_default"
                flat
                round
                color="negative"
                icon="delete"
                @click="confirmDelete(template)"
              >
                <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Діалог створення/редагування шаблону -->
    <invoice-template-edit-dialog
      v-model="showEditDialog"
      :template-id="selectedTemplateId"
      @saved="loadTemplates"
    />

    <!-- Діалог попереднього перегляду -->
    <q-dialog v-model="showPreviewDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('company.invoiceTemplates.preview') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-tabs
            v-model="previewTab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="rendered" :label="$t('company.invoiceTemplates.previewRendered')" />
            <q-tab name="html" :label="$t('company.invoiceTemplates.previewHtml')" />
            <q-tab name="css" :label="$t('company.invoiceTemplates.previewCss')" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="previewTab" animated>
            <q-tab-panel name="rendered" class="q-pa-none">
              <div class="row justify-center">
                <iframe ref="previewFrame" class="preview-iframe" :srcdoc="previewHtml"></iframe>
              </div>
            </q-tab-panel>

            <q-tab-panel name="html">
              <q-markup-table flat bordered>
                <tbody>
                  <tr>
                    <td class="overflow-auto">
                      <pre class="code-preview">{{ selectedTemplate?.html_template }}</pre>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>

            <q-tab-panel name="css">
              <q-markup-table flat bordered>
                <tbody>
                  <tr>
                    <td class="overflow-auto">
                      <pre class="code-preview">{{ selectedTemplate?.css_styles }}</pre>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import InvoiceTemplateEditDialog from 'components/company/InvoiceTemplateEditDialog.vue'
import { InvoiceTemplatesApi } from 'src/api/invoice-templates'

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const templates = ref([])
const showEditDialog = ref(false)
const selectedTemplateId = ref(null)
const showPreviewDialog = ref(false)
const selectedTemplate = ref(null)
const previewTab = ref('rendered')
const previewHtml = ref('')

// Methods
const loadTemplates = async () => {
  loading.value = true
  try {
    const response = await InvoiceTemplatesApi.getTemplates()
    templates.value = response.data.templates
  } catch (error) {
    console.error('Error loading invoice templates:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  selectedTemplateId.value = null
  showEditDialog.value = true
}

const openEditDialog = (template) => {
  selectedTemplateId.value = template.id
  showEditDialog.value = true
}

const previewTemplate = async (template) => {
  try {
    const response = await InvoiceTemplatesApi.getTemplateById(template.id)
    selectedTemplate.value = response.data.template

    // Створюємо повний HTML для попереднього перегляду
    previewHtml.value = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Попередній перегляд шаблону</title>
          <style>
            ${selectedTemplate.value.css_styles || ''}
            body { font-family: 'Arial', sans-serif; padding: 20px; }
            .preview-container { max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="preview-container">
            ${selectedTemplate.value.html_template || ''}
          </div>
        </body>
      </html>
    `

    showPreviewDialog.value = true
  } catch (error) {
    console.error('Error loading template details:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  }
}

const duplicateTemplate = async (template) => {
  try {
    // Отримати повні дані шаблону
    const response = await InvoiceTemplatesApi.getTemplateById(template.id)
    const templateData = response.data.template

    // Створити копію з новим ім'ям і кодом
    const newTemplateData = {
      name: `${templateData.name} (${t('company.invoiceTemplates.copy')})`,
      code: `${templateData.code}_copy_${Date.now()}`,
      html_template: templateData.html_template,
      css_styles: templateData.css_styles,
      description: templateData.description,
      is_default: false, // Копія не може бути шаблоном за замовчуванням
      is_active: templateData.is_active,
      metadata: templateData.metadata,
    }

    await InvoiceTemplatesApi.createTemplate(newTemplateData)

    $q.notify({
      color: 'positive',
      message: t('company.invoiceTemplates.duplicateSuccess'),
      icon: 'content_copy',
    })

    loadTemplates()
  } catch (error) {
    console.error('Error duplicating template:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.creating'),
      icon: 'error',
    })
  }
}

const setAsDefault = async (template) => {
  try {
    await InvoiceTemplatesApi.updateTemplate(template.id, { is_default: true })

    $q.notify({
      color: 'positive',
      message: t('company.invoiceTemplates.defaultSuccess'),
      icon: 'star',
    })

    loadTemplates()
  } catch (error) {
    console.error('Error setting default template:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.saving'),
      icon: 'error',
    })
  }
}

const confirmDelete = (template) => {
  $q.dialog({
    title: t('common.confirmDelete'),
    message: t('company.invoiceTemplates.deleteConfirm', { name: template.name }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await InvoiceTemplatesApi.deleteTemplate(template.id)

      $q.notify({
        color: 'positive',
        message: t('company.invoiceTemplates.deleteSuccess'),
        icon: 'delete',
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
  })
}

// Lifecycle
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.preview-iframe {
  width: 100%;
  height: 80vh;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.code-preview {
  margin: 0;
  padding: 10px;
  overflow: auto;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 80vh;
}
</style>
