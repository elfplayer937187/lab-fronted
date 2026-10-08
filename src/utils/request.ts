import { getToken } from '@/utils/token'
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 5000,
})
const token = getToken()
request.interceptors.request.use(
  (config) => {
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
