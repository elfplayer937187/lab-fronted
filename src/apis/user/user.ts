import request from '@/utils/request'
import type {
  UpdateUser,
  UpdateUserResponse,
  UserListResponse,
  AddRequest,
  AddUserResponse,
} from './type'
import type { RegisterResponse } from '@/apis/auth/type'

enum API {
  UPDATE_URL = '/user/update',
  GET_USERINFO_URL = '/user/getInfo',
  // 获取用户列表
  GET_USERLIST_URL = '/user/list',
  // 新增用户
  ADD_USER_URL = '/user/create',
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
