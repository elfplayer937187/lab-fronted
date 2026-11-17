import request from '@/utils/request'
import type { BaseResponse } from '../common'
import type {
  DeviceTypeDetailResponse,
  DeviceTypeListQuery,
  DeviceTypeListResponse,
  LabStatus,
  SaveDeviceType,
} from './type'

enum API {
  CREATE_URL = '/lab_device_type/create',
  LIST_URL = '/lab_device_type/list',
  UPDATE_URL = '/lab_device_type/update',
  UPDATE_STATUS_URL = '/lab_device_type/updateStatus',
  // typeId 走路径参数
  DELETE_URL = '/lab_device_type/delete',
  GET_URL = '/lab_device_type/get',
}

export const reqGetDeviceTypeList = (query: DeviceTypeListQuery) =>
  request.get<DeviceTypeListResponse, DeviceTypeListResponse>(API.LIST_URL, { params: query })

export const reqGetDeviceTypeDetail = (typeId: number) =>
  request.get<DeviceTypeDetailResponse, DeviceTypeDetailResponse>(`${API.GET_URL}/${typeId}`)

/**
 * 新增 / 编辑共用一个入口：带了 type_id 调 PUT /update，没带调 POST /create。
 *
 * update 是全量覆盖，所以编辑时所有字段都要原样带回去；
 * 漏传 type_desc 会被写成 null，漏传 status 会被默认值 1 写回。
 */
export const reqSaveDeviceType = (data: SaveDeviceType) =>
  data.type_id
    ? request.put<BaseResponse<null>, BaseResponse<null>>(API.UPDATE_URL, data)
    : request.post<BaseResponse<null>, BaseResponse<null>>(API.CREATE_URL, data)

/** 启用 / 禁用。接口收的是「改成什么状态」，不是「切一下」 */
export const reqUpdateDeviceTypeStatus = (data: { type_id: number; status: LabStatus }) =>
  request.put<BaseResponse<null>, BaseResponse<null>>(API.UPDATE_STATUS_URL, data)

/** 删除设备类型。类型下还有设备时后端回 257 */
export const reqDeleteDeviceType = (typeId: number) =>
  request.delete<BaseResponse<null>, BaseResponse<null>>(`${API.DELETE_URL}/${typeId}`)
