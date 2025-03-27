<template>
  <q-layout view="hHh LpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleMiniState" />
        <q-toolbar-title class="cursor-pointer" @click="router.push('/')">
          {{
            companyStore.organization?.short_name ||
            companyStore.organization?.legal_name ||
            $t('layouts.mainLayout.hello')
          }}
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

    <!-- Drawer Menu -->
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

          <!-- Products Menu - Full Mode -->
          <template
            v-if="!miniState && authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.PRODUCTS)"
          >
            <q-expansion-item
              icon="shopping_bag"
              :label="$t('layouts.mainLayout.products')"
              expand-separator
            >
              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.VIEW.LIST])"
                clickable
                v-ripple
                :to="{ name: 'products' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="inventory_2" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.productsList') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.MANUFACTURERS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'manufacturers' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="factory" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.manufacturers') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.SUPPLIERS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'suppliers' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="local_shipping" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.suppliers') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.MODELS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'models' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="devices" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.models') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.PRODUCT_TYPES.LIST])"
                clickable
                v-ripple
                :to="{ name: 'product-types' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.productTypes') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Warehouses Menu - Full Mode -->
          <template
            v-if="!miniState && authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.WAREHOUSES)"
          >
            <q-expansion-item
              icon="warehouse"
              :label="$t('layouts.mainLayout.warehouses')"
              expand-separator
            >
              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.WAREHOUSES.VIEW.LIST])"
                clickable
                v-ripple
                :to="{ name: 'warehouses' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="store" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.warehousesList') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.WAREHOUSES.STOCK.LIST])"
                clickable
                v-ripple
                :to="{ name: 'stock' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="analytics" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.stock') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="
                  authStore.hasAnyPermission([MENU_PERMISSIONS.WAREHOUSES.STOCK_MOVEMENTS.LIST])
                "
                clickable
                v-ripple
                :to="{ name: 'stock-movements' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="sync_alt" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.stockMovements') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Клієнти Menu - Full Mode -->
          <template
            v-if="!miniState && authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.CLIENTS)"
          >
            <q-expansion-item
              icon="people"
              :label="$t('layouts.mainLayout.clients')"
              expand-separator
            >
              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.CLIENTS.VIEW.LIST])"
                clickable
                v-ripple
                :to="{ name: 'clients' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.clientsList') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Послуги Menu - Full Mode -->
          <template
            v-if="!miniState && authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.SERVICES)"
          >
            <q-expansion-item
              icon="miscellaneous_services"
              :label="$t('layouts.mainLayout.services')"
              expand-separator
            >
              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.VIEW.LIST])"
                clickable
                v-ripple
                :to="{ name: 'services' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="design_services" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.servicesList') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.TARIFFS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'tariffs' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="attach_money" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.tariffs') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.INVOICES.LIST])"
                clickable
                v-ripple
                :to="{ name: 'invoices' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="receipt" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.invoices') }}
                </q-item-section>
              </q-item>
              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.PAYMENTS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'payments' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="payments" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.payments') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Wialon Menu - Full Mode -->
          <template
            v-if="!miniState && authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.WIALON)"
          >
            <q-expansion-item
              icon="location_on"
              :label="$t('layouts.mainLayout.wialon')"
              expand-separator
            >
              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.WIALON.OBJECTS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'wialon-objects' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="directions_car" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.wialonObjects') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Settings Menu - Full Mode -->
          <template
            v-if="!miniState && authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.SETTINGS)"
          >
            <q-expansion-item
              icon="settings"
              :label="$t('layouts.mainLayout.settings')"
              expand-separator
            >
              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.COMPANY.READ])"
                clickable
                v-ripple
                :to="{ name: 'company-settings' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="business" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.companySettings') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.USERS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'users' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="group" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.users') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.ROLES.LIST])"
                clickable
                v-ripple
                :to="{ name: 'roles' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="shield" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.userGroups') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.PERMISSIONS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'permissions' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="verified_user" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.permissions') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.RESOURCES.LIST])"
                clickable
                v-ripple
                :to="{ name: 'resources' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="view_module" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.resources') }}
                </q-item-section>
              </q-item>

              <q-item
                v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.AUDIT_LOGS.LIST])"
                clickable
                v-ripple
                :to="{ name: 'audit-logs' }"
                dense
              >
                <q-item-section avatar>
                  <q-icon name="receipt_long" />
                </q-item-section>
                <q-item-section>
                  {{ $t('layouts.mainLayout.auditLogs') }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Mini Mode Menus -->
          <template v-else>
            <!-- Products Menu - Mini Mode -->
            <q-item v-if="authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.PRODUCTS)" dense>
              <q-item-section avatar>
                <q-icon name="shopping_bag">
                  <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                    <q-list style="min-width: 200px">
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.VIEW.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'products' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="inventory_2" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.productsList') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.MANUFACTURERS.LIST])
                        "
                        clickable
                        v-ripple
                        :to="{ name: 'manufacturers' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="factory" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.manufacturers') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.SUPPLIERS.LIST])
                        "
                        clickable
                        v-ripple
                        :to="{ name: 'suppliers' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="local_shipping" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.suppliers') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.MODELS.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'models' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="devices" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.models') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          authStore.hasAnyPermission([MENU_PERMISSIONS.PRODUCTS.PRODUCT_TYPES.LIST])
                        "
                        clickable
                        v-ripple
                        :to="{ name: 'product-types' }"
                      >
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

            <!-- Warehouses Menu - Mini Mode -->
            <q-item v-if="authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.WAREHOUSES)" dense>
              <q-item-section avatar>
                <q-icon name="warehouse">
                  <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                    <q-list style="min-width: 200px">
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.WAREHOUSES.VIEW.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'warehouses' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="store" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.warehousesList') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.WAREHOUSES.STOCK.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'stock' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="analytics" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.stock') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          authStore.hasAnyPermission([
                            MENU_PERMISSIONS.WAREHOUSES.STOCK_MOVEMENTS.LIST,
                          ])
                        "
                        clickable
                        v-ripple
                        :to="{ name: 'stock-movements' }"
                      >
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

            <!-- Клієнти Menu - Mini Mode -->
            <q-item v-if="authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.CLIENTS)" dense>
              <q-item-section avatar>
                <q-icon name="people">
                  <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                    <q-list style="min-width: 200px">
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.CLIENTS.VIEW.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'clients' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="person" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.clientsList') }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-icon>
              </q-item-section>
            </q-item>

            <!-- Послуги Menu - Mini Mode -->
            <q-item v-if="authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.SERVICES)" dense>
              <q-item-section avatar>
                <q-icon name="miscellaneous_services">
                  <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                    <q-list style="min-width: 200px">
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.VIEW.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'services' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="design_services" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.servicesList') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.TARIFFS.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'tariffs' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="attach_money" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.tariffs') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.INVOICES.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'invoices' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="receipt" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.invoices') }}
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SERVICES.PAYMENTS.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'payments' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="payments" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.payments') }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-icon>
              </q-item-section>
            </q-item>

            <!-- Wialon Menu - Mini Mode -->
            <q-item v-if="authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.WIALON)" dense>
              <q-item-section avatar>
                <q-icon name="location_on">
                  <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                    <q-list style="min-width: 200px">
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.WIALON.OBJECTS.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'wialon-objects' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="directions_car" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.wialonObjects') }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-icon>
              </q-item-section>
            </q-item>

            <!-- Settings Menu - Mini Mode -->
            <q-item v-if="authStore.hasAnyPermission(MENU_SECTIONS_PERMISSIONS.SETTINGS)" dense>
              <q-item-section avatar>
                <q-icon name="settings">
                  <q-menu anchor="top right" self="top left" :offset="[10, 0]" auto-close>
                    <q-list style="min-width: 200px">
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.COMPANY.READ])"
                        clickable
                        v-ripple
                        :to="{ name: 'company-settings' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="business" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.companySettings') }}
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.USERS.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'users' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="group" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.users') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.ROLES.LIST])"
                        clickable
                        v-ripple
                        :to="{ name: 'roles' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="shield" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.userGroups') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.PERMISSIONS.LIST])
                        "
                        clickable
                        v-ripple
                        :to="{ name: 'permissions' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="verified_user" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.permissions') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.RESOURCES.LIST])
                        "
                        clickable
                        v-ripple
                        :to="{ name: 'resources' }"
                      >
                        <q-item-section avatar>
                          <q-icon name="view_module" />
                        </q-item-section>
                        <q-item-section>
                          {{ $t('layouts.mainLayout.resources') }}
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          authStore.hasAnyPermission([MENU_PERMISSIONS.SETTINGS.AUDIT_LOGS.LIST])
                        "
                        clickable
                        v-ripple
                        :to="{ name: 'audit-logs' }"
                      >
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
import { MENU_PERMISSIONS, MENU_SECTIONS_PERMISSIONS } from 'src/constants/permissions'
import { useCompanyStore } from 'api/company'

