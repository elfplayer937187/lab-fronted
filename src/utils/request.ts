import { getToken } from '@/utils/token'
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 5000,
})
request.interceptors.request.use(
  (config) => {
    // 必须每次请求现读：登录是在模块加载之后才写 localStorage 的，
    // 在模块顶层取一次会一直用登录前的空值
    const token = getToken()
    if (token) {
      config.headers.token = token
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response) => {
    const resp = response.data
    return resp
  },
  (error) => {
    ElMessage.error(error.message)
    return Promise.reject(error)
  },
)
export default request
