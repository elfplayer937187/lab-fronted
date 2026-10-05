<template>
  <div class="flex w-full h-full">
    <NavComponent
      class="w-(--nav-width) h-full bg-linear-120 from-white to-green-500"
    ></NavComponent>
    <div class="right flex-1">
      <TabbarComponent
        class="h-(--logo-height) bg-linear-120 from-green-300 to-cyan-300 flex items-center px-4"
      ></TabbarComponent>
      <ContentComponent></ContentComponent>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NavComponent from '@/views/HomeLayout/NavComponent.vue'
import TabbarComponent from '@/views/HomeLayout/TabbarComponent.vue'
import ContentComponent from '@/views/HomeLayout/ContentComponent.vue'
</script>

<style scoped lang="css"></style>
