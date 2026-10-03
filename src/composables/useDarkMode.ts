import { readonly, ref } from 'vue'

const STORAGE_KEY = 'lab-fronted:color-scheme'

function readStored(): boolean | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : raw === 'dark'
  } catch {
    // localStorage 不可用（隐私模式、被禁用等）时回退到系统偏好
    return null
  }
}

function apply(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark)
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  } catch {
    // 仅跳过持久化，本次会话内主题仍然生效
  }
}

// 模块级单例：全应用共享同一份主题状态，任意组件调用 useDarkMode 都拿到同一个 ref
const isDark = ref(readStored() ?? window.matchMedia('(prefers-color-scheme: dark)').matches)

apply(isDark.value)

/**
 * 深色模式开关。
 *
 * 优先级：localStorage 中用户的选择 > 系统偏好。
 * 切换时同步 html.dark 类（Element Plus 的暗色变量依赖它）并写回 localStorage。
 */
export function useDarkMode() {
  function toggle(): void {
    isDark.value = !isDark.value
    apply(isDark.value)
  }

  return { isDark: readonly(isDark), toggle }
}
