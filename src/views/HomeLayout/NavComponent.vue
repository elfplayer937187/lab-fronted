<template>
  <div class="nav flex flex-col">
    <!-- 顶部：logo + 标题 -->
    <div class="nav-header flex h-(--logo-height) shrink-0 items-center gap-2 px-4">
      <img class="nav-logo" :src="logoUrl" alt="AILab" />
      <h1 class="nav-title text-2xl font-light">AI Lab</h1>
    </div>

    <!-- 菜单：先写静态名称，后续接路由 -->
    <el-menu class="nav-menu flex-1 overflow-y-auto" default-active="1">
      <el-menu-item index="1">
        <el-icon><DataBoard /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><Files /></el-icon>
        <span>数据集管理</span>
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><Cpu /></el-icon>
        <span>模型训练</span>
      </el-menu-item>
      <el-menu-item index="4">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="5">
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import logoUrl from '@/assets/images/Login-Label.png'
</script>

<style scoped lang="css">
/* 宽度由父组件用 w-(--nav-width) 控制，变量定义在 src/styles/settings.css */
.nav-logo {
  height: 100%;
  object-fit: contain;
}

.nav-title {
  font-size: 20px;
}

/* el-menu 默认右边框在深色底上不好看，先去掉 */
.nav-menu {
  border-right: none;
}
</style>
