<template>
  <!-- 全局中文：Element Plus 默认是英文，分页器的「共 X 条 / 前往 X 页」等文案都来自这里 -->
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<script lang="ts" setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<style scoped lang="scss"></style>
