<template>
  <div class="flex w-full h-full gap-10">
    <!-- 左侧历史记录 -->
    <div
      class="flex flex-col left-history w-[20%] min-w-10 h-[95%] bg-gray-100 dark:bg-slate-900 rounded-2xl shadow-2xl ml-10 p-5"
    >
      <div class="history-title text-center text-xl text-gray-500 dark:text-gray-400 p-4">
        历史记录
      </div>
      <div class="history-list flex-1 overflow-auto bg-white dark:bg-slate-800 px-2 rounded-2xl">
        <ul class="flex flex-col gap-1 mt-3">
          <!-- 选中态用 bg-white，未选中留透明，hover 给一点反馈。
               别加 w-full：项目没有全局 border-box，w-full + px-4 会把右侧时间挤出去 -->
          <li
            v-for="item in HistoryList"
            :key="item.thread_id"
            class="box-border px-4 py-2 mb-4 shadow-2xl rounded-xl cursor-pointer bg-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors hover:bg-gray-200"
            :class="item.thread_id === nowChat?.thread_id ? 'bg-blue-100! dark:bg-blue-900!' : ''"
            @click="() => ChangeChat(item)"
          >
            <div class="flex flex-col justify-between gap-2">
              <h4
                class="min-w-0 flex-1 truncate text-sm font-light text-gray-700 dark:text-gray-200"
                :title="item.title"
              >
                {{ item.title }}
              </h4>
              <div class="flex items-center justify-between gap-2">
                <span class="shrink-0 text-xs text-gray-400">{{
                  formatTime(item.createTime)
                }}</span>
                <!-- .stop：别让点击垃圾桶顺带触发 li 的切换会话 -->
                <el-icon class="shrink-0 cursor-pointer" @click.stop="DeleteChat(item)">
                  <Delete class="text-gray-400 hover:text-red-300" />
                </el-icon>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div
        class="your-role flex items-center mt-4 gap-3 px-2 py-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all rounded-2xl"
      >
        <!-- fit=cover + rounded-full：头像裁成圆形，和顶栏默认图保持同一套回退 -->
        <el-image
          :src="userInfo?.avatar || LoginLabel"
          fit="cover"
          class="h-10 w-10 shrink-0 rounded-full"
        />
        <span class="min-w-0 truncate text-sm text-gray-700 dark:text-gray-200">{{
          userInfo?.name
        }}</span>
      </div>
    </div>
    <!-- 右侧 内容 -->
    <div
      class="right flex-1 h-[97%] bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col gap-3 p-4"
    >
      <div
        class="flex justify-between header-title-right p-4 border-b border-black/5 dark:border-white/10 items-center"
      >
        <div class="left-title dark:text-gray-200">
          {{ nowChat?.title || '新建会话' }}
        </div>
        <div class="right-btn">
          <el-tooltip effect="light" content="新建会话" placement="bottom">
            <el-button icon="Plus" @click="CreateNewChat"></el-button>
          </el-tooltip>
        </div>
      </div>
      <!-- 聊天列表 -->
      <div class="chat-list h-[85%] w-[95%] rounded-2xl overflow-y-auto p-4">
        <!-- 换会话时整块淡出淡入。key 跟着 thread_id 变，Transition 才会认为是一个新元素；
             out-in 避免新旧两批消息同时挤在文档流里 -->
        <Transition name="chat-switch" mode="out-in">
          <!-- 里层 TransitionGroup 管单条消息：新气泡进场、删除的气泡离场 -->
          <TransitionGroup
            :key="nowChat?.thread_id ?? 'new'"
            name="chat-msg"
            tag="div"
            class="flex flex-col gap-3"
          >
            <div
              v-for="(msg, index) in nowChatMessages"
              :key="index"
              class="flex items-start gap-2"
              :class="msg.role === 'ai' ? 'flex-row-reverse' : ''"
            >
              <!-- 头像始终在气泡外侧；ai 用 flex-row-reverse 让头像落到右边 -->
              <el-avatar
                :size="32"
                :src="msg.role === 'human' ? userInfo?.avatar || LoginLabel : undefined"
                :class="msg.role === 'ai' ? 'shrink-0 bg-gray-600!' : 'shrink-0'"
              >
                <el-icon v-if="msg.role === 'ai'"><MagicStick /></el-icon>
              </el-avatar>
              <!-- 内容 -->
              <div
                v-if="msg.content"
                class="max-w-[50%] shadow-2xl px-4 py-2 rounded-2xl text-sm"
                :class="[
                  msg.role === 'human'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-400 text-gray-800 dark:bg-slate-600 dark:text-gray-100',
                ]"
                v-html="purify(msg.content)"
              ></div>
              <!-- 第一片内容还没到，先用转圈占位，避免空气泡看起来像卡住了 -->
              <div
                v-else
                class="flex items-center px-4 py-2 rounded-2xl bg-gray-400 dark:bg-slate-600"
              >
                <el-icon class="animate-spin"><Loading /></el-icon>
              </div>
            </div>
          </TransitionGroup>
        </Transition>
      </div>
      <!-- 聊天框 -->
      <div class="chat-bottom relative flex-1 w-full">
        <textarea class="text-area" v-model="myInput" @keyup.enter="HandleKeyEnter"></textarea>
        <!-- 发送按钮：绝对定位贴在输入框右下角 -->
        <div class="absolute right-3 bottom-3">
          <!-- 自己画 loading 图标，不用 el-button 的 :loading：
               它会额外塞一个 .el-icon 进去，circle 按钮里容易偏，两个图标也容易叠 -->
          <el-button type="" @click="SendMessage" :disabled="loading" circle>
            <el-icon :class="{ 'animate-spin': loading }">
              <Loading v-if="loading" />
              <Promotion v-else />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import useUserStore from '@/stores/modules/user'
