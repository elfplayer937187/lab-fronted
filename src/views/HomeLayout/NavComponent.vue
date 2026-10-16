<template>
  <div class="nav flex flex-col h-full" :class="{ 'is-fold': isFold }">
    <!-- 顶部：logo + 标题 -->
    <div
      class="nav-header flex h-(--logo-height) shrink-0 items-center gap-2.5 px-4 border-b border-black/5 dark:border-white/10"
    >
      <img class="nav-logo" :src="logoUrl" alt="AILab" />
      <h1 class="nav-title font-medium tracking-wide text-(--el-text-color-primary)">AI Lab</h1>
    </div>

    <!-- 菜单项由路由表的 children + meta 派生。router 模式内部走的是 router.push(index)，
         不走 router-link，所以这里不需要声明式跳转标签 -->
    <el-menu
      class="nav-menu flex-1 overflow-y-auto"
      :collapse="isFold"
      :default-active="route.path"
      router
    >
      <DynamicRouterMenu :menus="menus[0]?.children ?? []" parent-path="/dashboard" />
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import logoUrl from '@/assets/images/Login-Label.png'
import useConfigStore from '@/stores/modules/config'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import DynamicRouterMenu from '@/components/DynamicRouterMenu.vue'
// 折叠状态在 config store 里，Tabbar 的按钮和这里读的是同一份
const route = useRoute()
const router = useRouter()
const menus = router.getRoutes().filter((route) => {
  return route.path === '/dashboard'
})
console.log(menus)

const { isFold } = storeToRefs(useConfigStore())
</script>

<style scoped lang="css">
/* 宽度跟着 store 走。过渡写在 CSS 而不是用 Tailwind 的 transition-*，
   是因为 el-menu 折叠时也在变宽，两边得用同一条时间曲线才不会脱节 */
.nav {
  flex: none;
  width: var(--nav-width);
  overflow: hidden;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav.is-fold {
  width: var(--nav-collapsed-width);
}

/* 素材是白底方形图，图形只占中间 —— 收成小圆角方块当 logo 徽标，别撑满整条 header */
.nav-logo {
  height: 2.25rem;
  width: 2.25rem;
  flex: none;
  object-fit: contain;
  border-radius: 0.5rem;
}

.nav-title {
  font-size: 18px;
  /* min-width: 0 是必需的：flex 项默认 min-width: auto，会拦住 max-width 把它压到 0 */
  min-width: 0;
  max-width: 12rem;
  overflow: hidden;
  white-space: nowrap;
  transition:
    max-width 300ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 200ms ease;
}

/* 折叠时标题收成 0 宽淡出，logo 顺势滑到中间，比直接消失少一点跳变 */
.nav.is-fold .nav-title {
  max-width: 0;
  opacity: 0;
}

.nav.is-fold .nav-header {
  justify-content: center;
  gap: 0;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

/* el-menu 默认右边框在深色底上不好看，先去掉 */
/* EP 给 el-menu 铺了一层不透明底色（--el-menu-bg-color → --el-fill-color-blank），
   置空才能让侧栏的渐变透上来。只挂在 .nav-menu 上，不动其它地方的菜单 */
.nav-menu {
  border-right: none;
  --el-menu-bg-color: transparent;
}
</style>
