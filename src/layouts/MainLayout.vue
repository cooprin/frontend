<template>
  <q-layout view="hHh LpR fFf">
    <!-- Header залишається без змін -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleMiniState" />
        <q-toolbar-title>
          {{ $t('layouts.mainLayout.hello') }}
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

              <q-item clickable v-close-popup to="/profile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.profile') }}</q-item-section>
              </q-item>

              <q-separator />

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
      <q-list padding class="menu-list">
        <!-- Dashboard item -->
        <q-item clickable v-ripple :to="{ name: 'dashboard' }">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section v-if="!miniState">
            {{ $t('layouts.mainLayout.dashboard') }}
          </q-item-section>
        </q-item>

        <!-- Settings menu - різна поведінка для mini та повного режиму -->
        <template v-if="authStore.hasRole('admin')">
          <!-- Повний режим з q-expansion-item -->
          <q-expansion-item v-if="!miniState" :content-inset-level="0.5" popup>
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                {{ $t('layouts.mainLayout.settings') }}
              </q-item-section>
            </template>

            <q-list class="submenu-items">
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

              <q-item clickable v-ripple :to="{ name: 'permissions' }" exact>
                <q-item-section avatar>
                  <q-icon name="security" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.permissions') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'resources' }" exact>
                <q-item-section avatar>
                  <q-icon name="extension" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.resources') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'audit-logs' }">
                <q-item-section avatar>
                  <q-icon name="history" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.auditLogs') }}</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- Mini режим з hover ефектом -->
          <div
            v-else
            class="settings-menu"
            @mouseenter="showSubmenu = true"
            @mouseleave="showSubmenu = false"
          >
            <q-item class="settings-header">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
            </q-item>

            <q-menu
              v-if="miniState"
              :value="showSubmenu"
              anchor="top right"
              self="top left"
              class="submenu-popup"
            >
              <q-list class="submenu-items">
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

                <q-item clickable v-ripple :to="{ name: 'permissions' }" exact>
                  <q-item-section avatar>
                    <q-icon name="security" />
                  </q-item-section>
                  <q-item-section>{{ $t('layouts.mainLayout.permissions') }}</q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'resources' }" exact>
                  <q-item-section avatar>
                    <q-icon name="extension" />
                  </q-item-section>
                  <q-item-section>{{ $t('layouts.mainLayout.resources') }}</q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'audit-logs' }">
                  <q-item-section avatar>
                    <q-icon name="history" />
                  </q-item-section>
                  <q-item-section>{{ $t('layouts.mainLayout.auditLogs') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
        </template>
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
const showSubmenu = ref(false)

const getAvatarUrl = computed(() => {
  if (!authStore.user?.avatar_url) {
    return 'https://cdn.quasar.dev/img/avatar.png'
  }

  try {
    const avatarPath = authStore.user.avatar_url
    return `${process.env.API_URL}/uploads/${avatarPath}`
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
  showSubmenu.value = false
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
.drawer-menu .q-item {
  color: var(--q-primary) !important;
  cursor: pointer;
}

.drawer-menu .q-icon {
  color: var(--q-primary) !important;
}

.drawer-menu .q-item.q-router-link-active {
  background: rgba(var(--q-primary), 0.1);
}

.menu-list .settings-menu {
  position: relative;
}

.menu-list .submenu-items {
  min-width: 200px;
}

.menu-list .submenu-items .q-item {
  min-height: 40px;
}

.q-expansion-item__content {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .q-expansion-item__content {
  background: rgba(255, 255, 255, 0.03);
}

.submenu-popup {
  min-width: 200px;
}

.body--dark .drawer-menu .q-item,
.body--dark .drawer-menu .q-icon,
.body--dark .q-menu {
  color: #fff !important;
  background: #424242;
}

.body--light .drawer-menu .q-item,
.body--light .drawer-menu .q-icon {
  color: rgba(0, 0, 0, 0.87) !important;
}

.body--light .q-menu {
  background: white;
}

.q-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
