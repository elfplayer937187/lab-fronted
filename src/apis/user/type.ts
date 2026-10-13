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
  roles: string[]
}
export interface UpdateUser {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

/** 启用 / 禁用指定用户。status 只有 0（禁用）和 1（启用），后端是 Literal[0, 1] */
export interface UpdateUserStatus {
  id: number
  status: 0 | 1
}

/**
 * 新增 / 编辑用户共用的请求体，带 id 走更新，不带走新增。
 *
 * 两个接口的字段并不对称，别照着一份字段表两边都用：
 *   - 新增（POST /user/create）要 username + password + name + phone，email 可空
 *   - 更新（PUT /user/updateById）**不收 username**（改账号等于换登录凭据），
 *     传过去会直接 400 `body.username: Extra inputs are not permitted`；
 *     password 留空表示不改密码
 */
export interface SaveUser {
  id?: number
  /** 只有新增接口认这个字段 */
  username?: string
  /** 新增必填；编辑时留空表示不改密码 */
  password?: string
  name: string
  email?: string
  phone: string
  /** 只有更新接口认这个字段，不传表示不改 */
  status?: 0 | 1
}
export interface RoleListResponse {
  id: number
  name: string
  check: boolean
}

/** 修改个人资料没有返回体，成功时 data 为 null */
export type UpdateUserResponse = BaseResponse<null>
/** 新增用户按「无返回体」处理；若接口实际会回创建出来的用户，把这里的 null 换掉即可 */
export type UserSaveResponse = BaseResponse<null>
export type UserInfoResponse = BaseResponse<UserInfo>

/** 用户列表：data.records 为当前页用户，data 本身可能为 null，取用前要判空 */
export type UserListResponse = BaseResponse<PageResult<UserInfo>>

export type RoleListResp = BaseResponse<RoleListResponse[]>
