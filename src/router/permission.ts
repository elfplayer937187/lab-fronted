import router from '.'
import userStore from '@/stores/modules/user.ts'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import nprogress from 'nprogress'
const user = userStore()
const { userInfo, token } = storeToRefs(user)

router.beforeEach((to, from, next) => {
  nprogress.start()
  if (token) {
    if (to.path === '/auth/login' || to.path === '/auth/register') {
      return next('/')
    } else {
      if (user.userInfo) {
        next()
      } else {
        // 获取用户信息
      }
    }
  }
})
