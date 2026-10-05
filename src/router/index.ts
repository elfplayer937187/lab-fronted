import { pa } from 'element-plus/es/locales.mjs'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardLayout.vue'),
        },
      ],
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthLayout.vue'),
      redirect: '/auth/register',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/LoginLayout.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/RegisterLayout.vue'),
        },
      ],
    },
  ],
})

export default router
