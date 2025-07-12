<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">{{ $t('company.title') }}</div>

    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        outside-arrows
        mobile-arrows
      >
        <q-tab name="details" :label="$t('company.tabs.details')" />
        <q-tab name="bankAccounts" :label="$t('company.tabs.bankAccounts')" />
        <q-tab name="documents" :label="$t('company.tabs.documents')" />

        <q-tab name="wialonIntegration" :label="$t('company.tabs.wialonIntegration')" />
        <q-tab name="settings" :label="$t('company.tabs.settings')" />
        <q-tab name="emailSettings" :label="$t('company.emailSettings.title')" />
        <q-tab name="emailTemplates" :label="$t('company.emailTemplates.title')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="details">
          <company-details-card />
        </q-tab-panel>

        <q-tab-panel name="bankAccounts">
          <bank-accounts-card />
        </q-tab-panel>

        <q-tab-panel name="documents">
          <legal-documents-card />
        </q-tab-panel>

        <q-tab-panel name="wialonIntegration">
          <wialon-integration-card />
        </q-tab-panel>
        <q-tab-panel name="settings">
          <settings-card />
        </q-tab-panel>
        <q-tab-panel name="emailSettings">
          <email-settings-card />
        </q-tab-panel>
        <q-tab-panel name="emailTemplates">
          <email-templates-card />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import CompanyDetailsCard from 'components/company/CompanyDetailsCard.vue'
import BankAccountsCard from 'components/company/BankAccountsCard.vue'
import LegalDocumentsCard from 'components/company/LegalDocumentsCard.vue'
import WialonIntegrationCard from 'components/company/WialonIntegrationCard.vue'
import EmailSettingsCard from 'components/company/EmailSettingsCard.vue'
import EmailTemplatesCard from 'components/company/EmailTemplatesCard.vue'
import SettingsCard from 'components/company/SettingsCard.vue'

// Стани
const tab = ref('details')
</script>