import LoginLabel from '@/assets/images/Login-Label.png'
import { reqDeleteThread, reqGetThreadList, reqGetThreadMessages } from '@/apis/AI/ai'
import type { ChatMessage, ChatRequest, ThreadInfo } from '@/apis/AI/type'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from '@/utils/token'
import purify from '@/utils/PurifiedText'
// 用户头像和顶栏保持一致：有自定义头像用头像，没有就退回默认图
const { userInfo } = storeToRefs(useUserStore())
// 当前聊天线程
const nowChat = ref<ThreadInfo | null>(null)
// 当前聊天记录
const nowChatMessages = ref<ChatMessage[]>([])

const HistoryList = ref<ThreadInfo[]>([])

onMounted(() => {
  getAIHistoryList()
})
const getAIHistoryList = async () => {
  const res = await reqGetThreadList()
  if (res.code === 200) {
    HistoryList.value = res.data || []
  }
}

// createTime 形如 "2026-10-20T11:41:38"，侧栏只显示时分
const formatTime = (time: string) => (time ? time.slice(11, 16) : '')
const ChangeChat = async (chatItem: ThreadInfo) => {
  const res = await reqGetThreadMessages(chatItem.thread_id)
  if (res.code === 200) {
    // 等消息回来再一起改：Transition 的 key 跟着 nowChat 变，
    // 先改 nowChat 会在旧消息上播一遍动画，新消息再"啪"地换上来
    nowChat.value = chatItem
    nowChatMessages.value = res.data?.messages || []
  } else {
    ElMessage.error('获取聊天记录失败')
  }
}
const myInput = ref('')
const loading = ref(false)

