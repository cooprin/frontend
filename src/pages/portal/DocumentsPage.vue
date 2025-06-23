<template>
  <q-page padding>
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-md">
          <div class="col-auto">
            <div class="text-h5">
              {{ $t('portal.pages.documents.title') }}
            </div>
            <div class="text-subtitle2 text-grey-7">
              {{ $t('portal.pages.documents.description') }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="refresh"
              :label="$t('common.refresh')"
              @click="loadDocuments"
              :loading="loading"
            />
          </div>
        </div>

        <!-- Search and Filters -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="searchQuery"
                  :placeholder="$t('portal.pages.documents.search')"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterDocuments"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="selectedType"
                  :options="documentTypes"
                  :label="$t('portal.pages.documents.type')"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  @update:model-value="filterDocuments"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="sortBy"
                  :options="sortOptions"
                  :label="$t('common.sortBy')"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="sortDocuments"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="40px" color="primary" />
          <div class="q-mt-sm">{{ $t('portal.messages.loading') }}</div>
        </div>

        <!-- Documents Grid -->
        <div v-else-if="filteredDocuments.length > 0">
          <!-- View Toggle -->
          <div class="row items-center justify-between q-mb-md">
            <div class="col-auto">
              <div class="text-subtitle2 text-grey-7">
                {{ $t('common.total') }}: {{ filteredDocuments.length }}
              </div>
            </div>
            <div class="col-auto">
              <q-btn-toggle
                v-model="viewMode"
                :options="[
                  { label: '', value: 'grid', icon: 'grid_view' },
                  { label: '', value: 'list', icon: 'view_list' },
                ]"
                flat
                dense
              />
            </div>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="row q-gutter-md">
            <div
              v-for="document in filteredDocuments"
              :key="document.id"
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <q-card class="document-card" bordered clickable @click="previewDocument(document)">
                <q-card-section class="text-center q-pa-lg">
                  <!-- File Icon -->
                  <q-icon
                    :name="getFileIcon(document.document_type)"
                    :color="getFileColor(document.document_type)"
                    size="64px"
                    class="q-mb-md"
                  />

                  <!-- File Name -->
                  <div class="text-h6 text-weight-medium q-mb-sm">
                    {{ document.document_name }}
                  </div>

                  <!-- File Type -->
                  <q-chip
                    :color="getFileColor(document.document_type)"
                    text-color="white"
                    :label="document.document_type.toUpperCase()"
                    dense
                    class="q-mb-sm"
                  />

                  <!-- File Size -->
                  <div class="text-caption text-grey-6">
                    {{ formatFileSize(document.file_size) }}
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pa-sm">
                  <div class="text-caption text-grey-7">
                    {{ $t('portal.pages.documents.uploadDate') }}:
                    {{ formatDate(document.created_at) }}
                  </div>
                  <div v-if="document.description" class="text-caption text-grey-6 q-mt-xs">
                    {{ truncateText(document.description, 50) }}
                  </div>
                </q-card-section>

                <!-- Actions -->
                <q-card-actions align="right" class="q-pa-sm">
                  <q-btn
                    flat
                    round
                    icon="download"
                    color="primary"
                    size="sm"
                    @click.stop="downloadDocument(document)"
                  >
                    <q-tooltip>{{ $t('portal.pages.documents.download') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canPreview(document.document_type)"
                    flat
                    round
                    icon="visibility"
                    color="secondary"
                    size="sm"
                    @click.stop="previewDocument(document)"
                  >
                    <q-tooltip>{{ $t('common.preview') }}</q-tooltip>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>

          <!-- List View -->
          <q-table
            v-else
            :rows="filteredDocuments"
            :columns="tableColumns"
            row-key="id"
            flat
            bordered
            :rows-per-page-options="[10, 25, 50]"
            class="documents-table"
          >
            <template v-slot:body-cell-document_name="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-sm">
                  <q-icon
                    :name="getFileIcon(props.row.document_type)"
                    :color="getFileColor(props.row.document_type)"
                    size="24px"
                  />
                  <div>
                    <div class="text-weight-medium">{{ props.value }}</div>
                    <div v-if="props.row.description" class="text-caption text-grey-6">
                      {{ truncateText(props.row.description, 60) }}
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-document_type="props">
              <q-td :props="props">
                <q-chip
                  :color="getFileColor(props.value)"
                  text-color="white"
                  :label="props.value.toUpperCase()"
                  dense
                />
              </q-td>
            </template>

            <template v-slot:body-cell-file_size="props">
              <q-td :props="props">
                {{ formatFileSize(props.value) }}
              </q-td>
            </template>

            <template v-slot:body-cell-created_at="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  icon="download"
                  color="primary"
                  size="sm"
                  @click="downloadDocument(props.row)"
                >
                  <q-tooltip>{{ $t('portal.pages.documents.download') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canPreview(props.row.document_type)"
                  flat
                  round
                  icon="visibility"
                  color="secondary"
                  size="sm"
                  @click="previewDocument(props.row)"
                  class="q-ml-xs"
                >
                  <q-tooltip>{{ $t('common.preview') }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="folder_open" size="80px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">
            {{
              searchQuery || selectedType
                ? $t('portal.pages.documents.noFilteredDocuments')
                : $t('portal.pages.documents.noDocuments')
            }}
          </div>
          <div v-if="searchQuery || selectedType" class="q-mt-sm">
            <q-btn color="primary" :label="$t('common.clearFilters')" @click="clearFilters" />
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center q-py-md">
          <q-icon name="error" size="48px" color="negative" />
          <div class="q-mt-sm text-negative">{{ error }}</div>
          <q-btn
            color="primary"
            :label="$t('common.retry')"
            @click="loadDocuments"
            class="q-mt-md"
          />
        </div>
      </div>
    </div>

    <!-- Document Preview Dialog -->
    <q-dialog v-model="showPreview" maximized>
      <q-card>
        <q-card-section class="row items-center q-pa-md bg-primary text-white">
          <div class="text-h6">{{ previewDoc?.document_name }}</div>
          <q-space />
          <q-btn flat round icon="download" @click="downloadDocument(previewDoc)" class="q-mr-sm" />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none full-height">
          <!-- PDF Preview -->
          <iframe
            v-if="previewDoc && previewDoc.document_type === 'pdf'"
            :src="getDocumentUrl(previewDoc)"
            style="width: 100%; height: 70vh; border: none"
          />

          <!-- Image Preview -->
          <div
            v-else-if="previewDoc && isImageType(previewDoc.document_type)"
            class="full-height flex flex-center"
          >
            <q-img
              :src="getDocumentUrl(previewDoc)"
              style="max-width: 90%; max-height: 70vh"
              contain
            />
          </div>

          <!-- Text Preview -->
          <div
            v-else-if="previewDoc && isTextType(previewDoc.document_type)"
            class="q-pa-md"
            style="height: 70vh; overflow-y: auto"
          >
            <pre class="text-body1">{{ previewContent }}</pre>
          </div>

          <!-- Unsupported Preview -->
          <div v-else class="full-height flex flex-center">
            <div class="text-center">
              <q-icon name="description" size="80px" color="grey-4" />
              <div class="text-h6 text-grey-6 q-mt-md">
                {{ $t('portal.pages.documents.previewNotSupported') }}
              </div>
              <q-btn
                color="primary"
                :label="$t('portal.pages.documents.download')"
                @click="downloadDocument(previewDoc)"
                class="q-mt-md"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PortalApi } from 'src/api/portal'
import { date, Notify } from 'quasar'

const { t: $t } = useI18n()

// Reactive data
const documents = ref([])
const filteredDocuments = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const selectedType = ref(null)
const sortBy = ref('created_at_desc')
const viewMode = ref('grid')
const showPreview = ref(false)
const previewDoc = ref(null)
const previewContent = ref('')

// Computed options
const documentTypes = computed(() => {
  const types = [...new Set(documents.value.map((doc) => doc.document_type))]
  return types.map((type) => ({
    label: type.toUpperCase(),
    value: type,
  }))
})

const sortOptions = computed(() => [
  { label: $t('portal.pages.documents.documentName') + ' (А-Я)', value: 'name_asc' },
  { label: $t('portal.pages.documents.documentName') + ' (Я-А)', value: 'name_desc' },
  {
    label: $t('common.date') + ' (' + $t('portal.pages.documents.uploadDate') + ')',
    value: 'created_at_desc',
  },
  { label: $t('common.date') + ' (старі спочатку)', value: 'created_at_asc' },
  { label: $t('portal.pages.documents.fileSize') + ' (більші)', value: 'size_desc' },
  { label: $t('portal.pages.documents.fileSize') + ' (менші)', value: 'size_asc' },
  { label: $t('portal.pages.documents.type'), value: 'type_asc' },
])

const tableColumns = computed(() => [
  {
    name: 'document_name',
    label: $t('portal.pages.documents.documentName'),
    field: 'document_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'document_type',
    label: $t('portal.pages.documents.type'),
    field: 'document_type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'file_size',
    label: $t('portal.pages.documents.fileSize'),
    field: 'file_size',
    align: 'center',
    sortable: true,
  },
  {
    name: 'created_at',
    label: $t('portal.pages.documents.createdAt'),
    field: 'created_at',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: $t('common.actions'),
    field: 'actions',
    align: 'center',
  },
])

// Methods
const loadDocuments = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await PortalApi.getDocuments()

    if (response.data.success) {
      documents.value = response.data.documents
      filterDocuments()
    } else {
      error.value = response.data.message || 'Помилка завантаження документів'
    }
  } catch (err) {
    console.error('Error loading documents:', err)
    error.value = err.response?.data?.message || 'Помилка завантаження документів'
  } finally {
    loading.value = false
  }
}

const filterDocuments = () => {
  let filtered = [...documents.value]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (doc) =>
        doc.document_name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query),
    )
  }

  // Filter by type
  if (selectedType.value) {
    filtered = filtered.filter((doc) => doc.document_type === selectedType.value)
  }

  filteredDocuments.value = filtered
  sortDocuments()
}

