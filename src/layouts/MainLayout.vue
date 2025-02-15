<template>
  <q-layout view="hHh LpR fFf">
    <!-- Header -->
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

    <!-- Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      :width="240"
      :breakpoint="500"
      class="drawer-menu"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- Dashboard -->
          <q-item clickable v-ripple :to="{ name: 'dashboard' }">
            <q-item-section avatar>
              <q-icon name="grid_view" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              {{ $t('layouts.mainLayout.dashboard') }}
            </q-item-section>
          </q-item>

          <!-- Products Menu -->
          <template v-if="!miniState">
            <q-expansion-item
              icon="shopping_bag"
              :label="$t('layouts.mainLayout.products')"
              expand-separator
            >
              <q-item clickable v-ripple :to="{ name: 'products' }" dense>
                <q-item-section avatar>
                  <q-icon name="inventory_2" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.productsList') }}
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'manufacturers' }" dense>
                <q-item-section avatar>
                  <q-icon name="factory" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.manufacturers') }}
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'suppliers' }" dense>
                <q-item-section avatar>
                  <q-icon name="local_shipping" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.suppliers') }}
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'models' }" dense>
                <q-item-section avatar>
                  <q-icon name="devices" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.models') }}
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'product-types' }" dense>
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.productTypes') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Warehouses Menu -->
          <template v-if="!miniState">
            <q-expansion-item
              icon="warehouse"
              :label="$t('layouts.mainLayout.warehouses')"
              expand-separator
            >
              <q-item clickable v-ripple :to="{ name: 'warehouses' }" dense>
                <q-item-section avatar>
                  <q-icon name="store" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.warehousesList') }}
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'stock' }" dense>
                <q-item-section avatar>
                  <q-icon name="analytics" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.stock') }}
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'stock-movements' }" dense>
                <q-item-section avatar>
                  <q-icon name="sync_alt" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.stockMovements') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Admin Menu -->
          <template v-if="authStore.hasRole('admin')">
            <!-- Full mode -->
            <template v-if="!miniState">
              <q-expansion-item
                icon="settings"
                :label="$t('layouts.mainLayout.settings')"
                expand-separator
              >
                <q-item clickable v-ripple :to="{ name: 'users' }" dense>
                  <q-item-section avatar>
                    <q-icon name="group" />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('layouts.mainLayout.users') }}
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'roles' }" dense>
                  <q-item-section avatar>
                    <q-icon name="shield" />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('layouts.mainLayout.userGroups') }}
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'permissions' }" dense>
                  <q-item-section avatar>
                    <q-icon name="verified_user" />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('layouts.mainLayout.permissions') }}
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'resources' }" dense>
                  <q-item-section avatar>
                    <q-icon name="view_module" />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('layouts.mainLayout.resources') }}
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'audit-logs' }" dense>
                  <q-item-section avatar>
                    <q-icon name="receipt_long" />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('layouts.mainLayout.auditLogs') }}
                  </q-item-section>
                </q-item>
              </q-expansion-item>
            </template>

            <!-- Mini mode -->
            <template v-else>
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="shopping_bag">
                    <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                      <q-list style="min-width: 200px">
                        <q-item clickable v-ripple :to="{ name: 'products' }">
                          <q-item-section avatar>
                            <q-icon name="inventory_2" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.productsList') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'manufacturers' }">
                          <q-item-section avatar>
                            <q-icon name="factory" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.manufacturers') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'suppliers' }">
                          <q-item-section avatar>
                            <q-icon name="local_shipping" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.suppliers') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'models' }">
                          <q-item-section avatar>
                            <q-icon name="devices" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.models') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'product-types' }">
                          <q-item-section avatar>
                            <q-icon name="category" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.productTypes') }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-item-section>
              </q-item>

              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="warehouse">
                    <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                      <q-list style="min-width: 200px">
                        <q-item clickable v-ripple :to="{ name: 'warehouses' }">
                          <q-item-section avatar>
                            <q-icon name="store" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.warehousesList') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'stock' }">
                          <q-item-section avatar>
                            <q-icon name="shopping_bag" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.stock') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'stock-movements' }">
                          <q-item-section avatar>
                            <q-icon name="sync_alt" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.stockMovements') }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-item-section>
              </q-item>

              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="settings">
                    <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                      <q-list style="min-width: 200px">
                        <q-item clickable v-ripple :to="{ name: 'users' }">
                          <q-item-section avatar>
                            <q-icon name="group" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.users') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'roles' }">
                          <q-item-section avatar>
                            <q-icon name="shield" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.userGroups') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'permissions' }">
                          <q-item-section avatar>
                            <q-icon name="verified_user" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.permissions') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'resources' }">
                          <q-item-section avatar>
                            <q-icon name="view_module" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.resources') }}
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple :to="{ name: 'audit-logs' }">
                          <q-item-section avatar>
                            <q-icon name="receipt_long" />
                          </q-item-section>
                          <q-item-section>
                            {{ $t('layouts.mainLayout.auditLogs') }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <!-- Scroll to top button -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-btn v-show="scrolled" round color="primary" icon="keyboard_arrow_up" @click="scrollToTop">
        <q-tooltip>{{ $t('common.scrollToTop') }}</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const scrolled = ref(false)

const checkScroll = () => {
  scrolled.value = document.documentElement.scrollTop > 100
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})

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
  cursor: pointer;
}

/* Світла тема - основний стиль */
.body--light .drawer-menu .q-icon {
  color: transparent !important;
  background: linear-gradient(120deg, #6b48ff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

/* Світла тема - при наведенні */
.body--light .drawer-menu .q-item:hover .q-icon {
  background: linear-gradient(120deg, #0080ff 0%, #6b48ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  transform: scale(1.1);
}

/* Світла тема - активний елемент */
.body--light .drawer-menu .q-item.q-router-link-active .q-icon {
  background: linear-gradient(120deg, #5f3fff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  transform: scale(1.1);
}

/* Темна тема - основний стиль */
.body--dark .drawer-menu .q-icon {
  color: transparent !important;
  background: linear-gradient(120deg, #bb86fc 0%, #3700b3 100%);
  -webkit-background-clip: text;
  background-clip: text;
  filter: drop-shadow(0px 0px 2px rgba(187, 134, 252, 0.3));
  transition: all 0.3s ease;
}

/* Темна тема - при наведенні */
.body--dark .drawer-menu .q-item:hover .q-icon {
  background: linear-gradient(120deg, #3700b3 0%, #bb86fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  transform: scale(1.1);
}

/* Темна тема - активний елемент */
.body--dark .drawer-menu .q-item.q-router-link-active .q-icon {
  background: linear-gradient(120deg, #cf6679 0%, #03dac6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  transform: scale(1.1);
}

/* Загальні стилі для активних елементів меню */
.drawer-menu .q-item.q-router-link-active {
  background: rgba(var(--q-primary), 0.1);
}

/* Стилі для вкладених елементів */
.q-expansion-item__content .q-item {
  padding-left: 48px;
  min-height: 40px;
}

/* Стилі для меню */
.body--dark .q-menu {
  background: #1d1d1d;
}

.body--light .q-menu {
  background: white;
}

/* Стилі для аватара */
.q-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Анімація для кнопки прокрутки */
.q-page-sticky .q-btn {
  transition: all 0.3s ease-in-out;
}

[v-show='false'].q-page-sticky .q-btn {
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
}
</style>
