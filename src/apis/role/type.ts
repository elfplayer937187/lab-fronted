import type { BaseResponse, PageResult } from '@/apis/common'

/**
 * 角色实体。
 *
 * 后端没给响应模型（`/role/list` 的 200 响应是空的），字段是照着请求体推的，
 * 列表项以实际返回为准。
 */
export interface RoleInfo {
  id: number
  /** 角色名 */
  name: string
  description?: string | null
  /** 状态：0-禁用，1-启用 */
  status: number
}

/**
 * 新增 / 编辑角色共用的请求体，带 id 走更新，不带走新增。
 *
 * 注意后端对更新是 `additionalProperties: false` 且 name、id 都必填 ——
 * 编辑时只想改状态也得把角色名原样带回来，少了会 400；而新增时不能带 id。
 */
export interface SaveRole {
  id?: number
  name: string
  description?: string
  status?: 0 | 1
}

/** 角色列表：data 可能为 null，取用前要判空 */
export type RoleListResponse = BaseResponse<PageResult<RoleInfo>>
/** 新增、更新、删除都没有返回体，成功时 data 为 null */
export type RoleSaveResponse = BaseResponse<null>
export type DeleteRoleResponse = BaseResponse<null>
