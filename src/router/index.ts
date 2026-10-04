import { pa } from 'element-plus/es/locales.mjs'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/auth',
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthLayout.vue'),
      redirect: '/auth/login',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/LoginLayout.vue'),
        },
      ],
    },
  ],
})

export default router
