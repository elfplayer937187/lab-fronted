<template>
  <div class="tabbar flex justify-between">
    <div class="left">
      <el-button type="" @click="IsFold = !IsFold">
        <el-icon><component :is="IsFold ? 'ArrowRight' : 'ArrowLeft'"></component></el-icon>
      </el-button>
    </div>
    <div class="right flex gap-2">
      <el-button type="primary" plain circle>
        <el-icon><Refresh /></el-icon>
      </el-button>
      <el-button type="primary" plain circle>
        <el-icon><Setting /></el-icon>
      </el-button>
      <el-button type="primary" plain circle>
        <el-icon><User /></el-icon>
      </el-button>
      <!-- <el-image :src="" fit="fill" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const IsFold = ref(false)
</script>

<style scoped lang="css"></style>
