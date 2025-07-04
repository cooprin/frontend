import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const routes = [
  // Admin routes (staff only)
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresStaff: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { title: 'Cooprins CRM' },
      },
      {
        path: 'profile',
        name: 'admin-profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { title: 'Profile' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('pages/UsersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('pages/RolesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'permissions',
        name: 'permissions',
        component: () => import('pages/PermissionPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'resources',
        name: 'resources',
        component: () => import('pages/ResourcesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'audit-logs',
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
        path: 'product-types',
        name: 'product-types',
        component: () => import('pages/ProductTypesPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'products.read',
        },
      },
      {
        path: 'product-types/create',
        name: 'product-type-create',
        component: () => import('pages/ProductTypeEditPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'products.create',
        },
      },
      {
        path: 'product-types/:id',
        name: 'product-type-edit',
        component: () => import('pages/ProductTypeEditPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'products.update',
        },
      },
      {
        path: 'clients',
        name: 'clients',
        component: () => import('pages/ClientsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'clients.read',
        },
      },
      {
        path: 'clients/:id',
        name: 'client-details',
        component: () => import('pages/ClientDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'clients.read',
        },
      },
      {
        path: 'payments',
        name: 'payments',
        component: () => import('pages/PaymentsPage.vue'),
        meta: {
          requiresAuth: true,
          requiredPermissions: ['payments.read'],
        },
      },
      {
        path: 'payments/:id',
        name: 'payment-details',
        component: () => import('pages/PaymentDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          requiredPermissions: ['payments.read'],
        },
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('pages/ServicesPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'services.read',
        },
      },
      {
        path: 'services/:id',
        name: 'service-details',
        component: () => import('pages/ServiceDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'services.read',
        },
      },
      {
        path: 'tariffs',
        name: 'tariffs',
        component: () => import('pages/TariffsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'tariffs.read',
        },
      },
      {
        path: 'tariffs/:id',
        name: 'tariff-details',
        component: () => import('pages/TariffDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'tariffs.read',
        },
      },
      {
        path: 'invoices',
        name: 'invoices',
        component: () => import('pages/InvoicesPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'invoices.read',
        },
      },
      {
        path: 'invoices/:id',
        name: 'invoice-details',
        component: () => import('pages/InvoiceDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'invoices.read',
        },
      },
      {
        path: 'wialon-objects',
        name: 'wialon-objects',
        component: () => import('pages/WialonObjectsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'wialon_objects.read',
        },
      },
      {
        path: 'wialon-objects/:id',
        name: 'wialon-object-details',
        component: () => import('pages/WialonObjectDetailsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'wialon_objects.read',
        },
      },
      {
        path: 'wialon-sync',
        name: 'wialon-sync',
        component: () => import('pages/WialonSyncPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'wialon_sync.read',
        },
      },
      {
        path: 'tickets',
        name: 'tickets',
        component: () => import('pages/TicketsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'tickets.read',
        },
      },
      {
        path: 'chat',
        name: 'chat',
        component: () => import('pages/ChatManagement.vue'),
        meta: {
          requiresAuth: true,
          permission: 'chat.read',
        },
      },
      {
        path: 'chat/:roomId',
        name: 'chat-room',
        component: () => import('pages/ChatRoomPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'chat.read',
        },
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
        meta: { requiresAuth: true, userType: 'staff' },
      },
      {
        path: 'settings/company',
        name: 'company-settings',
        component: () => import('pages/CompanySettingsPage.vue'),
        meta: {
          requiresAuth: true,
          permissions: ['company_profile.read'],
        },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('pages/ReportsPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'reports.read',
        },
      },
      {
        path: 'reports/create',
        name: 'report-create',
        component: () => import('pages/ReportEditPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'reports.create',
        },
      },
      {
        path: 'reports/:id',
        name: 'report-edit',
        component: () => import('pages/ReportEditPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'reports.update',
        },
      },
      {
        path: 'reports/:id/history',
        name: 'report-history',
        component: () => import('pages/ReportHistoryPage.vue'),
        meta: {
          requiresAuth: true,
          permission: 'reports.read',
        },
      },
    ],
  },

  // Customer Portal routes (clients only)
  {
    path: '/portal',
    component: () => import('layouts/CustomerPortalLayout.vue'),
    meta: { requiresAuth: true, requiresClient: true },
    children: [
      {
        path: '',
        redirect: '/portal/dashboard',
      },
      {
        path: 'dashboard',
        name: 'portal-dashboard',
        component: () => import('pages/portal/DashboardPage.vue'),
        meta: { title: 'Customer Portal' },
      },
      {
        path: 'profile',
        name: 'portal-profile',
        component: () => import('pages/portal/ProfilePage.vue'),
        meta: { title: 'My Profile' },
      },
      {
        path: 'objects',
        name: 'portal-objects',
        component: () => import('pages/portal/ObjectsPage.vue'),
        meta: { title: 'My Objects' },
      },
      {
        path: 'invoices',
        name: 'portal-invoices',
        component: () => import('pages/portal/InvoicesPage.vue'),
        meta: { title: 'My Invoices' },
      },
      {
        path: 'documents',
        name: 'portal-documents',
        component: () => import('pages/portal/DocumentsPage.vue'),
        meta: { title: 'My Documents' },
      },
      {
        path: 'tickets',
        name: 'portal-tickets',
        component: () => import('pages/portal/TicketsPage.vue'),
        meta: { title: 'My Tickets' },
      },
      {
        path: 'tickets/:id',
        name: 'portal-ticket-details',
        component: () => import('pages/portal/TicketDetailsPage.vue'),
        meta: { title: 'Ticket Details' },
      },
      {
        path: 'chat',
        name: 'portal-chat',
        component: () => import('pages/portal/ChatPage.vue'),
        meta: { title: 'Support Chat' },
      },
      {
        path: 'notifications',
        name: 'portal-notifications',
        component: () => import('pages/NotificationsPage.vue'),
        meta: { requiresAuth: true, userType: 'client' },
      },
    ],
  },

  // Legacy redirect for old dashboard route
  {
    path: '/',
    redirect: '/auth/login',
  },

  // Auth routes
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { title: 'Login' },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
      },
    ],
  },

  // Always leave this as last one, but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
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
    const requiresStaff = to.matched.some((record) => record.meta.requiresStaff)
    const requiresClient = to.matched.some((record) => record.meta.requiresClient)

    console.log('Route check:', {
      path: to.path,
      requiresAuth,
      requiresStaff,
      requiresClient,
      isAuthenticated: authStore.isAuthenticated,
      userType: authStore.userType,
    })

    if (requiresAuth && !authStore.isAuthenticated) {
      next('/auth/login')
      return
    }

    // Redirect based on user type
    if (authStore.isAuthenticated) {
      // Staff trying to access client portal
      if (requiresClient && authStore.userType !== 'client') {
        next('/admin/dashboard')
        return
      }

      // Client trying to access admin
      if (requiresStaff && authStore.userType !== 'staff') {
        next('/portal/dashboard')
        return
      }

      // Redirect from login if already authenticated
      if (to.path === '/auth/login') {
        next(authStore.getDefaultRoute)
        return
      }
    }

    next()
  })

  return Router
})
