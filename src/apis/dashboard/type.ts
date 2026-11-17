import type { BaseResponse } from '@/apis/common'

/**
 * dashboard 待审批预约项。
 *
 * 字段是后端原样的 PascalCase，跟项目其它接口的下划线风格不一样，别顺手改成 snake_case。
 */
export interface DashboardShouldAcceptItem {
  LabBookId: number
  LabName: string
  Username: string
  /** time 序列化后的 "HH:MM:SS" */
  StartTime: string
  EndTime: string
  PeopleCount: number
  Status: number
}

/** `GET /dashboard/data` 的 data */
export interface DashboardData {
  /** 实验室总数 */
  LabClassTotalCount: number
  /** 设备总数 */
  LabDeviceTotalCount: number
  /** 待审批预约总数（全系统，不按 reviewer_id 过滤） */
  ShouldAcceptTotalCount: number
  /** 待审批预约列表（同样不按 reviewer_id 过滤） */
  ShouldAcceptList: DashboardShouldAcceptItem[]
}

export type DashboardDataResponse = BaseResponse<DashboardData>
