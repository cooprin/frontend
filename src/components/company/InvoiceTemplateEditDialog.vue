<template>
  <q-dialog v-model="show" persistent maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{
            isEdit
              ? $t('company.invoiceTemplates.editTemplate')
              : $t('company.invoiceTemplates.createTemplate')
          }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Ліва колонка - основна інформація -->
            <div class="col-12 col-md-4">
              <q-card bordered flat>
                <q-card-section>
                  <div class="text-subtitle1">{{ $t('company.invoiceTemplates.basicInfo') }}</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <!-- Назва шаблону -->
                  <q-input
                    v-model="form.name"
                    :label="$t('company.invoiceTemplates.name')"
                    :rules="[(val) => !!val || $t('common.validation.required')]"
                    lazy-rules
                    outlined
                    dense
                    class="q-mb-md"
                  />

                  <!-- Код шаблону -->
                  <q-input
                    v-model="form.code"
                    :label="$t('company.invoiceTemplates.code')"
                    :rules="[(val) => !!val || $t('common.validation.required')]"
                    lazy-rules
                    outlined
                    dense
                    :readonly="isEdit"
                    :hint="isEdit ? $t('company.invoiceTemplates.codeReadOnly') : ''"
                    class="q-mb-md"
                  />

                  <!-- Опис -->
                  <q-input
                    v-model="form.description"
                    :label="$t('company.invoiceTemplates.description')"
                    type="textarea"
                    outlined
                    dense
                    class="q-mb-md"
                    autogrow
                  />

                  <!-- Активний -->
                  <q-toggle
                    v-model="form.is_active"
                    :label="$t('company.invoiceTemplates.isActive')"
                    color="primary"
                    class="q-mb-md"
                  />

                  <!-- За замовчуванням -->
                  <q-toggle
                    v-model="form.is_default"
                    :label="$t('company.invoiceTemplates.isDefault')"
                    color="primary"
                    class="q-mb-md"
                  />

                  <!-- Кнопки дій -->
                  <div class="q-gutter-sm">
                    <q-btn
                      v-if="!isNew"
                      flat
                      color="primary"
                      icon="file_download"
                      :label="$t('company.invoiceTemplates.exportTemplate')"
                      @click="exportTemplate"
                    />

                    <q-btn
                      v-if="isNew"
                      flat
                      color="primary"
                      icon="file_upload"
                      :label="$t('company.invoiceTemplates.importTemplate')"
                      @click="importDialogOpened = true"
                    />

                    <q-btn
                      flat
                      color="primary"
                      icon="auto_fix_high"
                      :label="$t('company.invoiceTemplates.useDefaultTemplate')"
                      @click="loadDefaultTemplate"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Права колонка - HTML і CSS -->
            <div class="col-12 col-md-8">
              <q-card bordered flat>
                <q-tabs
                  v-model="editorTab"
                  class="text-grey"
                  active-color="primary"
                  indicator-color="primary"
                  align="justify"
                  narrow-indicator
                >
                  <q-tab name="html" :label="$t('company.invoiceTemplates.htmlTemplate')" />
                  <q-tab name="css" :label="$t('company.invoiceTemplates.cssStyles')" />
                  <q-tab name="preview" :label="$t('company.invoiceTemplates.preview')" />
                  <q-tab name="help" :label="$t('company.invoiceTemplates.help')" />
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="editorTab" animated style="min-height: 400px">
                  <!-- HTML Editor -->
                  <q-tab-panel name="html" class="q-pa-none">
                    <q-input
                      v-model="form.html_template"
                      type="textarea"
                      :placeholder="$t('company.invoiceTemplates.htmlPlaceholder')"
                      :rules="[(val) => !!val || $t('common.validation.required')]"
                      filled
                      autogrow
                      class="code-editor"
                    />
                  </q-tab-panel>

                  <!-- CSS Editor -->
                  <q-tab-panel name="css" class="q-pa-none">
                    <q-input
                      v-model="form.css_styles"
                      type="textarea"
                      :placeholder="$t('company.invoiceTemplates.cssPlaceholder')"
                      filled
                      autogrow
                      class="code-editor"
                    />
                  </q-tab-panel>

                  <!-- Preview -->
                  <q-tab-panel name="preview" class="q-pa-none">
                    <div class="q-pa-md">
                      <iframe
                        ref="previewFrame"
                        class="preview-iframe"
                        :srcdoc="previewHtml"
                      ></iframe>
                    </div>
                  </q-tab-panel>

                  <!-- Help & Template Variables -->
                  <q-tab-panel name="help">
                    <div class="text-h6 q-mb-md">
                      {{ $t('company.invoiceTemplates.helpTitle') }}
                    </div>

                    <p>{{ $t('company.invoiceTemplates.helpDescription') }}</p>

                    <div class="text-subtitle1 q-mt-lg q-mb-md">
                      {{ $t('company.invoiceTemplates.availableVariables') }}
                    </div>

                    <q-markup-table flat bordered>
                      <thead>
                        <tr>
                          <th>{{ $t('company.invoiceTemplates.variableName') }}</th>
                          <th>{{ $t('company.invoiceTemplates.variableDescription') }}</th>
                          <th>{{ $t('company.invoiceTemplates.example') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>invoice.invoice_number</code></td>
                          <td>{{ $t('company.invoiceTemplates.invoiceNumber') }}</td>
                          <td>2023-0001</td>
                        </tr>
                        <tr>
                          <td><code>invoice.invoice_date</code></td>
                          <td>{{ $t('company.invoiceTemplates.invoiceDate') }}</td>
                          <td>2023-06-01</td>
                        </tr>
                        <tr>
                          <td><code>invoice.total_amount</code></td>
                          <td>{{ $t('company.invoiceTemplates.totalAmount') }}</td>
                          <td>1250.00</td>
                        </tr>
                        <tr>
                          <td><code>invoice.client_name</code></td>
                          <td>{{ $t('company.invoiceTemplates.clientName') }}</td>
                          <td>ТОВ "Компанія"</td>
                        </tr>
                        <tr>
                          <td><code>invoice.client_address</code></td>
                          <td>{{ $t('company.invoiceTemplates.clientAddress') }}</td>
                          <td>м. Київ, вул. Хрещатик, 1</td>
                        </tr>
                        <tr>
                          <td><code>invoice.billing_month</code></td>
                          <td>{{ $t('company.invoiceTemplates.billingMonth') }}</td>
                          <td>6</td>
                        </tr>
                        <tr>
                          <td><code>invoice.billing_year</code></td>
                          <td>{{ $t('company.invoiceTemplates.billingYear') }}</td>
                          <td>2023</td>
                        </tr>
                        <tr>
                          <td><code>invoice.items</code></td>
                          <td>{{ $t('company.invoiceTemplates.items') }}</td>
                          <td>масив позицій рахунку</td>
                        </tr>
                        <tr>
                          <td><code>company.legal_name</code></td>
                          <td>{{ $t('company.invoiceTemplates.companyName') }}</td>
                          <td>ТОВ "Наша Компанія"</td>
                        </tr>
                        <tr>
                          <td><code>company.edrpou</code></td>
                          <td>{{ $t('company.invoiceTemplates.companyEdrpou') }}</td>
                          <td>12345678</td>
                        </tr>
                        <tr>
                          <td><code>company.legal_address</code></td>
                          <td>{{ $t('company.invoiceTemplates.companyAddress') }}</td>
                          <td>м. Київ, вул. Шевченка, 1</td>
                        </tr>
                        <tr>
                          <td><code>formattedDate</code></td>
                          <td>{{ $t('company.invoiceTemplates.formattedDate') }}</td>
                          <td>01.06.2023</td>
                        </tr>
                        <tr>
                          <td><code>formattedTotal</code></td>
                          <td>{{ $t('company.invoiceTemplates.formattedTotal') }}</td>
                          <td>1 250,00 ₴</td>
                        </tr>
                        <tr>
                          <td><code>currentDate</code></td>
                          <td>{{ $t('company.invoiceTemplates.currentDate') }}</td>
                          <td>15.06.2023</td>
                        </tr>
                      </tbody>
                    </q-markup-table>

                    <div class="text-subtitle1 q-mt-lg q-mb-md">
                      {{ $t('company.invoiceTemplates.handlebarHelpers') }}
                    </div>

                    <q-markup-table flat bordered>
                      <thead>
                        <tr>
                          <th>{{ $t('company.invoiceTemplates.helper') }}</th>
                          <th>{{ $t('company.invoiceTemplates.usage') }}</th>
                          <th>{{ $t('company.invoiceTemplates.description') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>each</code></td>
                          <td>
                            <div v-pre>
                              <code>{{#each invoice.items}} ... {{/each}}</code>
                            </div>
                          </td>
                          <td>{{ $t('company.invoiceTemplates.eachHelper') }}</td>
                        </tr>
                        <tr>
                          <td><code>if</code></td>
                          <td>
                            <div v-pre>
                              <code>{{#if invoice.notes}} ... {{/if}}</code>
                            </div>
                          </td>
                          <td>{{ $t('company.invoiceTemplates.ifHelper') }}</td>
                        </tr>
                        <tr>
                          <td><code>formatCurrency</code></td>
                          <td>
                            <div v-pre>
                              <code>{{formatCurrency total_price}}</code>
                            </div>
                          </td>
                          <td>{{ $t('company.invoiceTemplates.formatCurrencyHelper') }}</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </q-tab-panel>
                </q-tab-panels>
              </q-card>
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
            <q-btn :label="$t('common.save')" color="primary" type="submit" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Діалог імпорту файлу -->
    <q-dialog v-model="importDialogOpened">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('company.invoiceTemplates.importTemplate') }}</div>
        </q-card-section>

        <q-card-section>
          <q-file
            v-model="importFile"
            :label="$t('company.invoiceTemplates.selectTemplateFile')"
            accept=".html,.htm"
            outlined
            clearable
          />

          <div class="q-mt-md">
            <q-checkbox v-model="importCss" :label="$t('company.invoiceTemplates.importCssAlso')" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.import')"
            color="primary"
            @click="processImport"
            :disable="!importFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { InvoiceTemplatesApi } from 'src/api/invoice-templates'
import defaultTemplate from 'assets/invoice-templates/default-template.html?raw'
import defaultCss from 'assets/invoice-templates/default-template.css?raw'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  templateId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const { t } = useI18n()

// State
const loading = ref(false)
const editorTab = ref('html')
const form = ref({
  name: '',
  code: '',
  html_template: '',
  css_styles: '',
  description: '',
  is_active: true,
  is_default: false,
})
const importDialogOpened = ref(false)
const importFile = ref(null)
const importCss = ref(true)

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.templateId)
const isNew = computed(() => !props.templateId)

const previewHtml = computed(() => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Попередній перегляд шаблону</title>
        <style>
          ${form.value.css_styles || ''}
          body { font-family: 'Arial', sans-serif; padding: 20px; }
          .preview-container { max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="preview-container">
          ${form.value.html_template || ''}
        </div>
      </body>
    </html>
  `
})

// Methods
const loadTemplate = async () => {
  if (!props.templateId) {
    resetForm()
    return
  }

  loading.value = true
  try {
    const response = await InvoiceTemplatesApi.getTemplateById(props.templateId)
    const template = response.data.template

    form.value = {
      name: template.name,
      code: template.code,
      html_template: template.html_template,
      css_styles: template.css_styles || '',
      description: template.description || '',
      is_active: template.is_active !== false,
      is_default: template.is_default || false,
    }
  } catch (error) {
    console.error('Error loading template:', error)
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
  form.value = {
    name: '',
    code: `invoice_template_${Date.now()}`,
    html_template: '',
    css_styles: '',
    description: '',
    is_active: true,
    is_default: false,
  }
}

const loadDefaultTemplate = () => {
  form.value.html_template = defaultTemplate || ''
  form.value.css_styles = defaultCss || ''

  // Переключаємось на вкладку попереднього перегляду
  editorTab.value = 'preview'

  $q.notify({
    color: 'positive',
    message: t('company.invoiceTemplates.defaultTemplateLoaded'),
    icon: 'check',
  })
}

const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await InvoiceTemplatesApi.updateTemplate(props.templateId, form.value)
    } else {
      await InvoiceTemplatesApi.createTemplate(form.value)
    }

    $q.notify({
      color: 'positive',
      message: isEdit.value
        ? t('company.invoiceTemplates.updateSuccess')
        : t('company.invoiceTemplates.createSuccess'),
      icon: 'check',
    })

    show.value = false
    emit('saved')
  } catch (error) {
    console.error('Error saving template:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const exportTemplate = () => {
  // Створюємо об'єкт для експорту
  const exportData = {
    name: form.value.name,
    code: form.value.code,
    html_template: form.value.html_template,
    css_styles: form.value.css_styles,
    description: form.value.description,
  }

  // Конвертуємо в JSON
  const jsonData = JSON.stringify(exportData, null, 2)

  // Створюємо blob та посилання для завантаження
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // Створюємо посилання та імітуємо клік
  const a = document.createElement('a')
  a.href = url
  a.download = `${form.value.code}.json`
  document.body.appendChild(a)
  a.click()

  // Прибираємо посилання
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)

  $q.notify({
    color: 'positive',
    message: t('company.invoiceTemplates.exportSuccess'),
    icon: 'file_download',
  })
}

const processImport = async () => {
  if (!importFile.value) return

  try {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const fileContent = e.target.result

        // Перевіряємо чи це JSON файл
        if (importFile.value.name.endsWith('.json')) {
          // Парсимо JSON
          const templateData = JSON.parse(fileContent)
          form.value.html_template = templateData.html_template || ''
          if (importCss.value) {
            form.value.css_styles = templateData.css_styles || ''
          }

          // Можна також імпортувати інші поля, якщо потрібно
          if (templateData.name) form.value.name = templateData.name
          if (templateData.description) form.value.description = templateData.description
        } else {
          // Якщо це HTML файл, просто імпортуємо вміст
          form.value.html_template = fileContent
        }

        $q.notify({
          color: 'positive',
          message: t('company.invoiceTemplates.importSuccess'),
          icon: 'file_upload',
        })

        importDialogOpened.value = false
        editorTab.value = 'preview'
      } catch (error) {
        console.error('Error parsing imported file:', error)
        $q.notify({
          color: 'negative',
          message: t('company.invoiceTemplates.importError'),
          icon: 'error',
        })
      }
    }

    reader.onerror = () => {
      $q.notify({
        color: 'negative',
        message: t('company.invoiceTemplates.readError'),
        icon: 'error',
      })
    }

    reader.readAsText(importFile.value)
  } catch (error) {
    console.error('Error importing file:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.processing'),
      icon: 'error',
    })
  }
}

// Watchers
watch(
  () => props.templateId,
  () => {
    if (show.value) {
      if (props.templateId) {
        loadTemplate()
      } else {
        resetForm()
      }
    }
  },
)

watch(
  () => show.value,
  (newVal) => {
    if (newVal) {
      if (props.templateId) {
        loadTemplate()
      } else {
        resetForm()
      }
      editorTab.value = 'html'
    }
  },
)

// Lifecycle
onMounted(() => {
  if (show.value && props.templateId) {
    loadTemplate()
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.preview-iframe {
  width: 100%;
  height: 80vh;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.code-editor {
  min-height: 400px;
}
</style>
