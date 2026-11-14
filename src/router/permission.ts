import router from '.'
import userStore from '@/stores/modules/user.ts'
import { ElMessage } from 'element-plus'
import nprogress from 'nprogress'

// 登录/注册页：未登录可进，已登录要被送回首页
const AUTH_ROUTES = new Set(['login', 'register'])
// 不需要登录、也不参与权限校验的页面（404 对已登录用户也要正常展示）
const PUBLIC_ROUTES = new Set([...AUTH_ROUTES, '404'])
// 无权限时的兜底页：它没有 meta.permission，任何登录用户都能进
const HOME = { name: 'dashhome' } as const

router.beforeEach(async (to) => {
  nprogress.start()
  const user = userStore()

  if (!user.token) {
    if (PUBLIC_ROUTES.has(String(to.name))) return true
    return { name: 'login', replace: true }
  }

  // 已登录还去登录/注册页，直接回首页（会再走一次守卫）
  if (AUTH_ROUTES.has(String(to.name))) {
    return { path: '/' }
  }

  if (!user.profileLoaded) {
    try {
      await user.loadProfile()
    } catch {
      ElMessage.error('登录状态失效，请重新登录')
      user.clearUserStore()
      return { name: 'login', replace: true }
    }
  }

  // to.meta 是各层合并后的结果，父子同 key 会被子覆盖，
  // 所以要逐条检查 matched，而不是只看 to.meta
  const required = to.matched
    .map((record) => record.meta.permission)
    .filter((code): code is string | string[] => Boolean(code))

  if (required.some((code) => !user.hasPermission(code))) {
    if (to.name === HOME.name) {
      // 连兜底页都没权限：中止导航。return false 不触发 afterEach，手动收进度条
      nprogress.done()
      return false
    }
    ElMessage.error('没有访问权限')
    return { ...HOME, replace: true }
  }

  return true
})

router.afterEach(() => nprogress.done())