const companyStore = useCompanyStore()

const scrolled = ref(false)
let tokenCheckInterval

const checkScroll = () => {
  scrolled.value = document.documentElement.scrollTop > 100
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// Оновлена функція onMounted
onMounted(() => {
  // Існуючий код onMounted для слухача події scroll
  window.addEventListener('scroll', checkScroll)

  // Нова функція для перевірки валідності токена

  const checkTokenValidity = () => {
    // Перевіряємо, що ми не на сторінці логування
    if (router.currentRoute.value.path === '/auth/login') return

    // Перевіряємо токен
    if (localStorage.getItem('token') && !authStore.isAuthenticated) {
      console.log('Токен став недійсним. Перенаправлення на сторінку логування.')
      authStore.logout()
      router.push('/auth/login')
    }
  }

  checkTokenValidity()

  tokenCheckInterval = setInterval(checkTokenValidity, 5 * 60 * 1000)
})

// Оновлена функція onUnmounted
onUnmounted(() => {
  // Існуючий код onUnmounted для слухача події scroll
  window.removeEventListener('scroll', checkScroll)

  // Нова частина - очищаємо інтервал перевірки токена

  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
  }
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
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style>
.drawer-menu .q-item {
  cursor: pointer;
}

/* Стилі для світлої теми */
.body--light .drawer-menu .q-item,
.body--light .drawer-menu .q-icon {
  color: #000000de !important; /* Material Design recommended black with opacity */
  transition: all 0.3s ease;
}

.body--light .drawer-menu .q-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.body--light .drawer-menu .q-item:hover .q-icon {
  transform: scale(1.1);
}

.body--light .drawer-menu .q-item.q-router-link-active {
  background: rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.body--light .drawer-menu .q-item.q-router-link-active .q-icon {
  transform: scale(1.1);
  color: var(--q-primary) !important;
}

/* Стилі для темної теми */
.body--dark .drawer-menu .q-item,
.body--dark .drawer-menu .q-icon {
  color: #ffffffde !important; /* Material Design recommended white with opacity */
  transition: all 0.3s ease;
}

.body--dark .drawer-menu .q-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.body--dark .drawer-menu .q-item:hover .q-icon {
  transform: scale(1.1);
}

.body--dark .drawer-menu .q-item.q-router-link-active {
  background: rgba(255, 255, 255, 0.15);
  font-weight: 500;
}

.body--dark .drawer-menu .q-item.q-router-link-active .q-icon {
  transform: scale(1.1);
  color: var(--q-primary) !important;
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
.drawer-menu .q-expansion-item > .q-expansion-item__container > .q-item > .q-item__section--main {
  font-weight: 600;
}

/* Стилі для вкладених елементів */
.q-expansion-item__content .q-item {
  padding-left: 48px;
  min-height: 40px;
  font-weight: normal;
}
/* Стилі для меню */
/* Стилі для лівого меню - колір як у футера */
.drawer-menu {
  background-color: var(--q-primary);
}

/* Стилі для світлої теми в лівому меню */
.body--light .drawer-menu .q-item,
.body--light .drawer-menu .q-icon {
  color: #ffffff !important; /* Білий текст для контрасту з кольоровим фоном */
  transition: all 0.3s ease;
}

.body--light .drawer-menu .q-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.body--light .drawer-menu .q-item.q-router-link-active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

/* Стилі для темної теми в лівому меню */
.body--dark .drawer-menu {
  background-color: var(--q-primary);
}

.body--dark .drawer-menu .q-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.body--dark .drawer-menu .q-item.q-router-link-active {
  background: rgba(255, 255, 255, 0.25);
  font-weight: 500;
}
</style>
