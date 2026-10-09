import request from '@/utils/request'
import type { Login, LoginResponse } from './type'

enum API {
  LOGIN_URL = '/api/login',
}

export const reqLogin = (data: Login) =>
  request.post<LoginResponse, LoginResponse>(API.LOGIN_URL, data)
