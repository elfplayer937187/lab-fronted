import { reqGetUserInfo } from '@/apis/user/user'
import type { UserProfile } from '@/apis/user/type'
import { getToken, removeToken } from '@/utils/token'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const UserStore = defineStore('user', () => {
  const userInfo = ref<UserProfile | null>(null)
  const token = ref(getToken())

  // buttons(type=2) + permissions(type=1) 的 code 合集，守卫、侧栏、指令共用
  const permissions = ref<string[]>([])
  // 是否已经拉过 /user/getInfo。刷新后为 false，必须重新拉一次
  const profileLoaded = ref(false)
  // 并发导航时共用同一个请求，避免重复调 getInfo
  let inflight: Promise<UserProfile> | null = null

  const loadProfile = async () => {
    if (profileLoaded.value) return
    // 记下发请求时的 token：请求途中退出登录/换账号时，回来的旧数据不能写进 store
    const requestToken = token.value
    if (!inflight) {
      inflight = reqGetUserInfo().then((res) => {
        if (res.code !== 200 || !res.data) {
          throw new Error(res.message || '获取用户信息失败')
        }
        return res.data
      })
    }
    const current = inflight

    try {
      const profile = await current
      if (token.value !== requestToken) {
        throw new Error('登录状态已变更')
      }
      userInfo.value = profile
      // 后端不过滤 status，禁用掉的权限不能算数
      permissions.value = [
        ...new Set(
          [...(profile.buttons ?? []), ...(profile.permissions ?? [])]
            .filter((item) => item.status !== 0 && item.code?.trim())
            .map((item) => item.code.trim()),
        ),
      ]
      profileLoaded.value = true
    } finally {
      // 只清自己那一个：期间若有新请求接管，别把新 Promise 也置空
      if (inflight === current) inflight = null
    }
  }

  /**
   * 是否拥有某个权限。
   * - 不传 code：视为不需要权限
   * - 传数组：任一命中即可
   * - 严格模式：权限集合为空时一律拒绝（只有没配 meta.permission 的首页放行）
   */
  const hasPermission = (code?: string | string[]) => {
    if (!code || (Array.isArray(code) && code.length === 0)) return true
    const need = Array.isArray(code) ? code : [code]
    return need.some((item) => permissions.value.includes(item))
  }

  const clearUserStore = () => {
    userInfo.value = null
    token.value = null
    permissions.value = []
    profileLoaded.value = false
    inflight = null
    removeToken()
  }

  // setup store 必须显式 return，否则 store 实例上拿不到这些属性
  return {
    userInfo,
    token,
    permissions,
    profileLoaded,
    loadProfile,
    hasPermission,
    clearUserStore,
  }
})

export default UserStore
