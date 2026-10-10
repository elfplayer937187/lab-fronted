import request from '@/utils/request'
import type { UpdateUser, UpdateUserResponse } from './type'

enum API {
  UPDATE_URL = '/user/update',
}

export const reqUpdateUser = (data: UpdateUser) =>
  request.put<UpdateUserResponse, UpdateUserResponse>(API.UPDATE_URL, data)
