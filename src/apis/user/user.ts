import request from '@/utils/request'
import type {
  UpdateUser,
  UpdateUserResponse,
  UserListResponse,
  SaveUser,
  UserSaveResponse,
  UpdateUserStatus,
  RoleListResp,
} from './type'
import type { RegisterResponse } from '@/apis/auth/type'
import type { BaseResponse } from '../common'
import type { RoleListResponse } from '../role/type'

enum API {
  UPDATE_URL = '/user/update',
  GET_USERINFO_URL = '/user/getInfo',
  // 获取用户列表
  GET_USERLIST_URL = '/user/list',
  // 新增用户
  ADD_USER_URL = '/user/create',
  // 修改指定用户
  UPDATE_BY_ID_URL = '/user/updateById',
  // 删除用户
  DELETE_USER_URL = '/user/delete',
  // 启用 / 禁用用户
  UPDATE_STATUS_URL = '/user/updateStatus',
  // 获取所有角色列表
  GET_ROLE_LIST_URL = '/user/getAllRoles',
  // 分配指定用户角色
  ASSIGN_ROLE_URL = '/user/assign_role',
}

export const reqUpdateUser = (data: UpdateUser) =>
  request.put<UpdateUserResponse, UpdateUserResponse>(API.UPDATE_URL, data)

export const reqGetUserInfo = () =>
  request.get<RegisterResponse, RegisterResponse>(API.GET_USERINFO_URL)

export const reqGetUserList = (page: number, pageSize: number, keyword: string) =>
  request.get<UserListResponse, UserListResponse>(API.GET_USERLIST_URL, {
    params: {
      page,
      pageSize,
      keyword,
    },
  })

/**
 * 新增 / 编辑用户共用一个入口：带了 id 调 PUT /user/updateById，没带调 POST /user/create。
 *
 * 更新那条路是显式挑字段的，不是把整个对象发出去 —— 更新接口的模型里没有 username，
 * 多带一个就是 400 `body.username: Extra inputs are not permitted`。顺便把空的
 * password 转成 undefined（留空 = 不改密码，传空串会被后端的 minLength 6 拦下）。
 */
export const reqSaveUser = (data: SaveUser) => {
  if (data.id) {
    return request.put<UserSaveResponse, UserSaveResponse>(API.UPDATE_BY_ID_URL, {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password || undefined,
    })
  }
  return request.post<UserSaveResponse, UserSaveResponse>(API.ADD_USER_URL, data)
}

export const reqDeleteUser = (id: number) =>
  request.delete<BaseResponse<null>>(API.DELETE_USER_URL, {
    params: {
      id,
    },
  })

/** 无返回体，成功时 data 为 null */
export const reqUpdateUserStatus = (data: UpdateUserStatus) =>
  request.put<BaseResponse<null>, BaseResponse<null>>(API.UPDATE_STATUS_URL, data)

export const reqGetRoleList = (userId: number) =>
  request.get<RoleListResp, RoleListResp>(API.GET_ROLE_LIST_URL + `/${userId}`)

export const reqAssignRole = (data: { userId: number; roleId: number[] }) =>
  request.post<BaseResponse<null>, BaseResponse<null>>(API.ASSIGN_ROLE_URL, data)
