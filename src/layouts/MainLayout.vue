<template>
  <!-- Layout structure remains same -->
  <q-layout view="hHh LpR fFf">
    <!-- Header remains same -->
    <q-header elevated class="bg-primary text-white">
      <!-- Previous header content... -->
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
        <q-item clickable v-ripple :to="{ name: 'dashboard' }" class="menu-item">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section v-if="!miniState">
            {{ $t('layouts.mainLayout.dashboard') }}
          </q-item-section>
        </q-item>

        <!-- Settings menu -->
        <template v-if="authStore.hasRole('admin')">
          <!-- Expanded state -->
          <q-expansion-item
            v-if="!miniState"
            icon="settings"
            :label="$t('layouts.mainLayout.settings')"
            class="menu-item settings-expansion"
            expand-separator
            dense
          >
            <q-list class="submenu-list">
              <q-item clickable v-ripple :to="{ name: 'users' }" exact dense>
                <q-item-section avatar>
                  <q-icon name="people" size="sm" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.users') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'roles' }" exact dense>
                <q-item-section avatar>
                  <q-icon name="manage_accounts" size="sm" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.userGroups') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'permissions' }" exact dense>
                <q-item-section avatar>
                  <q-icon name="security" size="sm" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.permissions') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'resources' }" exact dense>
                <q-item-section avatar>
                  <q-icon name="extension" size="sm" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.resources') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'audit-logs' }" dense>
                <q-item-section avatar>
                  <q-icon name="history" size="sm" />
                </q-item-section>
                <q-item-section>{{ $t('layouts.mainLayout.auditLogs') }}</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- Mini state -->
          <div
            v-else
            class="settings-menu"
            @mouseenter="showSubmenu = true"
            @mouseleave="showSubmenu = false"
          >
            <q-item class="menu-item">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
            </q-item>

            <q-menu
              v-model="showSubmenu"
              anchor="top right"
              self="top left"
              class="submenu-popup"
              transition-show="jump-right"
              transition-hide="jump-left"
            >
              <q-list class="submenu-list">
                <q-item clickable v-ripple :to="{ name: 'users' }" exact dense>
                  <q-item-section avatar>
                    <q-icon name="people" size="sm" />
                  </q-item-section>
                  <q-item-section>{{ $t('layouts.mainLayout.users') }}</q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'roles' }" exact dense>
                  <q-item-section avatar>
                    <q-icon name="manage_accounts" size="sm" />
                  </q-item-section>
                  <q-item-section>{{ $t('layouts.mainLayout.userGroups') }}</q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'permissions' }" exact dense>
                  <q-item-section avatar>
                    <q-icon name="security" size="sm" />
                  </q-item-section>
                  <q-item-section>{{ $t('layouts.mainLayout.permissions') }}</q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'resources' }" exact dense>
                  <q-item-section avatar>
                    <q-icon name="extension" size="sm" />
                  </q-item-section>
                  <q-item-section>{{ $t('layouts.mainLayout.resources') }}</q-item-section>
                </q-item>

                <q-item clickable v-ripple :to="{ name: 'audit-logs' }" dense>
                  <q-item-section avatar>
                    <q-icon name="history" size="sm" />
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
// Script section remains the same...
</script>

<style>
.drawer-menu {
  background: #f5f5f5;
}

.body--dark .drawer-menu {
  background: #1a1a1a;
}

.menu-list {
  padding: 8px;
}

.menu-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s;
}

.menu-item:hover {
  background: rgba(var(--q-primary), 0.1);
}

.settings-expansion.q-expansion-item--expanded {
  background: rgba(var(--q-primary), 0.05);
  border-radius: 8px;
}

.settings-expansion .q-expansion-item__content {
  padding: 0;
  background: transparent;
}

.submenu-list {
  padding: 4px 8px;
}

.submenu-list .q-item {
  border-radius: 8px;
  padding: 8px 8px;
  min-height: 36px;
  font-size: 0.95em;
}

.submenu-list .q-item:hover {
  background: rgba(var(--q-primary), 0.1);
}

.submenu-list .q-icon {
  font-size: 1.2em;
}

.drawer-menu .q-item.q-router-link-active {
  background: rgba(var(--q-primary), 0.15);
  font-weight: 500;
}

.submenu-popup {
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.body--dark .submenu-popup {
  background: #1a1a1a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.body--dark .drawer-menu {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .drawer-menu .q-item,
.body--dark .drawer-menu .q-icon {
  color: rgba(255, 255, 255, 0.8) !important;
}

.body--light .drawer-menu .q-item,
.body--light .drawer-menu .q-icon {
  color: rgba(0, 0, 0, 0.8) !important;
}

.q-expansion-item__content {
  margin: 4px 0;
}
</style>
