import request from '@/utils/request'
import type {
  DeleteLabResponse,
  LabDetailResponse,
  LabListQuery,
  LabListResponse,
  LabSaveResponse,
  SaveLab,
  LabUserResponse,
} from './type'

enum API {
  CREATE_URL = '/lab/create',
  LIST_URL = '/lab/list',
  UPDATE_URL = '/lab/update',
  // labId 走路径参数。注意跟 /user/delete 不一样，那个是从 query 传 id 的
  DELETE_URL = '/lab/delete',
  GET_URL = '/lab/get',
  Get_User_URL = '/lab/all/manager',
}

export const reqGetLabList = (query: LabListQuery) =>
  request.get<LabListResponse, LabListResponse>(API.LIST_URL, { params: query })

export const reqGetLabDetail = (labId: number) =>
  request.get<LabDetailResponse, LabDetailResponse>(`${API.GET_URL}/${labId}`)

/**
 * 新增 / 编辑共用一个入口：带了 id 调 PUT /lab/update，没带调 POST /lab/create。
 *
 * update 那边是部分更新（后端 `exclude_unset` + `exclude_none`），只提交要改的字段就行；
 * 但 name / building / floor / area 在模型里是必填，「有没有传」判断不了，所以每次都会被覆盖，
 * 编辑时必须原样带回去。
 */
export const reqSaveLab = (data: SaveLab) =>
  data.id
    ? request.put<LabSaveResponse, LabSaveResponse>(API.UPDATE_URL, data)
    : request.post<LabSaveResponse, LabSaveResponse>(API.CREATE_URL, data)

/** 删除实验室。labId 不存在时后端回 LAB_NOT_EXIST(250) */
export const reqDeleteLab = (labId: number) =>
  request.delete<DeleteLabResponse, DeleteLabResponse>(`${API.DELETE_URL}/${labId}`)

export const reqGetLabUser = () => request.get<LabUserResponse, LabUserResponse>(API.Get_User_URL)
