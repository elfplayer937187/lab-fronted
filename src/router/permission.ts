import router from '.'
import userStore from '@/stores/modules/user.ts'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import nprogress, { remove } from 'nprogress'
import { reqGetUserInfo } from '@/apis/user/user'
import { removeToken } from '@/utils/token'

router.beforeEach((to, from, next) => {
  const user = userStore()
  const { userInfo, token } = storeToRefs(user)

  nprogress.start()
  // storeToRefs 返回的是 ref 对象，ref 本身永远为真，必须取 .value
  if (token.value) {
    if (to.path === '/auth/login' || to.path === '/auth/register') {
      return next('/')
    } else {
      if (userInfo.value) {
        return next()
      } else {
        // 获取用户信息
        reqGetUserInfo().then(
          (res) => {
            user.userInfo = res.data
            return next()
          },
          (error) => {
            ElMessage.error(error.message)
            removeToken()
            token.value = null
            return next('/auth/login')
          },
        )
      }
    }
  } else {
    if (to.path === '/auth/login' || to.path === '/auth/register') {
      return next()
    } else {
      ElMessage.error('请先登录')
      return next('/auth/login')
    }
  }
})
router.afterEach(() => {
  nprogress.done()
})
