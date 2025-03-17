import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { title: 'Cooprins CRM' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { title: 'Profile' },
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('pages/UsersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/roles',
        name: 'roles',
        component: () => import('pages/RolesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/permissions',
        name: 'permissions',
        component: () => import('pages/PermissionPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/resources',
        name: 'resources',
        component: () => import('pages/ResourcesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/audit-logs',
        name: 'audit-logs',
        component: () => import('pages/AuditLogsPage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'products',
        name: 'products',
        component: () => import('pages/ProductsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'products/:id',
        name: 'product-details',
        component: () => import('pages/ProductDetailsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'manufacturers',
        name: 'manufacturers',
        component: () => import('pages/ManufacturersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'suppliers',
        name: 'suppliers',
        component: () => import('pages/SuppliersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'models',
        name: 'models',
        component: () => import('pages/ModelsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'warehouses',
        name: 'warehouses',
        component: () => import('pages/WarehousesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'stock',
        name: 'stock',
        component: () => import('pages/StockPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'stock/movements',
        name: 'stock-movements',
        component: () => import('pages/StockMovementsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/product-types',
        name: 'product-types',
        component: () => import('pages/ProductTypesPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'products.read',
        },
      },
      {
        path: '/product-types/create',
        name: 'product-type-create',
        component: () => import('pages/ProductTypeEditPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'products.create',
        },
      },
      {
        path: '/product-types/:id',
        name: 'product-type-edit',
        component: () => import('pages/ProductTypeEditPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'products.update',
        },
      },
      // Нові маршрути для клієнтів
      {
        path: '/clients',
        name: 'clients',
        component: () => import('pages/ClientsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'clients.read',
        },
      },
      {
        path: '/clients/:id',
        name: 'client-details',
        component: () => import('pages/ClientDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'clients.read',
        },
      },
      //{
      //  path: '/client-documents',
      //  name: 'client-documents',
      //  component: () => import('pages/ClientDocumentsPage.vue'),
      //  meta: {
      //    requiresAuth: true,
      //    permission: 'client_documents.read',
      //  },
      //},

      // Маршрути для платежів
      {
        path: '',
        name: 'payments',
        component: () => import('pages/PaymentsPage.vue'),
        meta: {
          requiresAuth: true,
          requiredPermissions: ['payments.read'],
        },
      },
      {
        path: ':id',
        name: 'payment-details',
        component: () => import('pages/PaymentDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          requiredPermissions: ['payments.read'],
        },
      },

      // Нові маршрути для послуг
      {
        path: '/services',
        name: 'services',
        component: () => import('pages/ServicesPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'services.read',
        },
      },
      {
        path: '/services/:id',
        name: 'service-details',
        component: () => import('pages/ServiceDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'services.read',
        },
      },

      // Нові маршрути для тарифів
      {
        path: '/tariffs',
        name: 'tariffs',
        component: () => import('pages/TariffsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'tariffs.read',
        },
      },
      {
        path: '/tariffs/:id',
        name: 'tariff-details',
        component: () => import('pages/TariffDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'tariffs.read',
        },
      },

      // Нові маршрути для рахунків
      {
        path: '/invoices',
        name: 'invoices',
        component: () => import('pages/InvoicesPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'invoices.read',
        },
      },
      {
        path: '/invoices/:id',
        name: 'invoice-details',
        component: () => import('pages/InvoiceDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'invoices.read',
        },
      },

      // Нові маршрути для об'єктів Wialon
      {
        path: '/wialon-objects',
        name: 'wialon-objects',
        component: () => import('pages/WialonObjectsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'wialon_objects.read',
        },
      },
      {
        path: '/wialon-objects/:id',
        name: 'wialon-object-details',
        component: () => import('pages/WialonObjectDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'wialon_objects.read',
        },
      },
      {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
      },
    ],
  },

  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { title: 'Cooprins Login' },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
      },
    ],
  },
]

export default route(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(),
  })

  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // Перевіряємо чи маршрут існує
    if (to.matched.length === 0) {
      console.log('Route not found, redirecting to 404')
      next('/404')
      return
    }

    // Перевіряємо метадані маршруту для автентифікації
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    console.log('Route check:', {
      path: to.path,
      requiresAuth,
      token: !!authStore.token,
      user: !!authStore.user,
      isAuthenticated: authStore.isAuthenticated,
    })

    if (requiresAuth && !authStore.isAuthenticated) {
      next('/auth/login')
    } else if (to.path === '/auth/login' && authStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
  })

  return Router
})
