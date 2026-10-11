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
      // 内容区由 ContentComponent 里的 <router-view> 承载。children 里没有 path: ''，
      // 所以 /dashboard 自身匹配不到子页，必须重定向到一个具体子路由，否则内容区空白
      redirect: '/dashboard/dashhome',
      meta: { title: '首页', icon: 'Home' },
      // 侧栏菜单由这里的 children + meta 派生，加页面时改这一处即可。
      // icon 写的是组件名字符串，main.ts 已把图标全量全局注册，模板里能直接解析
      children: [
        {
          path: 'dashhome',
          name: 'dashhome',
          component: () => import('@/views/HomeLayout/DashboardHome.vue'),
          meta: { title: '首页', icon: 'DataBoard' },
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/UserLayout/UserLayout.vue'),
          meta: { title: '用户管理', icon: 'User' },
        },
        {
          path: 'role',
          name: 'role',
          component: () => import('@/views/RoleLayout/RoleLayout.vue'),
          meta: { title: '角色管理', icon: 'Avatar' },
        },
        {
          path: 'lab',
          name: 'lab',
          component: () => import('@/views/PermissionLayout/PermissionLayout.vue'),
          meta: { title: '实验室管理', icon: 'Cpu' },
        },
      ],
    },
    // 404 界面
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('@/views/UnknownLayout.vue'),
    },
  ],
})

export default router
