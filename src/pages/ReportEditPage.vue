<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <!-- Основна форма -->
      <div class="col-12 col-lg-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">
              {{ isEdit ? $t('reports.edit') : $t('reports.create') }}
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="saveReport" class="q-gutter-md">
              <!-- Основна інформація -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.name"
                    :label="$t('reports.name')"
                    :rules="[(val) => !!val || $t('validation.required')]"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.code"
                    :label="$t('reports.code')"
                    :rules="[(val) => !!val || $t('validation.required')]"
                    outlined
                    dense
                    :hint="$t('reports.codeHint')"
                  />
                </div>
              </div>

              <q-input
                v-model="form.description"
                :label="$t('reports.description')"
                type="textarea"
                outlined
                rows="3"
              />

              <!-- Конфігурація -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="form.output_format"
                    :options="outputFormatOptions"
                    :label="$t('reports.outputFormat')"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="form.execution_timeout"
                    :label="$t('reports.executionTimeout')"
                    type="number"
                    :min="1"
                    :max="300"
                    outlined
                    dense
                    suffix="сек"
                  />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="form.cache_duration"
                    :label="$t('reports.cacheDuration')"
                    type="number"
                    :min="0"
                    outlined
                    dense
                    suffix="хв"
                    :hint="$t('reports.cacheDurationHint')"
                  />
                </div>
              </div>

              <!-- SQL запит -->
              <div>
                <div class="text-subtitle2 q-mb-sm">{{ $t('reports.sqlQuery') }}</div>
                <q-input
                  v-model="form.sql_query"
                  :label="$t('reports.sqlQuery')"
                  :rules="[(val) => !!val || $t('validation.required')]"
                  type="textarea"
                  outlined
                  rows="10"
                  class="code-editor"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      dense
                      icon="play_arrow"
                      color="primary"
                      @click="previewQuery"
                      :loading="previewing"
                    >
                      <q-tooltip>{{ $t('reports.previewQuery') }}</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
              </div>

              <!-- Конфігурація графіків -->
              <div v-if="form.output_format === 'chart' || form.output_format === 'both'">
                <div class="text-subtitle2 q-mb-sm">{{ $t('reports.chartConfig') }}</div>
                <q-input
                  v-model="chartConfigJson"
                  :label="$t('reports.chartConfig')"
                  type="textarea"
                  outlined
                  rows="4"
                  :hint="$t('reports.chartConfigHint')"
                />
              </div>

              <!-- Статус -->
              <q-checkbox v-model="form.is_active" :label="$t('reports.isActive')" />

              <!-- Кнопки -->
              <div class="row q-gutter-sm">
                <q-btn :label="$t('common.save')" type="submit" color="primary" :loading="saving" />
                <q-btn :label="$t('common.cancel')" flat @click="$router.back()" />
                <q-btn
                  v-if="isEdit"
                  :label="$t('reports.testExecute')"
                  color="secondary"
                  @click="testExecute"
                  :loading="testing"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Бічна панель -->
      <div class="col-12 col-lg-4">
        <div class="q-gutter-md">
          <!-- Параметри -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">{{ $t('reports.parameters') }}</div>

              <q-btn
                :label="$t('reports.addParameter')"
                color="primary"
                outline
                size="sm"
                @click="addParameter"
                class="q-mb-md"
              />

              <div v-if="form.parameters && form.parameters.length > 0" class="q-gutter-sm">
                <q-card
                  v-for="(param, index) in form.parameters"
                  :key="index"
                  flat
                  bordered
                  class="parameter-card"
                >
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-weight-medium">{{ param.display_name }}</div>
                        <div class="text-caption text-grey-6">
                          {{ param.parameter_name }} ({{ param.parameter_type }})
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="edit"
                          @click="editParameter(index)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="delete"
                          color="negative"
                          @click="removeParameter(index)"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div v-else class="text-center text-grey-6 q-py-lg">
                {{ $t('reports.noParameters') }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Прив'язки до сторінок -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">{{ $t('reports.pageAssignments') }}</div>

              <q-btn
                :label="$t('reports.addPageAssignment')"
                color="primary"
                outline
                size="sm"
                @click="addPageAssignment"
                class="q-mb-md"
              />

              <div
                v-if="form.page_assignments && form.page_assignments.length > 0"
                class="q-gutter-sm"
              >
                <q-card
                  v-for="(assignment, index) in form.page_assignments"
                  :key="index"
                  flat
                  bordered
                  class="assignment-card"
                >
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-weight-medium">{{ assignment.page_title }}</div>
                        <div class="text-caption text-grey-6">{{ assignment.page_identifier }}</div>
                        <div v-if="assignment.auto_execute" class="text-caption text-positive">
                          {{ $t('reports.autoExecute') }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="edit"
                          @click="editPageAssignment(index)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="delete"
                          color="negative"
                          @click="removePageAssignment(index)"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div v-else class="text-center text-grey-6 q-py-lg">
                {{ $t('reports.noPageAssignments') }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Допомога -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">{{ $t('reports.help') }}</div>
              <div class="text-body2 q-mb-sm">
                <strong>{{ $t('reports.sqlParameters') }}:</strong>
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                {{ $t('reports.sqlParametersHint') }}
              </div>
              <q-btn
                :label="$t('reports.viewSchema')"
                color="info"
                outline
                size="sm"
                @click="viewDatabaseSchema"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Діалог параметра -->
    <q-dialog v-model="parameterDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingParameterIndex >= 0 ? $t('reports.editParameter') : $t('reports.addParameter')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveParameter" class="q-gutter-md">
            <q-input
              v-model="parameterForm.parameter_name"
              :label="$t('reports.parameterName')"
              :rules="[(val) => !!val || $t('validation.required')]"
              outlined
              dense
            />

            <q-input
              v-model="parameterForm.display_name"
              :label="$t('reports.displayName')"
              :rules="[(val) => !!val || $t('validation.required')]"
              outlined
              dense
            />

            <q-select
              v-model="parameterForm.parameter_type"
              :options="parameterTypeOptions"
              :label="$t('reports.parameterType')"
              outlined
              dense
              emit-value
              map-options
            />

            <q-input
              v-model="parameterForm.description"
              :label="$t('reports.description')"
              type="textarea"
              outlined
              rows="2"
            />

            <q-input
              v-model="parameterForm.default_value"
              :label="$t('reports.defaultValue')"
              outlined
              dense
            />

            <q-checkbox v-model="parameterForm.is_required" :label="$t('reports.isRequired')" />

            <q-input
              v-model.number="parameterForm.ordering"
              :label="$t('reports.ordering')"
              type="number"
              outlined
              dense
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="parameterDialog = false" />
          <q-btn color="primary" :label="$t('common.save')" @click="saveParameter" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог прив'язки сторінки -->
    <q-dialog v-model="assignmentDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingAssignmentIndex >= 0
                ? $t('reports.editPageAssignment')
                : $t('reports.addPageAssignment')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePageAssignment" class="q-gutter-md">
            <q-select
              v-model="assignmentForm.page_identifier"
              :options="pageIdentifierOptions"
              :label="$t('reports.pageIdentifier')"
              outlined
              dense
              emit-value
              map-options
            />

            <q-input
              v-model="assignmentForm.page_title"
              :label="$t('reports.pageTitle')"
              outlined
              dense
            />

            <q-input
              v-model.number="assignmentForm.display_order"
              :label="$t('reports.displayOrder')"
              type="number"
              outlined
              dense
            />

            <q-checkbox v-model="assignmentForm.is_visible" :label="$t('reports.isVisible')" />

            <q-checkbox v-model="assignmentForm.auto_execute" :label="$t('reports.autoExecute')" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="assignmentDialog = false" />
          <q-btn color="primary" :label="$t('common.save')" @click="savePageAssignment" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог попереднього перегляду -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('reports.queryPreview') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="previewDialog = false" />
        </q-card-section>

        <q-card-section>
          <q-table
            v-if="previewResults && previewResults.length > 0"
            :rows="previewResults"
            :columns="previewColumns"
            row-key="id"
            flat
            bordered
            :rows-per-page-options="[10]"
          />
          <div v-else class="text-center text-grey-6 q-py-xl">
            {{ $t('reports.noPreviewData') }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ReportsApi } from 'src/api/reports'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const previewing = ref(false)
const parameterDialog = ref(false)
const assignmentDialog = ref(false)
const previewDialog = ref(false)
const editingParameterIndex = ref(-1)
const editingAssignmentIndex = ref(-1)
const previewResults = ref([])

// Form data
const form = ref({
  name: '',
  code: '',
  description: '',
  sql_query: '',
  output_format: 'table',
  execution_timeout: 30,
  cache_duration: 0,
  is_active: true,
  parameters: [],
  page_assignments: [],
})

const parameterForm = ref({
  parameter_name: '',
  display_name: '',
  parameter_type: 'text',
  description: '',
  default_value: '',
  is_required: false,
  ordering: 0,
})

const assignmentForm = ref({
  page_identifier: '',
  page_title: '',
  display_order: 0,
  is_visible: true,
  auto_execute: false,
})

// Computed
const isEdit = computed(() => !!route.params.id)

const chartConfigJson = computed({
  get() {
    return JSON.stringify(form.value.chart_config || {}, null, 2)
  },
  set(value) {
    try {
      form.value.chart_config = JSON.parse(value)
    } catch {
      // Invalid JSON, keep previous value
    }
  },
})

const outputFormatOptions = computed(() => [
  { label: t('reports.formats.table'), value: 'table' },
  { label: t('reports.formats.chart'), value: 'chart' },
  { label: t('reports.formats.export'), value: 'export' },
  { label: t('reports.formats.both'), value: 'both' },
])

const parameterTypeOptions = computed(() => [
  { label: t('reports.parameterTypes.text'), value: 'text' },
  { label: t('reports.parameterTypes.number'), value: 'number' },
  { label: t('reports.parameterTypes.date'), value: 'date' },
  { label: t('reports.parameterTypes.datetime'), value: 'datetime' },
  { label: t('reports.parameterTypes.select'), value: 'select' },
  { label: t('reports.parameterTypes.multiselect'), value: 'multiselect' },
  { label: t('reports.parameterTypes.boolean'), value: 'boolean' },
  { label: t('reports.parameterTypes.clientId'), value: 'client_id' },
  { label: t('reports.parameterTypes.userId'), value: 'user_id' },
])

const pageIdentifierOptions = computed(() => [
  { label: t('reports.pages.clients'), value: 'clients' },
  { label: t('reports.pages.wialonObjects'), value: 'wialon-objects' },
  { label: t('reports.pages.invoices'), value: 'invoices' },
  { label: t('reports.pages.billing'), value: 'billing' },
  { label: t('reports.pages.products'), value: 'products' },
  { label: t('reports.pages.warehouses'), value: 'warehouses' },
  { label: t('reports.pages.services'), value: 'services' },
  { label: t('reports.pages.users'), value: 'users' },
  { label: t('reports.pages.audit'), value: 'audit' },
  { label: t('reports.pages.tickets'), value: 'tickets' },
  { label: t('reports.pages.chat'), value: 'chat' },
])

const previewColumns = computed(() => {
  if (!previewResults.value?.length) return []

  const firstRow = previewResults.value[0]
  return Object.keys(firstRow).map((key) => ({
    name: key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    field: key,
    align: 'left',
    sortable: true,
  }))
})

// Methods
const loadReport = async () => {
  if (!isEdit.value) return

  // Перевіряємо дозволи
  if (!authStore.hasAnyPermission(['reports.read'])) {
    $q.notify({
      type: 'negative',
      message: t('common.errors.noPermission'),
    })
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await ReportsApi.getReport(route.params.id)
    const report = response.data.report

    form.value = {
      name: report.name,
      code: report.code,
      description: report.description,
      sql_query: report.sql_query,
      output_format: report.output_format,
      execution_timeout: report.execution_timeout,
      cache_duration: report.cache_duration,
      chart_config: report.chart_config || {},
      is_active: report.is_active,
      parameters: report.parameters || [],
      page_assignments: report.page_assignments || [],
    }
  } catch (error) {
    console.error('Error loading report:', error)
    $q.notify({
      type: 'negative',
      message: t('reports.errorLoadingReport'),
    })
    router.back()
  } finally {
    loading.value = false
  }
}

const saveReport = async () => {
  // Перевіряємо дозволи
  const requiredPermission = isEdit.value ? 'reports.update' : 'reports.create'
  if (!authStore.hasAnyPermission([requiredPermission])) {
    $q.notify({
      type: 'negative',
      message: t('common.errors.noPermission'),
    })
    return
  }

  saving.value = true
  try {
    const data = { ...form.value }

    if (isEdit.value) {
      await ReportsApi.updateReport(route.params.id, data)
      $q.notify({
        type: 'positive',
        message: t('reports.updateSuccess'),
      })
    } else {
      await ReportsApi.createReport(data)
      $q.notify({
        type: 'positive',
        message: t('reports.createSuccess'),
      })
    }

    router.push({ name: 'reports' })
  } catch (error) {
    console.error('Error saving report:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('reports.saveError'),
    })
  } finally {
    saving.value = false
  }
}

const testExecute = async () => {
  testing.value = true
  try {
    const response = await ReportsApi.executeReport(route.params.id)
    $q.notify({
      type: 'positive',
      message: t('reports.testExecuteSuccess'),
      caption: `${response.data.rowsCount} ${t('reports.rowsReturned')}`,
    })
  } catch (error) {
    console.error('Error testing report:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('reports.testExecuteError'),
    })
  } finally {
    testing.value = false
  }
}

const previewQuery = async () => {
  previewing.value = true
  try {
    const response = await ReportsApi.previewSqlQuery(form.value.sql_query, {})
    previewResults.value = response.data.data || []
    previewDialog.value = true
  } catch (error) {
    console.error('Error previewing query:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('reports.previewError'),
    })
  } finally {
    previewing.value = false
  }
}

