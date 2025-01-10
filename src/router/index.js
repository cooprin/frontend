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
        component: () => import('pages/DashboardPage.vue')
      }
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue')
      }
    ]
  }
]

export default route(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory()
  })

  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    console.log('Route check:', {
      path: to.path,
      requiresAuth: to.matched.some(record => record.meta.requiresAuth),
      isAuthenticated: authStore.isAuthenticated
    })

    if (to.matched.some(record => record.meta.requiresAuth) && !authStore.isAuthenticated) {
      console.log('Redirecting to login')
      next({ name: 'login' })
    } else {
      console.log('Proceeding to route')
      next()
    }
  })

  return Router
})