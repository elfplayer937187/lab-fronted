<template>
  <div class="flex flex-col gap-5">
    <!-- 欢迎条 -->
    <el-card>
      <div class="flex flex-wrap items-center justify-between gap-4 p-4">
        <div class="flex flex-col gap-4">
          <div class="text-2xl font-semibold">{{ helloText }}，{{ userInfo?.username || '' }}</div>
          <div class="mt-1 text-sm text-gray-500">{{ dateText }}</div>
        </div>
        <el-avatar :src="userInfo?.avatar || LoginLabel" :size="90" class="shrink-0" />
      </div>
    </el-card>

    <!-- 数据概览：静态占位，接接口时换成对应 list 的 total -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <el-card v-for="item in stats" :key="item.label">
        <div class="flex items-center justify-between px-5">
          <div>
            <div class="text-sm text-gray-500">{{ item.label }}</div>
            <div class="mt-2 text-3xl font-semibold leading-none">{{ item.value }}</div>
          </div>
          <div class="rounded-full bg-gray-50 p-3">
            <el-icon :class="['text-2xl', item.color]">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 待办 + 快捷入口 -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <el-card class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">待审批预约</span>
            <el-button link type="primary" @click="goLabBook">查看全部</el-button>
          </div>
        </template>
        <el-table :data="pendingBooks" style="width: 100%">
          <el-table-column prop="lab_name" label="实验室" min-width="150" />
          <el-table-column prop="username" label="申请人" width="100" />
          <el-table-column label="时间段" min-width="150">
            <template #default="{ row }">{{ row.start_time }} - {{ row.end_time }}</template>
          </el-table-column>
          <el-table-column prop="people_count" label="人数" width="70" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 0 ? 'warning' : 'success'" disable-transitions>
                {{ row.status === 0 ? '待审核' : '已通过' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default>
              <el-button link type="primary" @click="goLabBook">去审批</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card>
        <template #header>
          <span class="font-semibold">快捷入口</span>
        </template>
        <div class="flex flex-col gap-2">
          <button
            v-for="item in shortcuts"
            :key="item.name"
            type="button"
            class="flex w-full items-center gap-2 rounded-md border border-gray-200 px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            @click="router.push({ name: item.name })"
          >
            <el-icon class="text-base"><component :is="item.icon" /></el-icon>
            {{ item.label }}
          </button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LoginLabel from '@/assets/images/Login-Label.png'
import { reqGetDashboardData } from '@/apis/dashboard/dashboard'
import type { DashboardData } from '@/apis/dashboard/type'
import { PERM } from '@/constants/permissions'
import UserStore from '@/stores/modules/user'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const userStore = UserStore()
const userInfo = userStore.userInfo
const { hasPermission } = userStore
const router = useRouter()

const goLabBook = () => router.push({ name: 'labbook' })
// 获取现在时间
const hour = ref(new Date().getHours())
const helloText = computed(() => {
  if (hour.value >= 6 && hour.value <= 11) {
    return '上午好'
  } else if (hour.value > 11 && hour.value <= 14) {
    return '中午好'
  } else if (hour.value > 14 && hour.value <= 18) {
    return '下午好'
  } else {
    return '晚上好'
  }
})

// 日期进页面时算一次，格式如「2026年11月17日 星期二」
const dateText = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})
  .format(new Date())
  .replace('星期', ' 星期')

const dashboardData = ref<DashboardData | null>(null)

const getDashboardData = async () => {
  try {
    const res = await reqGetDashboardData()
    if (res.code === 200) {
      dashboardData.value = res.data
    }
  } catch {
    // 错误提示由 request 的响应拦截器统一弹出
  }
}

onMounted(() => {
  getDashboardData()
})

// 后端 time 序列化成 "09:00:00"，首页只展示到分钟
const formatTime = (value: string) => value.slice(0, 5)

const stats = computed(() => [
  {
    label: '实验室',
    value: dashboardData.value?.LabClassTotalCount ?? '—',
    icon: 'OfficeBuilding',
    color: 'text-blue-500',
  },
  {
    label: '设备',
    value: dashboardData.value?.LabDeviceTotalCount ?? '—',
    icon: 'Monitor',
    color: 'text-emerald-500',
  },
  {
    label: '待审批',
    value: dashboardData.value?.ShouldAcceptTotalCount ?? '—',
    icon: 'Bell',
    color: 'text-amber-500',
  },
])

interface PendingBook {
  id: number
  lab_name: string
  username: string
  start_time: string
  end_time: string
  people_count: number
  status: number
}

// 后端一次性返回全部待审批记录，首页只展示最新的 5 条
const pendingBooks = computed<PendingBook[]>(() =>
  (dashboardData.value?.ShouldAcceptList ?? []).slice(0, 5).map((item) => ({
    id: item.LabBookId,
    lab_name: item.LabName,
    username: item.Username,
    start_time: formatTime(item.StartTime),
    end_time: formatTime(item.EndTime),
    people_count: item.PeopleCount,
    status: item.Status,
  })),
)

// 快捷入口按权限过滤，没权限的入口不显示（点进去也会被路由守卫拦回来）
const shortcuts = computed(() =>
  [
    { label: '实验室管理', name: 'Laboratory', icon: 'OfficeBuilding', perm: PERM.labList },
    { label: '设备类型管理', name: 'labdevicetype', icon: 'Collection', perm: PERM.labdeviceList },
    { label: '设备资料管理', name: 'labdevice', icon: 'Monitor', perm: PERM.labdeviceList },
    { label: '预约管理', name: 'labbook', icon: 'Calendar', perm: PERM.labbookList },
    { label: 'AI 小助手', name: 'ai', icon: 'ChatDotRound', perm: PERM.aiChat },
  ].filter((item) => hasPermission(item.perm)),
)
</script>

<style scoped lang="css"></style>
