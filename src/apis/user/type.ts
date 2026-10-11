import type { BaseResponse, PageResult } from '@/apis/common'

/**
 * 修改个人资料请求体。
 *
 * 字段全部可选，只提交需要改的那几项 —— 后端对未声明的字段是拒绝的，
 * 多传一个就 400。清空字段要传空字符串 `''`，传 `null` 会被当作「不修改」。
 * 约束值（2-50 位等）与后端 User 表的列宽一致。
 */
export interface UserInfo {
  id: number
  username: string
  name: string
  role: string
  email?: string
  phone?: string
  avatar?: string
  status: number
}
export interface UpdateUser {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface AddRequest {
  username: string
  password: string
  name: string
  email: string
  phone: string
}

/** 修改个人资料没有返回体，成功时 data 为 null */
export type UpdateUserResponse = BaseResponse<null>
/** 新增用户按「无返回体」处理；若接口实际会回创建出来的用户，把这里的 null 换掉即可 */
export type AddUserResponse = BaseResponse<null>
export type UserInfoResponse = BaseResponse<UserInfo>

/** 用户列表：data.records 为当前页用户，data 本身可能为 null，取用前要判空 */
export type UserListResponse = BaseResponse<PageResult<UserInfo>>
