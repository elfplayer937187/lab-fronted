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

/**
 * POST /api/upload 的 data。
 *
 * `url` 是**站内相对路径**（形如 `/uploads/xxx.png`，挂在根路径下、不在 `/api` 里）。
 * 别拼主机名：存进 User.avatar 的是这个相对路径，而后端给 avatar 限长 50 字符，
 * 42 字符的相对路径刚好放得下，加上 `http://localhost:8000` 就 63 字符，直接 400。
 */
export interface UploadResult {
  /** 上传时的原始文件名 */
  origin_name: string
  /** 落盘后的文件名 */
  disk_name: string
  /** 字节数 */
  size: number
  url: string
}

export type UploadResponse = BaseResponse<UploadResult>
