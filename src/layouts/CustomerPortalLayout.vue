<template>
  <q-layout view="hHh LpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title class="cursor-pointer" @click="router.push('/portal/dashboard')">
          {{ $t('portal.title') }}
        </q-toolbar-title>

        <q-btn flat>
          <q-icon name="language" />
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="changeLanguage('uk')">
                <q-item-section>Українська</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLanguage('en')">
                <q-item-section>English</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat @click="toggleDarkMode">
          <q-icon :name="$q.dark.isActive ? 'dark_mode' : 'light_mode'" />
        </q-btn>

        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ authStore.user?.name }}
                  </q-item-label>
                  <q-item-label caption>{{ authStore.user?.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup to="/portal/profile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>{{ $t('portal.profile') }}</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>{{ $t('portal.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Drawer Menu -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
      :breakpoint="500"
      class="portal-drawer"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- Dashboard -->
          <q-item clickable v-ripple :to="{ name: 'portal-dashboard' }">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              {{ $t('portal.dashboard') }}
            </q-item-section>
          </q-item>

          <!-- My Objects -->
          <q-item clickable v-ripple :to="{ name: 'portal-objects' }">
            <q-item-section avatar>
              <q-icon name="directions_car" />
            </q-item-section>
            <q-item-section>
              {{ $t('portal.myObjects') }}
            </q-item-section>
          </q-item>

          <!-- My Invoices -->
          <q-item clickable v-ripple :to="{ name: 'portal-invoices' }">
            <q-item-section avatar>
              <q-icon name="receipt" />
            </q-item-section>
            <q-item-section>
              {{ $t('portal.myInvoices') }}
            </q-item-section>
          </q-item>

          <!-- My Documents -->
          <q-item clickable v-ripple :to="{ name: 'portal-documents' }">
            <q-item-section avatar>
              <q-icon name="folder" />
            </q-item-section>
            <q-item-section>
              {{ $t('portal.myDocuments') }}
            </q-item-section>
          </q-item>

          <!-- My Tickets -->
          <q-item clickable v-ripple :to="{ name: 'portal-tickets' }">
            <q-item-section avatar>
              <q-icon name="support_agent" />
            </q-item-section>
            <q-item-section>
              {{ $t('portal.myTickets') }}
            </q-item-section>
          </q-item>

          <!-- Chat -->
          <q-item clickable v-ripple :to="{ name: 'portal-chat' }">
            <q-item-section avatar>
              <q-icon name="chat" />
            </q-item-section>
            <q-item-section>
              {{ $t('portal.chat') }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const { locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const leftDrawerOpen = ref(true)

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const toggleDarkMode = () => {
  $q.dark.toggle()
  localStorage.setItem('darkMode', $q.dark.isActive.toString())
}

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('userLanguage', lang)
}

const logout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.portal-drawer {
  background-color: var(--q-primary);
}

.portal-drawer .q-item,
.portal-drawer .q-icon {
  color: #ffffff !important;
  transition: all 0.3s ease;
}

.portal-drawer .q-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.portal-drawer .q-item.q-router-link-active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}
</style>
