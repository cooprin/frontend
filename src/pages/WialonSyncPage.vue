<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">{{ $t('wialonSync.title') }}</div>
    <p class="text-grey-7 q-mb-lg">{{ $t('wialonSync.description') }}</p>

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
        <q-tab name="sessions" :label="$t('wialonSync.tabs.sessions')" />
        <q-tab name="discrepancies" :label="$t('wialonSync.tabs.discrepancies')" />
        <q-tab name="rules" :label="$t('wialonSync.tabs.rules')" />
        <q-tab name="logs" :label="$t('wialonSync.tabs.logs')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="sessions">
          <wialon-sync-sessions />
        </q-tab-panel>

        <q-tab-panel name="discrepancies">
          <wialon-sync-discrepancies />
        </q-tab-panel>

        <q-tab-panel name="rules">
          <wialon-sync-rules />
        </q-tab-panel>

        <q-tab-panel name="logs">
          <wialon-sync-logs />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import WialonSyncSessions from 'components/wialon-sync/WialonSyncSessions.vue'
import WialonSyncDiscrepancies from 'components/wialon-sync/WialonSyncDiscrepancies.vue'
import WialonSyncRules from 'components/wialon-sync/WialonSyncRules.vue'
import WialonSyncLogs from 'components/wialon-sync/WialonSyncLogs.vue'

// Стани
const tab = ref('sessions')
</script>
