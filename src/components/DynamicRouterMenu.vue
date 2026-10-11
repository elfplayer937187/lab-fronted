<template>
  <template v-for="menu in menus" :key="menu.path">
    <!-- 只有一级菜单，没有 children。
         图标走默认插槽、文字走 title 插槽：折叠时 EP 只留下默认插槽当触发区，
         title 插槽的内容被挪进 tooltip，图标放错位置就会一片空白 -->
    <template v-if="menu && menu.children && menu.children.length === 0">
      <el-menu-item :index="menu.path">
        <el-icon><component :is="menu.meta.icon"></component></el-icon>
        <template #title>{{ menu.meta.title }}</template>
      </el-menu-item>
    </template>
    <!-- 有children 的菜单只有一个子集 -->
    <template v-else-if="menu && menu.children.length === 1">
      <el-sub-menu :index="menu.path">
        <template #title>
          <el-icon><component :is="menu.meta.icon"></component></el-icon>
          <span>{{ menu.meta.title }}</span>
        </template>
        <el-menu-item :index="menu.children[0]!.path">{{
          menu.children[0]!.meta!.title
        }}</el-menu-item>
      </el-sub-menu>
    </template>
    <!-- 有children 的菜单有多个子集。
         折叠时 EP 靠 .el-sub-menu__title > span 隐藏文字，文字必须裹在 span 里 -->
    <template v-else-if="menu && menu.children.length > 1">
      <el-sub-menu :index="menu.path">
        <template #title>
          <el-icon><component :is="menu.meta.icon"></component></el-icon>
          <span>{{ menu.meta.title }}</span>
        </template>
        <DynamicRouterMenu :menus="menu.children"></DynamicRouterMenu>
      </el-sub-menu>
    </template>
  </template>
</template>

<script lang="ts" setup>
import type { RouteRecordNormalized } from 'vue-router'
const props = defineProps(['menus'])
const menus: RouteRecordNormalized[] = props.menus
console.log(menus)
</script>

<style scoped lang="css"></style>
