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
  {
    path: '/404',
    component: () => import('pages/ErrorNotFound.vue'),
  },
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

    console.log('Route check:', {
      path: to.path,
      requiresAuth,
      token: !!authStore.token,
      user: !!authStore.user,
      isAuthenticated: authStore.isAuthenticated,
    })

    if (to.matched.length === 0) {
      next({ name: '404' })
      return
    }

    if (requiresAuth && !authStore.isAuthenticated) {
      console.log('Redirecting to login')
      next('/auth/login')
    } else if (to.path === '/auth/login' && authStore.isAuthenticated) {
      console.log('Already authenticated, redirecting to home')
      next('/')
    } else {
      console.log('Proceeding to route')
      next()
    }
  })

  return Router
})
