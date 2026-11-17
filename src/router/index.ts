import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { PERM } from '@/constants/permissions'

/**
 * /dashboard 的子路由。单独导出是因为侧栏菜单要读同一份定义
 * （以前读 router.getRoutes()，它不可响应，权限变化后菜单不会更新）。
 */
export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: 'dashhome',
    name: 'dashhome',
    component: () => import('@/views/HomeLayout/DashboardHome.vue'),
    meta: { title: '首页', icon: 'DataBoard' },
  },
  // 权限管理
  {
    path: 'permission',
    name: 'permission',
    redirect: '/dashboard/permission/user',
    meta: { title: '用户管理', icon: 'User' },
    children: [
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/UserLayout/UserLayout.vue'),
        meta: { title: '用户管理', icon: 'User', permission: PERM.userList },
      },
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/RoleLayout/RoleLayout.vue'),
        meta: { title: '角色管理', icon: 'Avatar', permission: PERM.roleList },
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/MenuLayout/MenuLayout.vue'),
        meta: { title: '菜单管理', icon: 'Menu', permission: PERM.menuList },
      },
    ],
  },
  // 实验室管理
  {
    path: 'lab',
    name: 'lab',
    meta: { title: '实验室管理', icon: 'Cpu' },
    // 必须指向具体子页：指向 /dashboard/lab 本身会无限重定向
    redirect: '/dashboard/lab/Laboratory',
    children: [
      {
        path: 'Laboratory',
        name: 'Laboratory',
        component: () => import('@/views/Lab/LabLayout.vue'),
        meta: { title: '实验室管理', icon: 'Cpu', permission: PERM.labList },
      },
      // 设备类型 / 设备资料拆成两个页面。权限表目前只有 labdevice:list，
      // 两边先共用；以后拆权限在这里换成各自的 code
      {
        path: 'labdevicetype',
        name: 'labdevicetype',
        component: () => import('@/views/Lab/LabDeviceTypeLayout.vue'),
        meta: { title: '设备类型管理', icon: 'Collection', permission: PERM.labdeviceList },
      },
      {
        path: 'labdevice',
        name: 'labdevice',
        component: () => import('@/views/Lab/LabDeviceLayout.vue'),
        meta: { title: '设备资料管理', icon: 'Monitor', permission: PERM.labdeviceList },
      },
      // 实验室预约
      {
        path: 'labbook',
        name: 'labbook',
        component: () => import('@/views/LabBookLayout/LabBookLayout.vue'),
        meta: { title: '实验室预约管理', icon: 'Cpu', permission: PERM.labbookList },
      },
    ],
  },
  // ai小助手
  {
    path: 'ai',
    name: 'ai',
    component: () => import('@/views/AI/AILayout.vue'),
    meta: { title: 'ai小助手', icon: 'Robot', permission: PERM.aiChat },
  },
]

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
      // 侧栏菜单由这里的 children + meta 派生，加页面时改 dashboardRoutes 即可。
      // icon 写的是组件名字符串，main.ts 已把图标全量全局注册，模板里能直接解析
      children: dashboardRoutes,
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

// 让 meta.permission 在守卫和侧栏里有类型提示
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    permission?: string | string[]
  }
}
