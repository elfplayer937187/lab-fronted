import request from '@/utils/request'
import type {
  AcceptLabBookForm,
  AcceptLabBookResponse,
  CreateLabBookForm,
  CreateLabBookResponse,
  LabBookListResponse,
  LabBookWaitAcceptResponse,
} from './type'

enum API {
  CREATE_URL = '/lab_book/create',
  WAIT_ACCEPT_LIST_URL = '/lab_book/list/accept',
  // 这里拼的是实验室 id，不是预约记录 id
  LIST_BY_LAB_URL = '/lab_book/list',
  ACCEPT_URL = '/lab_book/accept',
}

/**
 * 创建预约。
 *
 * 失败时后端会用业务码区分原因：250 实验室不存在、261 时间段冲突（HTTP 状态分别是
 * 450 / 452，别拿 HTTP 码判断）。参数错误是 400。
 */
export const reqCreateLabBook = (data: CreateLabBookForm) =>
  request.post<CreateLabBookResponse, CreateLabBookResponse>(API.CREATE_URL, data)

/**
 * 「等待审批」列表，分页。
 *
 * 后端按 `reviewer_id == 当前登录用户` 过滤，也就是「指派给我审核的记录」。
 * 但它**没有按 status 筛待审核**，已审核完的也会一起返回（按 status 倒序排在后面），
 * 所以要拿真正的「待审核」还得前端自己筛 `status === 0`。
 *
 * page / limit 都是必填，少传一个后端直接 422。
 */
export const reqGetLabBookWaitAcceptList = (page: number, limit: number) =>
  request.get<LabBookWaitAcceptResponse, LabBookWaitAcceptResponse>(API.WAIT_ACCEPT_LIST_URL, {
    params: { page, limit },
  })

/** 查某个实验室下的全部预约记录，同样不分页、不按状态筛 */
export const reqGetLabBookListByLab = (labId: number) =>
  request.get<LabBookListResponse, LabBookListResponse>(`${API.LIST_BY_LAB_URL}/${labId}`)

/**
 * 审批预约：同意传 status=1，拒绝传 status=2，可附审核意见。
 *
 * 后端会校验这条预约的 `reviewer_id` 是不是当前登录用户，不是（或记录不存在）
 * 都回 254「预约不存在」—— 这两种情况它没区分，所以前端只能提示「预约不存在或无权限」。
 */
export const reqAcceptLabBook = (data: AcceptLabBookForm) =>
  request.post<AcceptLabBookResponse, AcceptLabBookResponse>(API.ACCEPT_URL, data)
