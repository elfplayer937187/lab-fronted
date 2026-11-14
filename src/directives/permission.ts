import type { Directive } from 'vue'
import useUserStore from '@/stores/modules/user'

/**
 * 按钮级权限：v-permission="PERM.userCreate" 或 v-permission="[a, b]"（任一命中）。
 *
 * 没权限用 display: none 而不是移除节点 —— 被 removeChild 掉的节点仍留在 vnode 里，
 * el-table 刷新行数据时再 patch 就会抛 NotFoundError。
 * 退出登录会卸载整个 DashboardLayout，重新登录时指令会重新执行，不会残留上一个账号的状态。
 */
export const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    if (!useUserStore().hasPermission(binding.value)) {
      el.style.display = 'none'
    }
  },
}
