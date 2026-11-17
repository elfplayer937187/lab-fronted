import request from '@/utils/request'
import type { DashboardDataResponse } from './type'

enum API {
  DATA_URL = '/dashboard/data',
}

/** 首页数据：三个总数 + 全系统待审批预约列表，一次请求拿全 */
export const reqGetDashboardData = () =>
  request.get<DashboardDataResponse, DashboardDataResponse>(API.DATA_URL)
