import type { BaseResponse } from '@/apis/common'

/**
 * 修改个人资料请求体。
 *
 * 字段全部可选，只提交需要改的那几项 —— 后端对未声明的字段是拒绝的，
 * 多传一个就 400。清空字段要传空字符串 `''`，传 `null` 会被当作「不修改」。
 * 约束值（2-50 位等）与后端 User 表的列宽一致。
 */
export interface UpdateUser {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

/** 修改个人资料没有返回体，成功时 data 为 null */
export type UpdateUserResponse = BaseResponse<null>
