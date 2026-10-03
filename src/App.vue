<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggle } = useDarkMode()

const keyword = ref('')

// ElMessage 由 unplugin-auto-import 自动注入，无需手写 import。
// 注意：只对 <script> 里的用法生效；模板里直接写 ElMessage 需要额外开 vueTemplate 选项。
function notify(): void {
  ElMessage.success('按需引入生效了')
}
</script>

<template>
  <!-- 提供简体中文文案（分页、日期选择、确认框按钮等），并作为全局配置入口 -->
  <el-config-provider :locale="zhCn">
    <main class="page">
      <header class="page__header">
        <h1 class="page__title">lab-fronted</h1>
        <el-switch
          :model-value="isDark"
          inline-prompt
          active-text="暗"
          inactive-text="亮"
          @change="toggle"
        />
      </header>

      <p class="page__hint">
        Element Plus 已配置为按需自动引入：下面的组件都没有手写 import，样式也只在用到时才打包。
      </p>

      <el-space wrap :size="12">
        <el-button type="primary" plain @click="notify">主要按钮</el-button>
        <el-button type="success" plain>成功按钮</el-button>
        <el-button type="danger" plain>危险按钮</el-button>
        <!-- :icon 需要组件对象，所以 Search 是从 @element-plus/icons-vue 显式 import 的 -->
        <el-button :icon="Search">图标按钮</el-button>
        <el-tag type="primary">标签</el-tag>
        <el-tag type="warning" effect="dark">深色标签</el-tag>
      </el-space>

      <el-space wrap :size="12">
        <!-- 其余图标已在 main.ts 全局注册，模板里按名字直接用即可 -->
        <el-icon :size="24"><Search /></el-icon>
        <el-icon :size="24"><Setting /></el-icon>
        <el-icon :size="24"><Star /></el-icon>
        <el-input v-model="keyword" placeholder="输入点什么……" clearable style="width: 220px" />
      </el-space>

      <p class="page__hint">
        想接入路由时，把 <code>&lt;router-view /&gt;</code> 放进
        <code>el-config-provider</code> 内部即可。
      </p>
    </main>
  </el-config-provider>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
  color: var(--el-text-color-primary);
}

.page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page__title {
  margin: 0;
  font-size: 28px;
}

.page__hint {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
</style>
