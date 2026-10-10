<template>
  <div class="content">
    <!-- 换 key 让当前路由组件整体销毁重建，外层布局与 Pinia 状态都保留 -->
    <router-view :key="props.refreshTick" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ refreshTick: number }>()
</script>

<style scoped lang="css"></style>
