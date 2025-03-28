<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h6">{{ $t('company.bankAccounts.title') }}</div>
      <q-btn
        color="primary"
        :label="$t('company.bankAccounts.addNew')"
        icon="add"
        @click="openAddDialog()"
      />
    </div>

    <q-table
      :rows="bankAccounts"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
      no-data-label="Немає банківських рахунків"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="col.name === 'is_default'">
              <q-chip v-if="col.value" color="primary" text-color="white" dense>
                {{ $t('company.bankAccounts.defaultAccount') }}
              </q-chip>
            </div>
            <div v-else-if="col.name === 'is_active'">
              <q-badge
                :color="col.value ? 'positive' : 'grey'"
                :label="col.value ? $t('common.active') : $t('common.inactive')"
              />
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
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
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

    <!-- Діалогове вікно для додавання/редагування банківського рахунку -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{
              editMode
                ? $t('company.bankAccounts.editAccount')
                : $t('company.bankAccounts.addAccount')
            }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md q-px-md">
          <q-form @submit="saveAccount" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- Назва банку -->
              <div class="col-12">
                <q-input
                  v-model="form.bank_name"
                  :label="$t('company.bankAccounts.bankName')"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <!-- Номер рахунку -->
              <div class="col-12">
                <q-input
                  v-model="form.account_number"
                  :label="$t('company.bankAccounts.accountNumber')"
                  :rules="[(val) => !!val || $t('common.validation.required')]"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <!-- IBAN і МФО -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.iban"
                  :label="$t('company.bankAccounts.iban')"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.mfo"
                  :label="$t('company.bankAccounts.mfo')"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <!-- SWIFT і Валюта -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.swift_code"
                  :label="$t('company.bankAccounts.swift')"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.currency"
                  :options="currencies"
                  :label="$t('company.bankAccounts.currency')"
                  outlined
                  dense
                  class="q-mb-md"
                />
              </div>

              <!-- Опис -->
              <div class="col-12">
                <q-input
                  v-model="form.description"
                  :label="$t('company.bankAccounts.description')"
                  type="textarea"
                  outlined
                  dense
                  autogrow
                  class="q-mb-md"
                />
              </div>

              <!-- Активний та основний рахунок -->
              <div class="col-12">
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-6">
                    <q-checkbox
                      v-model="form.is_active"
                      :label="$t('company.bankAccounts.isActive')"
                    />
                  </div>
                  <div class="col-6">
                    <q-checkbox
                      v-model="form.is_default"
                      :label="$t('company.bankAccounts.isDefault')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            :label="$t('common.save')"
            color="primary"
            @click="saveAccount"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Діалог підтвердження видалення -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('company.bankAccounts.confirmDelete') }}</div>
        </q-card-section>

        <q-card-section>
          {{ $t('company.bankAccounts.deleteWarning') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            :label="$t('common.delete')"
            color="negative"
            @click="deleteAccount"
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
import { CompanyApi } from 'src/api/company'

const $q = useQuasar()
const { t } = useI18n()

// Стани
const bankAccounts = ref([])
const loading = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentAccountId = ref(null)

// Форма для додавання/редагування
const form = ref({
  bank_name: '',
  account_number: '',
  iban: '',
  mfo: '',
  swift_code: '',
  currency: 'UAH',
  description: '',
  is_active: true,
  is_default: false,
})

// Колонки для таблиці
const columns = [
  {
    name: 'bank_name',
    label: t('company.bankAccounts.bankName'),
    field: 'bank_name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'account_number',
    label: t('company.bankAccounts.accountNumber'),
    field: 'account_number',
    sortable: true,
    align: 'left',
  },
  {
    name: 'iban',
    label: t('company.bankAccounts.iban'),
    field: 'iban',
    sortable: true,
    align: 'left',
  },
  {
    name: 'mfo',
    label: t('company.bankAccounts.mfo'),
    field: 'mfo',
    sortable: true,
    align: 'left',
  },
  {
    name: 'currency',
    label: t('company.bankAccounts.currency'),
    field: 'currency',
    sortable: true,
    align: 'left',
  },
  {
    name: 'is_default',
    label: t('company.bankAccounts.default'),
    field: 'is_default',
    sortable: true,
    align: 'center',
  },
  {
    name: 'is_active',
    label: t('common.status'),
    field: 'is_active',
    sortable: true,
    align: 'center',
  },
]

// Варіанти валют
const currencies = ['UAH', 'USD', 'EUR', 'PLN']

// Методи
const loadBankAccounts = async () => {
  loading.value = true
  try {
    const response = await CompanyApi.getBankAccounts()
    bankAccounts.value = response.data.accounts || []
  } catch (error) {
    console.error('Error loading bank accounts:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.loading'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  // Скидаємо форму до значень за замовчуванням
  form.value = {
    bank_name: '',
    account_number: '',
    iban: '',
    mfo: '',
    swift_code: '',
    currency: 'UAH',
    description: '',
    is_active: true,
    is_default: false,
  }

  editMode.value = false
  showDialog.value = true
}

const openEditDialog = (account) => {
  // Заповнюємо форму даними рахунку
  form.value = { ...account }

  currentAccountId.value = account.id
  editMode.value = true
  showDialog.value = true
}

const saveAccount = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await CompanyApi.updateBankAccount(currentAccountId.value, form.value)
      $q.notify({
        color: 'positive',
        message: t('company.bankAccounts.updateSuccess'),
        icon: 'check',
      })
    } else {
      await CompanyApi.createBankAccount(form.value)
      $q.notify({
        color: 'positive',
        message: t('company.bankAccounts.createSuccess'),
        icon: 'check',
      })
    }

    // Закриваємо діалог і оновлюємо список
    showDialog.value = false
    await loadBankAccounts()
  } catch (error) {
    console.error('Error saving bank account:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || t('common.errors.saving'),
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (account) => {
  currentAccountId.value = account.id
  showDeleteDialog.value = true
}

const deleteAccount = async () => {
  deleting.value = true
  try {
    await CompanyApi.deleteBankAccount(currentAccountId.value)
    $q.notify({
      color: 'positive',
      message: t('company.bankAccounts.deleteSuccess'),
      icon: 'check',
    })

    // Закриваємо діалог і оновлюємо список
    showDeleteDialog.value = false
    await loadBankAccounts()
  } catch (error) {
    console.error('Error deleting bank account:', error)
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
  loadBankAccounts()
})
</script>
