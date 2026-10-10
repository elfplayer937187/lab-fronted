<template>
  <el-drawer v-model="visible" title="系统设置" direction="rtl" size="320px">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <span class="text-(--el-text-color-primary)">暗色模式</span>
        <!-- isDark 是 readonly，没有 setter，只能单向绑定 + 事件里翻转 -->
        <el-switch
          :model-value="isDark"
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggle"
        />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-(--el-text-color-primary)">主题色</span>
        <span class="flex items-center gap-2">
          <span class="text-xs text-(--el-text-color-secondary)">开发中</span>
          <el-color-picker disabled />
        </span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-(--el-text-color-primary)">界面缩放</span>
        <span class="flex items-center gap-2">
          <span class="text-xs text-(--el-text-color-secondary)">开发中</span>
          <el-select disabled placeholder="100%" class="w-24!">
            <el-option label="100%" value="100" />
            <el-option label="125%" value="125" />
          </el-select>
        </span>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useDarkMode } from '@/composables/useDarkMode'

const visible = defineModel<boolean>({ default: false })
const { isDark, toggle } = useDarkMode()
</script>

<style scoped lang="css"></style>
