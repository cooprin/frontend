<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h6">{{ $t('company.documents.title') }}</div>
      <q-btn
        color="primary"
        :label="$t('company.documents.uploadNew')"
        icon="upload"
        @click="openUploadDialog()"
      />
    </div>

    <q-table
      :rows="documents"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
      :no-data-label="$t('company.documents.noDocuments')"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="col.name === 'document_name'">
              <a :href="getDocumentUrl(props.row.file_path)" target="_blank" class="text-primary">
                {{ col.value }}
              </a>
            </div>
            <div v-else-if="col.name === 'document_type'">
              <q-chip :color="getDocumentTypeColor(col.value)" text-color="white" size="sm" dense>
                {{ col.value.toUpperCase() }}
              </q-chip>
            </div>
            <div v-else-if="col.name === 'effective_date' || col.name === 'expiry_date'">
              {{ col.value ? formatDate(col.value) : '-' }}
            </div>
            <div v-else-if="col.name === 'file_size'">
              {{ formatFileSize(col.value) }}
            </div>
            <div v-else>
              {{ col.value }}
            </div>
          </q-td>
          <q-td auto-width>
            <q-btn
              flat
              round
              color="primary"
              icon="download"
              size="sm"
              @click="downloadDocument(props.row)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Діалогове вікно для завантаження документа -->
    <q-dialog v-model="showUploadDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('company.documents.uploadDocument') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md q-px-md">
          <q-form @submit="uploadDocument" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- Назва документа -->
              <div class="col-12">
                <q-input
                  v-model="form.document_name"
                  :label="$t('company.documents.documentName')"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <!-- Тип документа -->
              <div class="col-12">
                <q-select
                  v-model="form.document_type"
                  :options="documentTypes"
                  :label="$t('company.documents.documentType')"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <!-- Дати в одному рядку -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.effective_date"
                  :label="$t('company.documents.effectiveDate')"
                  outlined
                  dense
                  class="q-mb-md"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="effectiveDateProxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="form.effective_date" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup :label="$t('common.close')" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.expiry_date"
                  :label="$t('company.documents.expiryDate')"
                  outlined
                  dense
                  class="q-mb-md"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="expiryDateProxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="form.expiry_date" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup :label="$t('common.close')" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- Опис -->
              <div class="col-12">
                <q-input
                  v-model="form.description"
                  :label="$t('company.documents.description')"
                  type="textarea"
                  outlined
                  dense
                  autogrow
                  class="q-mb-md"
                />
              </div>

              <!-- Файл -->
              <div class="col-12">
                <q-file
                  v-model="fileInput"
                  :label="$t('company.documents.file')"
                  outlined
                  dense
                  bottom-slots
                  counter
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      v-if="fileInput"
                      name="close"
                      @click.stop="fileInput = null"
                      class="cursor-pointer"
                    />
                  </template>
                  <template v-slot:hint>
                    {{ $t('company.documents.maxFileSize') }}
                  </template>
                </q-file>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            :label="$t('company.documents.upload')"
            color="primary"
            @click="uploadDocument"
            :loading="uploading"
            :disable="!fileInput"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог підтвердження видалення -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('company.documents.confirmDelete') }}</div>
        </q-card-section>

        <q-card-section>
          {{ $t('company.documents.deleteWarning') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            :label="$t('common.delete')"
            color="negative"
            @click="deleteDocument"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'
import { CompanyApi } from 'src/api/company'

const $q = useQuasar()
const { t } = useI18n()

// Стани
const documents = ref([])
const loading = ref(false)
const showUploadDialog = ref(false)
const showDeleteDialog = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const currentDocumentId = ref(null)
const fileInput = ref(null)

// Форма для завантаження
const form = ref({
  document_name: '',
  document_type: 'contract',
  effective_date: '',
  expiry_date: '',
  description: '',
})

// Колонки для таблиці
const columns = [
  {
    name: 'document_name',
    label: t('company.documents.documentName'),
    field: 'document_name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'document_type',
    label: t('company.documents.documentType'),
    field: 'document_type',
    sortable: true,
    align: 'center',
  },
  {
    name: 'effective_date',
    label: t('company.documents.effectiveDate'),
    field: 'effective_date',
    sortable: true,
    align: 'center',
  },
  {
    name: 'expiry_date',
    label: t('company.documents.expiryDate'),
    field: 'expiry_date',
    sortable: true,
    align: 'center',
  },
  {
    name: 'file_size',
    label: t('company.documents.fileSize'),
    field: 'file_size',
    sortable: true,
    align: 'center',
  },
  {
    name: 'created_at',
    label: t('company.documents.uploadDate'),
    field: 'created_at',
    sortable: true,
    align: 'center',
    format: (val) => formatDate(val),
  },
]

// Типи документів
const documentTypes = [
  'contract',
  'statute',
  'license',
  'certificate',
  'policy',
  'statement',
  'other',
]

// Методи
const loadDocuments = async () => {
  loading.value = true
  try {
    const response = await CompanyApi.getLegalDocuments()
    documents.value = response.data.documents || []
  } catch (error) {
    console.error('Error loading legal documents:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD.MM.YYYY')
}

const formatFileSize = (bytes) => {
  if (!bytes) return '-'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const getDocumentTypeColor = (type) => {
  const colors = {
    contract: 'primary',
    statute: 'secondary',
    license: 'green',
    certificate: 'purple',
    policy: 'orange',
    statement: 'blue',
    other: 'grey',
  }

  return colors[type] || 'grey'
}

const getDocumentUrl = (filePath) => {
  return CompanyApi.getDocumentUrl(filePath)
}

const openUploadDialog = () => {
  // Скидаємо форму до значень за замовчуванням
  form.value = {
    document_name: '',
    document_type: 'contract',
    effective_date: '',
    expiry_date: '',
    description: '',
  }
  fileInput.value = null

  showUploadDialog.value = true
}

const uploadDocument = async () => {
  if (!fileInput.value) return

  uploading.value = true
  try {
    const formData = new FormData()

    // Додаємо файл
    formData.append('file', fileInput.value)

    // Додаємо інші поля форми
    Object.keys(form.value).forEach((key) => {
      if (form.value[key]) {
        formData.append(key, form.value[key])
      }
    })

    await CompanyApi.uploadLegalDocument(formData)

    $q.notify({
      color: 'positive',
      message: t('company.documents.uploadSuccess'),
      icon: 'check',
    })

    // Закриваємо діалог і оновлюємо список
    showUploadDialog.value = false
    await loadDocuments()
  } catch (error) {
    console.error('Error uploading document:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    uploading.value = false
  }
}

const downloadDocument = (document) => {
  const url = getDocumentUrl(document.file_path)
  window.open(url, '_blank')
}

const confirmDelete = (document) => {
  currentDocumentId.value = document.id
  showDeleteDialog.value = true
}

const deleteDocument = async () => {
  deleting.value = true
  try {
    await CompanyApi.deleteLegalDocument(currentDocumentId.value)

    $q.notify({
      color: 'positive',
      message: t('company.documents.deleteSuccess'),
      icon: 'check',
    })

    // Закриваємо діалог і оновлюємо список
    showDeleteDialog.value = false
    await loadDocuments()
  } catch (error) {
    console.error('Error deleting document:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.deleting'),
      icon: 'error',
    })
  } finally {
    deleting.value = false
  }
}

// Життєвий цикл
onMounted(() => {
  loadDocuments()
})
</script>
