import type { LoginData } from '@/apis/auth/type'
import { getToken, removeToken } from '@/utils/token'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const UserStore = defineStore('user', () => {
  const userInfo = ref<LoginData | null>(null)
  const token = ref(getToken())

  const clearUserStore = () => {
    userInfo.value = null
    token.value = null
    removeToken()
  }
  // setup store 必须显式 return，否则 store 实例上拿不到这些属性
  return { userInfo, token, clearUserStore }
})

export default UserStore