const sortDocuments = () => {
  const sorted = [...filteredDocuments.value]

  switch (sortBy.value) {
    case 'name_asc':
      sorted.sort((a, b) => a.document_name.localeCompare(b.document_name))
      break
    case 'name_desc':
      sorted.sort((a, b) => b.document_name.localeCompare(a.document_name))
      break
    case 'created_at_asc':
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'created_at_desc':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'size_asc':
      sorted.sort((a, b) => a.file_size - b.file_size)
      break
    case 'size_desc':
      sorted.sort((a, b) => b.file_size - a.file_size)
      break
    case 'type_asc':
      sorted.sort((a, b) => a.document_type.localeCompare(b.document_type))
      break
  }

  filteredDocuments.value = sorted
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = null
  filterDocuments()
}

const downloadDocument = async (document) => {
  try {
    const url = getDocumentUrl(document)
    const link = window.document.createElement('a')
    link.href = url
    link.download = document.document_name
    link.click()

    Notify.create({
      type: 'positive',
      message: 'Завантаження розпочато',
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    Notify.create({
      type: 'negative',
      message: 'Помилка завантаження документа',
    })
  }
}

const previewDocument = async (document) => {
  previewDoc.value = document
  showPreview.value = true

  // Load text content for text files
  if (isTextType(document.document_type)) {
    try {
      const response = await fetch(getDocumentUrl(document))
      previewContent.value = await response.text()
    } catch (error) {
      console.error('Error loading text content:', error)
      previewContent.value = 'Помилка завантаження вмісту файлу'
    }
  }
}

// Utility methods
const getFileIcon = (type) => {
  const icons = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    txt: 'article',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    zip: 'archive',
    rar: 'archive',
    excel: 'table_chart',
    xls: 'table_chart',
    xlsx: 'table_chart',
  }
  return icons[type.toLowerCase()] || 'insert_drive_file'
}

const getFileColor = (type) => {
  const colors = {
    pdf: 'red',
    doc: 'blue',
    docx: 'blue',
    txt: 'grey',
    jpg: 'green',
    jpeg: 'green',
    png: 'green',
    gif: 'green',
    zip: 'orange',
    rar: 'orange',
    excel: 'green',
    xls: 'green',
    xlsx: 'green',
  }
  return colors[type.toLowerCase()] || 'grey'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getDocumentUrl = (document) => {
  return PortalApi.getDocumentUrl(document.file_path)
}

const canPreview = (type) => {
  const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt']
  return previewableTypes.includes(type.toLowerCase())
}

const isImageType = (type) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif']
  return imageTypes.includes(type.toLowerCase())
}

const isTextType = (type) => {
  const textTypes = ['txt']
  return textTypes.includes(type.toLowerCase())
}

// Lifecycle
onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.document-card {
  transition: all 0.3s ease;
  height: 100%;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.documents-table {
  border-radius: 8px;
}

.documents-table .q-table__top {
  padding: 16px;
}

/* Grid responsive */
@media (max-width: 768px) {
  .document-card {
    margin-bottom: 16px;
  }
}

/* Preview dialog styles */
.q-dialog__inner {
  padding: 0 !important;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
