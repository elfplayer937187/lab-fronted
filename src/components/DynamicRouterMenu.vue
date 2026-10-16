<template>
  <template v-for="menu in menus" :key="menu.path">
    <!-- 只有一级菜单，没有 children。
         图标走默认插槽、文字走 title 插槽：折叠时 EP 只留下默认插槽当触发区，
         title 插槽的内容被挪进 tooltip，图标放错位置就会一片空白 -->
    <template v-if="menu && !menu.children">
      <el-menu-item :index="fullPath(menu.path)">
        <el-icon><component :is="menu.meta?.icon"></component></el-icon>
        <template #title>{{ menu.meta?.title }}</template>
      </el-menu-item>
    </template>
    <!-- 有children 的菜单只有一个子集 -->
    <template v-else-if="menu && menu.children && menu.children.length === 1">
      <el-sub-menu :index="fullPath(menu.path)">
        <template #title>
          <el-icon><component :is="menu.meta?.icon"></component></el-icon>
          <span>{{ menu.meta?.title }}</span>
        </template>
        <el-menu-item :index="joinPath(fullPath(menu.path), menu.children[0]!.path)">{{
          menu.children[0]!.meta?.title
        }}</el-menu-item>
      </el-sub-menu>
    </template>
    <!-- 有children 的菜单有多个子集。
         折叠时 EP 靠 .el-sub-menu__title > span 隐藏文字，文字必须裹在 span 里 -->
    <template v-else-if="menu && menu.children && menu.children.length > 1">
      <el-sub-menu :index="fullPath(menu.path)">
        <template #title>
          <el-icon><component :is="menu.meta?.icon"></component></el-icon>
          <span>{{ menu.meta?.title }}</span>
        </template>
        <DynamicRouterMenu
          :menus="menu.children"
          :parent-path="fullPath(menu.path)"
        ></DynamicRouterMenu>
      </el-sub-menu>
    </template>
  </template>
</template>

<script lang="ts" setup>
import type { RouteRecordRaw } from 'vue-router'

// 菜单树喂进来的是 getRoutes() 顶层记录的 children，也就是路由表里的原始定义
// （path 还停在相对形式：vue-router 只把拼好的绝对路径写进内部 normalized 副本，
// 不回写原数组），所以 path 得自己拼，meta 也因此可能是空的
const props = withDefaults(defineProps<{ menus: RouteRecordRaw[]; parentPath?: string }>(), {
  parentPath: '',
})

function joinPath(base: string, path: string) {
  // 路由表里写成绝对路径的子路由按原样用，别重复拼一层
  if (!base || path.startsWith('/')) return path
  return `${base.replace(/\/$/, '')}/${path}`
}
const fullPath = (path: string) => joinPath(props.parentPath, path)
</script>

<style scoped lang="css"></style>
