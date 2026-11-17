import type { BaseResponse, PageResult } from '@/apis/common'

/** 状态：0-禁用，1-启用 */
export type LabStatus = 0 | 1

/**
 * 实验室实体，字段对着后端的 `GetLabListResponse`（也就是 `CreateLabRequest` 加个 id）。
 */
export interface LabInfo {
  id: number
  /** 实验室名。后端列宽 String(10)，而且是唯一键，重名会 451 */
  name: string
  description?: string | null
  /** 容量 */
  capacity?: number | null
  /**
   * 图片。跟用户头像一样存的是**站内相对路径**（形如 `/uploads/xxx.png`），
   * 后端列宽 String(70)，别拼主机名
   */
  image?: string | null
  /** 开放时间。后端列就是 String(40)，不是 datetime，别当成日期对象用 */
  open_time?: string | null
  close_time?: string | null
  manager_id: number
  status?: LabStatus | null
  /** 楼层号 */
  building: number
  floor: number
  /** 占地面积（平方米） */
  area: number
}

/**
 * 新增 / 编辑实验室共用的请求体，带 id 走 PUT /lab/update，不带走 POST /lab/create。
 *
 * building / floor / area 是必填的 —— 后端这三个字段没给默认值，编辑时也得原样带回去，
 * 少了会 422。
 */
export interface SaveLab {
  id?: number
  name: string
  description?: string | null
  capacity?: number | null
  image?: string | null
  open_time?: string | null
  close_time?: string | null
  manager_id?: number
  status?: LabStatus | null
  building: number
  floor: number
  area: number
}

/**
 * `/lab/list` 的查询参数。
 *
 * 注意后端的字段名是 `pageSize` 和 `nameKeyword`（驼峰），不是下划线。
 * building / floor / area 是**精确匹配**，不传就不参与筛选，不能当范围查。
 */
export interface LabListQuery {
  page: number
  pageSize: number
  nameKeyword?: string
  building?: number
  floor?: number
  manage_id?: number
}

/** 列表：跟角色列表同一套分页外壳，data 可能为 null，取用前判空 */
export type LabListResponse = BaseResponse<PageResult<LabInfo>>
/** 详情 /lab/get/{labId} */
export type LabDetailResponse = BaseResponse<LabInfo>
/** 新增、更新、删除都没有返回体，成功时 data 为 null */
export type LabSaveResponse = BaseResponse<null>
export type DeleteLabResponse = BaseResponse<null>
export type LabUserResponse = BaseResponse<{ id: number; username: string }[]>

/**
 * 设备类型，字段对着后端的 `GetDeviceTypeResponse`。
 * 主键是 `type_id`，不是 id；type_name / type_code 都是唯一键。
 */
export interface DeviceTypeInfo {
  type_id: number
  /** 类型名称，后端列宽 String(30) */
  type_name: string
  type_desc?: string | null
  /** 类型编号，后端列宽 String(30) */
  type_code: string
  status: LabStatus
}

/** `/lab_device_type/list` 的查询参数。`status` 不传才是不筛选，0 是合法值 */
export interface DeviceTypeListQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: LabStatus
}

/**
 * 新增 / 编辑设备类型共用的请求体，带 type_id 走 PUT /update，不带走 POST /create。
 *
 * 注意 update 是**全量覆盖**（后端 `model_dump()` 不看字段是否传过），
 * 编辑时所有字段都要原样带回去。
 */
export interface SaveDeviceType {
  type_id?: number
  type_name: string
  type_code: string
  type_desc?: string | null
  status: LabStatus
}

export type DeviceTypeListResponse = BaseResponse<PageResult<DeviceTypeInfo>>
export type DeviceTypeDetailResponse = BaseResponse<DeviceTypeInfo>

/**
 * 实验室设备资料，字段对着后端的 `GetLabDeviceResponse`。
 * 主键是 `lab_device_id`，不是 id。
 */
export interface LabDeviceInfo {
  lab_device_id: number
  /** 设备名称，后端列宽 String(30) */
  device_name: string
  /** 设备编号，唯一键，后端列宽 String(30) */
  device_code: string
  /** 设备品牌，后端列宽 String(30) */
  brand: string
  type_id: number
  description?: string | null
  status: LabStatus
  /**
   * 实际可用：设备启用且所属类型启用才为 1。
   * 后端根据 `status` 和类型状态算出来的只读字段，不能拿来提交。
   */
  effective_type: LabStatus
}

/** `/lab_device/list` 的查询参数。type_id / status 不传才是不筛选 */
export interface LabDeviceListQuery {
  page: number
  pageSize: number
  keyword?: string
  type_id?: number
  status?: LabStatus
}

/**
 * 新增 / 编辑设备资料共用的请求体，带 lab_device_id 走 PUT /update，不带走 POST /create。
 * 同样是全量覆盖：编辑时漏传 status 会被默认值 1 写回。
 */
export interface SaveLabDevice {
  lab_device_id?: number
  device_name: string
  device_code: string
  brand: string
  type_id: number
  description?: string | null
  status: LabStatus
}

export type LabDeviceListResponse = BaseResponse<PageResult<LabDeviceInfo>>
export type LabDeviceDetailResponse = BaseResponse<LabDeviceInfo>
