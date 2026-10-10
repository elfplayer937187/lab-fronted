import { computed, onUnmounted, readonly, ref } from 'vue'

// 模块级单例：全屏目标只有 document.documentElement 一个，状态本质是全局的。
// 若每个组件各持一份 isFullscreen，会出现「A 知道已全屏、B 不知道」的错位。
// document.fullscreenElement 才是单一数据源，这里只是它的响应式镜像。
const isFullscreen = ref(!!document.fullscreenElement)

/**
 * 整页全屏开关。
 *
 * 状态共享、监听按消费者注册（随 onUnmounted 移除），避免在模块 import 时
 * 就绑定事件。Esc 退出由浏览器处理，fullscreenchange 会把状态刷回来。
 */
export function useFullscreen() {
  const onChange = (): void => {
    isFullscreen.value = !!document.fullscreenElement
  }
  document.addEventListener('fullscreenchange', onChange)
  onUnmounted(() => document.removeEventListener('fullscreenchange', onChange))

  // 部分 iframe / 权限策略下浏览器会禁用全屏
  const isSupported = computed(() => !!document.fullscreenEnabled)

  async function toggle(): Promise<void> {
    if (!isSupported.value) {
      ElMessage.warning('当前环境不支持全屏')
      return
    }
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      // 非用户手势触发、被权限策略阻止等都会 reject
      ElMessage.warning('全屏切换失败')
    }
  }

  return { isFullscreen: readonly(isFullscreen), isSupported, toggle }
}
