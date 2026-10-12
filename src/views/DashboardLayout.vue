<template>
  <div class="flex w-full h-full">
    <NavComponent
      class="h-full bg-linear-120 border-r border-gray-200 dark:border-black dark:from-slate-900 dark:to-slate-800"
    ></NavComponent>
    <div class="right flex-1 overflow-y-scroll">
      <TabbarComponent
        class="h-(--logo-height) bg-white/60 border-b border-black/5 dark:bg-slate-900/60 dark:border-white/10 flex items-center px-4"
      ></TabbarComponent>
      <ContentComponent :refresh-tick="refreshTick"></ContentComponent>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { provide, ref } from 'vue'
import NavComponent from '@/views/HomeLayout/NavComponent.vue'
import TabbarComponent from '@/views/HomeLayout/TabbarComponent.vue'
import ContentComponent from '@/views/HomeLayout/ContentComponent.vue'
import { contentRefreshKey } from '@/composables/useContentRefresh'

// 刷新逻辑留在布局层，Tabbar 只负责「请求刷新」
const refreshTick = ref(0)
provide(contentRefreshKey, () => {
  refreshTick.value += 1
})
</script>

<style scoped lang="css"></style>
