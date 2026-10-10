import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export type ContentRefresh = () => void

/**
 * 内容区刷新的注入键。
 *
 * 用 Symbol 保证跨模块唯一，InjectionKey<T> 让 provide / inject 两端共享同一份
 * 签名，写错会在 vue-tsc 阶段暴露，而不是退化成 any。
 */
export const contentRefreshKey: InjectionKey<ContentRefresh> = Symbol('content-refresh')

/**
 * 取「刷新内容区」的触发函数。
 *
 * 由 DashboardLayout 提供实现（自增 refreshTick，让 ContentComponent 里的
 * router-view 换 key 重建）；脱离 provider 使用时回退为 no-op，不抛错。
 */
export function useContentRefresh(): ContentRefresh {
  return inject(contentRefreshKey, () => {})
}