/** 删除会话：确认后调接口，连同左侧列表和右侧当前会话一起清掉 */
const DeleteChat = async (item: ThreadInfo) => {
  try {
    await ElMessageBox.confirm(`确定删除会话「${item.title}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    // 点了取消/关闭，什么都不做
    return
  }

  try {
    const res = await reqDeleteThread(item.thread_id)
    if (res.code !== 200) {
      ElMessage.error(res.message || '删除失败')
      return
    }
    HistoryList.value = HistoryList.value.filter((t) => t.thread_id !== item.thread_id)
    // 删的正好是当前正在聊的会话，就把右侧一起清空
    if (nowChat.value?.thread_id === item.thread_id) CreateNewChat()
    ElMessage.success('删除成功')
  } catch {
    // HTTP 非 2xx 的错误提示已经被 axios 拦截器统一弹过了
  }
}

// 新建会话：只是把当前会话清空，真正的会话由第一次发送时后端创建
const CreateNewChat = () => {
  nowChat.value = null
  nowChatMessages.value = []
  myInput.value = ''
}

const SendMessage = async () => {
  const text = myInput.value.trim()
  if (!text || loading.value) {
    ElMessage.warning('请输入文本')
    return
  }

  loading.value = true
  // 先乐观插入用户消息，再放一个空的 AI 气泡，流式分片直接往里面追加
  nowChatMessages.value.push({ role: 'human', content: text })
  nowChatMessages.value.push({ role: 'ai', content: '' })
  const reply = nowChatMessages.value[nowChatMessages.value.length - 1]!
  myInput.value = ''

  try {
    await SSEOutput(
      // 新会话不传 thread_id，由后端建号并先发一个 thread_id 事件回来
      { thread_id: nowChat.value?.thread_id?.toString() ?? null, content: text },
      reply,
    )
  } catch {
    // 一个字都没吐出来就把空气泡撤掉；已经吐了一部分就保留，让用户看到断在哪里
    if (!reply.content) nowChatMessages.value.pop()
    myInput.value = text
    ElMessage.error('请求失败，请重试')
  } finally {
    loading.value = false
  }
}
const HandleKeyEnter = () => {
  if (loading.value) return
  SendMessage()
}

/** 流式接口的事件结构：thread_id → 一堆 message 分片 → done */
interface SSEChunk {
  type: 'thread_id' | 'message' | 'done'
  thread_id?: string
  message?: string
}

/**
 * 流式聊天。内容不在这里拼接完再返回，而是逐片追加到调用方传进来的 reply 上，
 * 这样页面上能实时看到文字一个个冒出来。
 */
const SSEOutput = async (payload: ChatRequest, reply: ChatMessage) => {
  const abortController = new AbortController()
  let newThreadId: string | null = null

  await fetchEventSource('/api/ai/v1/stream/chat', {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
    // 切到后台标签页时默认会主动断开，模型还在吐字就白断了
    openWhenHidden: true,
    onmessage(event) {
      if (!event.data) return
      const chunk: SSEChunk = JSON.parse(event.data)
      if (chunk.type === 'thread_id') {
        newThreadId = chunk.thread_id ?? null
      } else if (chunk.type === 'message') {
        reply.content += chunk.message ?? ''
      }
    },
    onerror(error) {
      // 抛出去让 fetchEventSource 停止重试，统一由 SendMessage 的 catch 提示
      throw error
    },
  })

  // 新会话：id 在流开头就给了，但标题要等这轮结束才生成，所以列表放在最后刷
  if (!nowChat.value && newThreadId) {
    await getAIHistoryList()
    nowChat.value = HistoryList.value.find((item) => String(item.thread_id) === newThreadId) ?? {
      thread_id: Number(newThreadId),
      title: '新会话',
      createTime: '',
    }
  }
}
</script>

<style lang="css">
.history-title {
}
/* textarea 是原生表单控件，项目里没引 Tailwind preflight，
   UA 默认的 font / resize / box-sizing / 边框都不会被清掉，所以这里显式写全。 */
.text-area {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-primary);
  font: inherit;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  resize: none;
}

.text-area:focus {
  border-color: var(--el-color-primary);
}

/* 切换会话的过渡：进场 ease-out 轻微上浮淡入，离场快一点，避免拖沓 */
.chat-switch-enter-active {
  transition:
    opacity 220ms ease-out,
    transform 220ms ease-out;
}
.chat-switch-leave-active {
  transition: opacity 120ms ease-out;
}
.chat-switch-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.chat-switch-leave-to {
  opacity: 0;
}

/* 单条消息：新气泡从下方 10px 淡入，离场更快 */
.chat-msg-enter-active {
  transition:
    opacity 260ms ease-out,
    transform 260ms ease-out;
}
.chat-msg-leave-active {
  transition: opacity 120ms ease-out;
}
.chat-msg-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.chat-msg-leave-to {
  opacity: 0;
}
.md-body {
  overflow-wrap: break-word;
}
.md-body p {
  margin: 0.5em 0;
}
.md-body ul {
  list-style: disc;
  padding-left: 1.25em;
  margin: 0.5em 0;
}
.md-body ol {
  list-style: decimal;
  padding-left: 1.25em;
  margin: 0.5em 0;
}
.md-body h1,
.md-body h2,
.md-body h3 {
  font-weight: 600;
  margin: 0.8em 0 0.4em;
}
.md-body code {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.9em;
}
.md-body pre {
  background: #1e1e1e;
  color: #eee;
  padding: 10px 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.5em 0;
}
.md-body pre code {
  background: none;
  padding: 0;
}
.md-body blockquote {
  border-left: 3px solid #ccc;
  padding-left: 10px;
  color: #666;
  margin: 0.5em 0;
}
.md-body a {
  color: #2563eb;
  text-decoration: underline;
}

/* 深色模式：气泡底色变深，行内代码、引用、链接要跟着提亮，不然看不清 */
html.dark .md-body code {
  background: rgba(255, 255, 255, 0.15);
}
html.dark .md-body blockquote {
  border-left-color: #64748b;
  color: #cbd5e1;
}
html.dark .md-body a {
  color: #93c5fd;
}
</style>
