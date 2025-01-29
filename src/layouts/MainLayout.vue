<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleMiniState" />
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

        <!-- User menu -->
        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 200px">
              <!-- Avatar and main info -->
              <q-item>
                <q-item-section avatar>
                  <q-avatar size="40px">
                    <img :src="getAvatarUrl" alt="Avatar" @error="handleImageError" />
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

              <!-- Profile -->
              <q-item clickable v-close-popup to="/profile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.profile') }}</q-item-section>
              </q-item>

              <q-separator />

              <!-- Logout -->
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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      :width="240"
      :breakpoint="500"
      class="drawer-menu"
    >
      <q-list padding>
        <q-item clickable v-ripple :to="{ name: 'dashboard' }">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>{{ $t('layouts.mainLayout.dashboard') }}</q-item-section>
        </q-item>

        <q-expansion-item
          icon="settings"
          :label="$t('layouts.mainLayout.settings')"
          :header-class="miniState ? 'text-center' : ''"
          expand-icon="keyboard_arrow_down"
        >
          <q-list class="q-pl-lg">
            <q-item clickable v-ripple :to="{ name: 'users' }" exact>
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>
              <q-item-section>{{ $t('layouts.mainLayout.users') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'roles' }" exact>
              <q-item-section avatar>
                <q-icon name="manage_accounts" />
              </q-item-section>
              <q-item-section>{{ $t('layouts.mainLayout.userGroups') }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const { locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const leftDrawerOpen = ref(true)
const miniState = ref(false)

const getAvatarUrl = computed(() => {
  if (!authStore.user?.avatar_url) {
    return 'https://cdn.quasar.dev/img/avatar.png'
  }

  try {
    const avatarPath = authStore.user.avatar_url
    return `${process.env.API_URL}/${avatarPath}`
  } catch {
    return 'https://cdn.quasar.dev/img/avatar.png'
  }
})

const handleImageError = (e) => {
  const originalSrc = e.target.src
  console.error('Image load error. Original src:', originalSrc)

  if (!originalSrc.includes('cdn.quasar.dev')) {
    e.target.src = 'https://cdn.quasar.dev/img/avatar.png'
    console.warn('Failed to load avatar, using fallback image')
  }
}

const toggleMiniState = () => {
  miniState.value = !miniState.value
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

<style>
/* Загальні стилі для меню */
.drawer-menu .q-item {
  color: var(--q-primary) !important;
}

.drawer-menu .q-icon {
  color: var(--q-primary) !important;
}

.drawer-menu .q-expansion-item__content .q-item {
  color: var(--q-primary) !important;
}

/* Активний пункт меню */
.drawer-menu .q-item.q-router-link-active {
  background: rgba(var(--q-primary), 0.1);
}

.q-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Темна тема */
.body--dark .drawer-menu .q-item,
.body--dark .drawer-menu .q-icon,
.body--dark .drawer-menu .q-expansion-item__content .q-item {
  color: #fff !important;
}

/* Світла тема */
.body--light .drawer-menu .q-item,
.body--light .drawer-menu .q-icon,
.body--light .drawer-menu .q-expansion-item__content .q-item {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
