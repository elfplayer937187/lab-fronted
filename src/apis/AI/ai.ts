import request from '@/utils/request'
import type {
  ChatRequest,
  ChatResponse,
  DeleteThreadResponse,
  ThreadListResponse,
  ThreadMessagesResponse,
} from './type'

enum API {
  CHAT_URL = '/ai/v1/chat',
  THREAD_LIST_URL = '/ai/v1/messages/all',
  // 历史消息是 /messages/one/{id}。不能写成 /messages/{id}：后端按声明顺序匹配，
  // 那样会把 /messages/all 里的 "all" 当成 id 吃掉
  THREAD_MESSAGES_URL = '/ai/v1/messages/one',
  DELETE_URL = '/ai/v1/delete/message',
}

/**
 * 发一条消息。**非流式**，等模型全部生成完才一次性返回。
 *
 * 单独放宽到 60s：axios 实例默认 timeout 是 5s，模型生成慢一点就会直接被掐断。
 */
export const reqChat = (data: ChatRequest) =>
  request.post<ChatResponse, ChatResponse>(API.CHAT_URL, data, { timeout: 30000 })

/** 会话列表（左侧历史记录用），只返回 thread_id 和标题 */
export const reqGetThreadList = () =>
  request.get<ThreadListResponse, ThreadListResponse>(API.THREAD_LIST_URL)

// 获取会话内容
export const reqGetThreadMessages = (threadId: string | number) =>
  request.get<ThreadMessagesResponse, ThreadMessagesResponse>(
    `${API.THREAD_MESSAGES_URL}/${threadId}`,
  )

/** 删除整个会话。后端把 thread_id 声明成 integer，传字符串会 400 */
export const reqDeleteThread = (threadId: number) =>
  request.delete<DeleteThreadResponse, DeleteThreadResponse>(`${API.DELETE_URL}/${threadId}`)