const addParameter = () => {
  editingParameterIndex.value = -1
  parameterForm.value = {
    parameter_name: '',
    display_name: '',
    parameter_type: 'text',
    description: '',
    default_value: '',
    is_required: false,
    ordering: form.value.parameters.length,
  }
  parameterDialog.value = true
}

const editParameter = (index) => {
  editingParameterIndex.value = index
  parameterForm.value = { ...form.value.parameters[index] }
  parameterDialog.value = true
}

const saveParameter = () => {
  if (editingParameterIndex.value >= 0) {
    form.value.parameters[editingParameterIndex.value] = { ...parameterForm.value }
  } else {
    form.value.parameters.push({ ...parameterForm.value })
  }
  parameterDialog.value = false
}

const removeParameter = (index) => {
  form.value.parameters.splice(index, 1)
}

const addPageAssignment = () => {
  editingAssignmentIndex.value = -1
  assignmentForm.value = {
    page_identifier: '',
    page_title: '',
    display_order: form.value.page_assignments.length,
    is_visible: true,
    auto_execute: false,
  }
  assignmentDialog.value = true
}

const editPageAssignment = (index) => {
  editingAssignmentIndex.value = index
  assignmentForm.value = { ...form.value.page_assignments[index] }
  assignmentDialog.value = true
}

const savePageAssignment = () => {
  if (editingAssignmentIndex.value >= 0) {
    form.value.page_assignments[editingAssignmentIndex.value] = { ...assignmentForm.value }
  } else {
    form.value.page_assignments.push({ ...assignmentForm.value })
  }
  assignmentDialog.value = false
}

const removePageAssignment = (index) => {
  form.value.page_assignments.splice(index, 1)
}

const viewDatabaseSchema = async () => {
  $q.notify({
    type: 'info',
    message: t('reports.schemaNotImplemented'),
  })
}

// Auto-fill page title when identifier changes
watch(
  () => assignmentForm.value.page_identifier,
  (newValue) => {
    const option = pageIdentifierOptions.value.find((opt) => opt.value === newValue)
    if (option && !assignmentForm.value.page_title) {
      assignmentForm.value.page_title = option.label
    }
  },
)

// Lifecycle
onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.code-editor :deep(.q-field__control textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.parameter-card,
.assignment-card {
  border-left: 4px solid var(--q-primary);
}

.parameter-card:hover,
.assignment-card:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.q-dark .parameter-card:hover,
.q-dark .assignment-card:hover {
  background-color: rgba(255, 255, 255, 0.02);
}
</style>
