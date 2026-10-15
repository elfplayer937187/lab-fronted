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
      config.headers['Authorization'] = `Bearer ${token}`
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
  // axios 对非 2xx 是 reject，err.message 永远只是 Request failed with status code 400。真正的 message 在 err.response.data.message。
  (error) => {
    console.dir(error)
    ElMessage.error(error.response.data.message)
    return Promise.reject(error)
  },
)
export default request
