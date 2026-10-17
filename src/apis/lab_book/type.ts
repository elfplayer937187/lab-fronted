import type { BaseResponse, PageResult } from '@/apis/common'

/**
 * 预约状态：0-待审核，1-审核通过，3-已取消。
 * 2 后端注释里留空了，含义还没定，先不猜。
 */
export type LabBookStatus = 0 | 1 | 2 | 3

/**
 * 一条预约记录，对着后端 `LabBookListResponse`。
 *
 * `username` 不是表里的列，是后端 join 用户表带出来的。
 * 时间字段后端是 `time` 类型，JSON 里形如 `"09:00:00"`（带秒，不是 `"09:00"`）。
 */
export interface LabBookInfo {
  id: number
  username: string
  user_id: number
  /** 实验室 id */
  lab_id: number
  start_time: string
  end_time: string
  people_count: number
  status: LabBookStatus
  reviewer_id: number
  reviewer_remark?: string | null
}

/**
 * `/lab_book/list/accept` 的列表项，比基础版多实验室图片和实验室名称。
 * username 在这条接口上后端声明成了可空，所以得摘出来重写。
 */
export interface LabBookWaitAcceptInfo extends Omit<LabBookInfo, 'username'> {
  username?: string | null
  image?: string | null
  /** 实验室名称，后端 join Lab 带出来的，不用再拿 lab_id 单独查 */
  lab_name?: string | null
}

/**
 * 创建预约的请求体，对着后端 `CreateLabBookRequest`（`extra='forbid'`，多一个字段就 400）。
 *
 * 时间传 `"HH:MM:SS"` 或 `"HH:MM"` 都行，Pydantic 的 time 能解析；
 * 但**不能带时区偏移**（如 `"09:00+08:00"`），后端会直接拒掉。
 * 另外后端会校验 end_time > start_time，相等也不行。
 */
export interface CreateLabBookForm {
  lab_id: number
  start_time: string
  end_time: string
  people_count: number
}

/**
 * 审批预约的请求体，对着后端 `AcceptPayload`（`extra='forbid'`）。
 *
 * 注意 `LabBookId` 是**大写开头**的，跟其它接口的下划线风格不一样，
 * 照着文档写成 `lab_book_id` 会直接 400。后端也没给 `status` 默认值，必填。
 */
export interface AcceptLabBookForm {
  /** 1-审核通过，2-审核未通过。其它值后端校验不通过，回 400 */
  status: 1 | 2
  LabBookId: number
  /** 审核意见，可空 */
  remark?: string | null
}
export interface PageResultAstra extends PageResult<LabBookWaitAcceptInfo> {
  wait_accept: number
  accept: number
}
/** 创建成功时 data 为 null，只有 message 是「预约成功」 */
export type CreateLabBookResponse = BaseResponse<null>
/** `/lab_book/list/accept`：分页外壳，records 是当前页。注意 pageSize 是响应字段，请求里叫 limit */
export type LabBookWaitAcceptResponse = BaseResponse<PageResultAstra>
/** `/lab_book/list/{labId}`：data 是数组，不分页 */
export type LabBookListResponse = BaseResponse<LabBookInfo[]>
/** 审批成功时 data 为 null，只有 message 是「审批成功」 */
export type AcceptLabBookResponse = BaseResponse<null>
