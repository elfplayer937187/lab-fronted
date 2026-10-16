import request from '@/utils/request'
import type { DeleteRoleResponse, RoleListResponse, RoleSaveResponse, SaveRole } from './type'

enum API {
  CREATE_URL = '/role/create',
  LIST_URL = '/role/list',
  UPDATE_URL = '/role/update',
  // roleId 走的是路径参数，不是 query，别照着 /user/delete 的写法传 params
  DELETE_URL = '/role/delete',
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
