<template>
  <div class="model-files">
    <div class="q-mb-md">
      <div class="row justify-between items-center">
        <div>{{ $t('models.files.title') }}</div>
        <q-btn
          color="primary"
          :label="$t('models.files.add')"
          icon="add"
          dense
          @click="openUploadDialog"
        />
      </div>
      <q-expansion-item
        switch-toggle-side
        expand-separator
        :label="$t('models.files.title')"
        :caption="
          files.length
            ? $t('models.files.count', { count: files.length })
            : $t('models.files.empty')
        "
        header-class="text-primary"
      >
        <q-card>
          <q-card-section>
            <div v-if="!files.length" class="text-center q-pa-md text-grey">
              {{ $t('models.files.noFiles') }}
            </div>
            <div v-else>
              <q-list bordered separator>
                <q-item v-for="file in files" :key="file.id" clickable @click="downloadFile(file)">
                  <q-item-section avatar>
                    <q-icon :name="getFileIcon(file.file_type)" size="md" color="primary" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ file.file_name }}</q-item-label>
                    <q-item-label caption>
                      {{ formatFileSize(file.file_size) }} • {{ formatDate(file.created_at) }}
                      <span v-if="file.description" class="q-ml-sm">• {{ file.description }}</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      @click.stop="confirmDeleteFile(file)"
                    >
                      <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>

    <!-- Діалог завантаження файлу -->
    <q-dialog v-model="uploadDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('models.files.upload') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="uploadFile" class="q-gutter-md">
            <q-file
              v-model="fileToUpload"
              :label="$t('models.files.selectFile')"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              outlined
              counter
              bottom-slots
              :rules="[(val) => !!val || $t('common.validation.required')]"
              @rejected="onFileRejected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:hint>
                {{ $t('models.files.hint') }}
              </template>
            </q-file>

            <q-input
              v-model="fileDescription"
              :label="$t('models.files.description')"
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
              <q-btn
                :label="$t('common.upload')"
                color="primary"
                type="submit"
                :loading="uploading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Діалог підтвердження видалення файлу -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('models.files.deleteConfirmation') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteFile"
            :loading="deleting"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ModelsApi } from 'src/api/models'

const props = defineProps({
  modelId: {
    type: String, // UUID приходить як рядок
    required: true,
  },
  refreshTrigger: {
    type: Number,
    default: 0,
  },
})

const $q = useQuasar()
const { t, d } = useI18n()

// State
const files = ref([])
const loading = ref(false)
const uploadDialog = ref(false)
const fileToUpload = ref(null)
const fileDescription = ref('')
const uploading = ref(false)
const deleteDialog = ref(false)
const fileToDelete = ref(null)
const deleting = ref(false)

// Methods
const loadFiles = async () => {
  if (!props.modelId) return

  loading.value = true
  try {
    const response = await ModelsApi.getModelFiles(props.modelId)
    files.value = response.data.files
  } catch (error) {
    console.error('Error loading model files:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const openUploadDialog = () => {
  fileToUpload.value = null
  fileDescription.value = ''
  uploadDialog.value = true
}

const uploadFile = async () => {
  if (!fileToUpload.value) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', fileToUpload.value)
    if (fileDescription.value) {
      formData.append('description', fileDescription.value)
    }

    await ModelsApi.uploadModelFile(props.modelId, formData)

    $q.notify({
      color: 'positive',
      message: t('models.files.uploadSuccess'),
      icon: 'check',
    })

    uploadDialog.value = false
    loadFiles()
  } catch (error) {
    console.error('Error uploading file:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.uploading'),
      icon: 'error',
    })
  } finally {
    uploading.value = false
  }
}

const confirmDeleteFile = (file) => {
  fileToDelete.value = file
  deleteDialog.value = true
}

const deleteFile = async () => {
  if (!fileToDelete.value) return

  deleting.value = true
  try {
    await ModelsApi.deleteModelFile(props.modelId, fileToDelete.value.id)

    $q.notify({
      color: 'positive',
      message: t('models.files.deleteSuccess'),
      icon: 'check',
    })

    loadFiles()
  } catch (error) {
    console.error('Error deleting file:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errors.deleting'),
      icon: 'error',
    })
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

const downloadFile = (file) => {
  const fileUrl = ModelsApi.getFileUrl(file.file_path)
  window.open(fileUrl, '_blank')
}

const onFileRejected = () => {
  $q.notify({
    color: 'negative',
    message: t('models.files.invalidFile'),
    icon: 'error',
  })
}

// Helpers
const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('word')) return 'description'
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'table_chart'
  if (fileType.includes('text')) return 'text_snippet'
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'inventory_2'
  return 'insert_drive_file'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatDate = (dateString) => {
  return d(new Date(dateString), 'short')
}

// Lifecycle
onMounted(() => {
  loadFiles()
})

// Watch for model changes or external refresh triggers
watch(
  () => [props.modelId, props.refreshTrigger],
  () => {
    loadFiles()
  },
)
</script>

<style scoped>
.model-files {
  max-width: 100%;
}

.file-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark .file-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
