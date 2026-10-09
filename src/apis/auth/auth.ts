import request from '@/utils/request'
import type { Login, LoginResponse, Register, RegisterResponse } from './type'

enum API {
  LOGIN_URL = '/auth/login',
  REGISTER_URL = '/auth/register',
}

export const reqLogin = (data: Login) =>
  request.post<LoginResponse, LoginResponse>(API.LOGIN_URL, data)

export const reqRegister = (data: Register) =>
  request.post<RegisterResponse, RegisterResponse>(API.REGISTER_URL, data)
