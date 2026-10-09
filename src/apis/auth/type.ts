import type { BaseResponse } from '@/apis/common'

export interface LoginData {
  userId: number
  username: string
  name: string
  role: string
  email: string
  phone: string
  avatar: string | null
  status: number
  token: string
}

export interface Login {
  username: string
  password: string
}
export type LoginResponse = BaseResponse<LoginData>
