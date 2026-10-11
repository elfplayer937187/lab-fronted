import type { BaseResponse } from '@/apis/common'

export interface LoginData {
  id: number
  username: string
  name: string
  role: string
  email: string
  phone: string
  avatar: string | null
  status: number
}

export interface Login {
  username: string
  password: string
}
export type LoginResponse = BaseResponse<LoginData>

/** 注册请求体，字段名与后端契约保持一致（下划线风格） */
export interface Register {
  username: string
  password: string
  confirm_password: string
  name: string
  email: string
  phone: string
}
export type RegisterResponse = BaseResponse<LoginData>
