import request from '@/utils/request'
import type {
  UpdateUser,
  UpdateUserResponse,
  UserListResponse,
  AddRequest,
  AddUserResponse,
  UpdateUserStatus,
} from './type'
import type { RegisterResponse } from '@/apis/auth/type'
import type { BaseResponse } from '../common'

enum API {
  UPDATE_URL = '/user/update',
  GET_USERINFO_URL = '/user/getInfo',
  // 获取用户列表
  GET_USERLIST_URL = '/user/list',
  // 新增用户
  ADD_USER_URL = '/user/create',
  // 删除用户
  DELETE_USER_URL = '/user/delete',
  // 启用 / 禁用用户
  UPDATE_STATUS_URL = '/user/updateStatus',
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

export const reqAddUser = (data: AddRequest) =>
  request.post<AddUserResponse, AddUserResponse>(API.ADD_USER_URL, data)

export const reqDeleteUser = (userId: number) =>
  request.delete<BaseResponse<null>>(API.DELETE_USER_URL, {
    params: {
      userId,
    },
  })

/** 无返回体，成功时 data 为 null */
export const reqUpdateUserStatus = (data: UpdateUserStatus) =>
  request.put<BaseResponse<null>, BaseResponse<null>>(API.UPDATE_STATUS_URL, data)
