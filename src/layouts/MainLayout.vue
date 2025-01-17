<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          {{ $t('layouts.mainLayout.hello') }}
        </q-toolbar-title>

        <!-- Language switcher -->
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

        <!-- Theme switcher -->
        <q-btn flat @click="toggleDarkMode">
          <q-icon :name="$q.dark.isActive ? 'dark_mode' : 'light_mode'" />
        </q-btn>
        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 200px">
              <!-- Аватар і основна інформація -->
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img
                      :src="authStore.user?.avatar_url || 'https://cdn.quasar.dev/img/avatar.png'"
                      alt="Avatar"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{
                      `${authStore.user?.first_name || ''} ${authStore.user?.last_name || ''}`.trim()
                    }}
                  </q-item-label>
                  <q-item-label caption>{{ authStore.user?.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Додаткові опції -->
              <q-item clickable v-close-popup to="/profile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.profile') }}</q-item-section>
              </q-item>

              <q-item clickable v-close-popup to="/settings">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.settings') }}</q-item-section>
              </q-item>

              <q-separator />

              <!-- Кнопка виходу -->
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.exit') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <!-- Тут буде меню навігації -->
      <q-list>
        <q-item clickable v-ripple :to="{ name: 'dashboard' }">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section> Головна </q-item-section>
        </q-item>
        <!-- Додайте інші пункти меню -->
      </q-list>
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
const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
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
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
