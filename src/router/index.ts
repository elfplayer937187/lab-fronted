import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard',
      children: [],
    },
    // 登录和注册页面
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
    // home界面
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardLayout.vue'),
      // 内容区由 ContentComponent 里的 <router-view> 承载，这里必须给出默认子页，
      // 否则该层匹配为空、内容区会渲染成空白。后续菜单项接路由时往 children 里加即可。
      children: [
        {
          path: '',
          name: 'dashboard-home',
          component: () => import('@/views/HomeLayout/DashboardHome.vue'),
        },
      ],
    },
  ],
})

export default router
