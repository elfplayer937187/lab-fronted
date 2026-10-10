<template>
  <div class="content">
    <!-- v-slot 拿到当前匹配到的组件，交给 Transition 做进出场。
         refreshTick 挂在组件自己的 key 上，所以点「刷新」也会走一次过渡 -->
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="props.refreshTick" />
      </Transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ refreshTick: number }>()
</script>

<style scoped lang="css">
/* 过渡的类是加在被渲染组件的根元素上的，从 .content 用 :deep() 往下匹配，
   这样即使路由组件的根节点没继承到 scope id 也不会落空。
   out-in 模式下同一时刻只挂载一个，不需要绝对定位处理叠放。 */
.content :deep(.page-enter-active) {
  transition:
    opacity 250ms ease,
    transform 250ms ease;
}

/* 离场比进场快，out-in 的整体节奏更跟手 */
.content :deep(.page-leave-active) {
  transition: opacity 150ms ease;
}

.content :deep(.page-enter-from) {
  opacity: 0;
  transform: translateY(8px);
}

.content :deep(.page-leave-to) {
  opacity: 0;
}
</style>
