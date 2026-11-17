import request from '@/utils/request'
import type { BaseResponse } from '../common'
import type {
  LabDeviceDetailResponse,
  LabDeviceListQuery,
  LabDeviceListResponse,
  LabStatus,
  SaveLabDevice,
} from './type'

enum API {
  CREATE_URL = '/lab_device/create',
  LIST_URL = '/lab_device/list',
  UPDATE_URL = '/lab_device/update',
  UPDATE_STATUS_URL = '/lab_device/updateStatus',
  // deviceId 走路径参数
  DELETE_URL = '/lab_device/delete',
  GET_URL = '/lab_device/get',
}

export const reqGetLabDeviceList = (query: LabDeviceListQuery) =>
  request.get<LabDeviceListResponse, LabDeviceListResponse>(API.LIST_URL, { params: query })

export const reqGetLabDeviceDetail = (deviceId: number) =>
  request.get<LabDeviceDetailResponse, LabDeviceDetailResponse>(`${API.GET_URL}/${deviceId}`)

/**
 * 新增 / 编辑共用一个入口：带了 lab_device_id 调 PUT /update，没带调 POST /create。
 *
 * update 是全量覆盖，编辑时所有字段都要原样带回去，漏传 status 会被默认值 1 写回。
 */
export const reqSaveLabDevice = (data: SaveLabDevice) =>
  data.lab_device_id
    ? request.put<BaseResponse<null>, BaseResponse<null>>(API.UPDATE_URL, data)
    : request.post<BaseResponse<null>, BaseResponse<null>>(API.CREATE_URL, data)

/** 启用 / 禁用。接口收的是「改成什么状态」，不是「切一下」 */
export const reqUpdateLabDeviceStatus = (data: { lab_device_id: number; status: LabStatus }) =>
  request.put<BaseResponse<null>, BaseResponse<null>>(API.UPDATE_STATUS_URL, data)

/** 删除设备。设备被实验室库存引用时后端回 260 */
export const reqDeleteLabDevice = (deviceId: number) =>
  request.delete<BaseResponse<null>, BaseResponse<null>>(`${API.DELETE_URL}/${deviceId}`)
