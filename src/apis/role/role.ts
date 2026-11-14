import request from '@/utils/request'
import type { BaseResponse } from '@/apis/common'
import type {
  DeleteRoleResponse,
  RoleListResponse,
  RolePermissionTreeResponse,
  RoleSaveResponse,
  SaveRole,
} from './type'

enum API {
  CREATE_URL = '/role/create',
  LIST_URL = '/role/list',
  UPDATE_URL = '/role/update',
  // roleId 走的是路径参数，不是 query，别照着 /user/delete 的写法传 params
  DELETE_URL = '/role/delete',
  // 分配权限也是 roleId 走 path 参数
  GET_ROLE_PERMISSIONS_URL = '/role/getAllPermissions',
  ASSIGN_PERMISSION_URL = '/role/assign/permission',
}

/**
 * 新增 / 编辑共用一个入口：带了 id 调 PUT /role/update，没带调 POST /role/create。
 *
 * id 为 undefined 时 JSON.stringify 会直接丢掉这个键，所以新增那条路不会多送
 * 一个 id 出去，不用手动挑字段。
 */
export const reqSaveRole = (data: SaveRole) =>
  data.id
    ? request.put<RoleSaveResponse, RoleSaveResponse>(API.UPDATE_URL, data)
    : request.post<RoleSaveResponse, RoleSaveResponse>(API.CREATE_URL, data)

export const reqGetRoleList = (page: number, pageSize: number, keyword: string) =>
  request.get<RoleListResponse, RoleListResponse>(API.LIST_URL, {
    params: {
      page,
      pageSize,
      keyword,
    },
  })

export const reqDeleteRole = (roleId: number) =>
  request.delete<DeleteRoleResponse, DeleteRoleResponse>(`${API.DELETE_URL}/${roleId}`)

/** 某角色已有的权限树，节点带 check（1=已拥有） */
export const reqGetRolePermissions = (roleId: number) =>
  request.get<RolePermissionTreeResponse, RolePermissionTreeResponse>(
    `${API.GET_ROLE_PERMISSIONS_URL}/${roleId}`,
  )

/**
 * 给角色全量替换权限。
 *
 * 后端是"先删后插"：空数组会打到 SQLAlchemy 的 insert ... values([]) 上直接 500，
 * 而且此时旧权限已经删掉了；重复 id 会主键冲突。所以在这里去重并拒绝空数组。
 * 请求体字段名是 permissionId（单数），别改成 permissionIds。
 */
export const reqAssignPermission = (roleId: number, ids: number[]) => {
  const permissionId = [...new Set(ids)]
  if (!permissionId.length) {
    return Promise.reject(new Error('permissionId 不能为空'))
  }
  return request.post<BaseResponse<null>, BaseResponse<null>>(API.ASSIGN_PERMISSION_URL, {
    roleId,
    permissionId,
  })
}
