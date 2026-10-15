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
