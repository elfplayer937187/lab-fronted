export interface BaseResponse<T> {
  code: number
  data: T | null
  message: string | null
}

/** 分页列表接口的公共 data：records 是当前页数据，其余为分页元信息（字段名跟随后端，是下划线） */
export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}
