import type { BaseResponse } from '@/apis/common'

/** 会话里一条消息的角色：human = 用户，ai = 助手 */
export type ChatRole = 'human' | 'ai'

export interface ChatMessage {
  role: ChatRole
  content: string
}

/** POST /ai/v1/chat 的请求体。thread_id 首次不传（或传 null），由后端建会话 */
export interface ChatRequest {
  thread_id?: string | null
  /** 只传当前这一条，历史由后端的 checkpointer 维护 */
  content: string
}

export interface ChatData {
  /** 会话 id。这里是 **string**，而 /messages/all 返回的同名字段是 number，别混用 */
  thread_id: string
  /** 回复内容，是 markdown 源码（`**粗体**`、`- 列表`），渲染前要过 markdown 解析 */
  content: string
}
export type ChatResponse = BaseResponse<ChatData>

/** GET /ai/v1/messages/all 的 data 项 */
export interface ThreadInfo {
  thread_id: number
  title: string
  createTime: string
}
export type ThreadListResponse = BaseResponse<ThreadInfo[]>

/** GET /ai/v1/messages/one/{thread_id} 的 data */
export interface ThreadMessagesData {
  thread_id: string
  messages: ChatMessage[]
}
export type ThreadMessagesResponse = BaseResponse<ThreadMessagesData>

/** DELETE /ai/v1/delete/message/{thread_id}：成功时 data 为 null，会话不存在回 code=240 */
export type DeleteThreadResponse = BaseResponse<null>
