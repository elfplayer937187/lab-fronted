<template>
  <div class="flex justify-between gap-6 mr-6">
    <el-card class="w-70 shrink-0 self-start left-card card-big">
      <h3 class="text-base font-bold text-gray-800">预约概览</h3>
      <div class="mt-3 flex flex-col gap-1.5">
        <div class="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2">
          <span class="text-sm text-gray-600">待审核</span>
          <span class="text-lg font-semibold leading-none text-amber-600">{{ waitAccept }}</span>
        </div>
        <div class="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2">
          <span class="text-sm text-gray-600">已通过</span>
          <span class="text-lg font-semibold leading-none text-emerald-600">{{ accept }}</span>
        </div>
        <div class="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
          <span class="text-sm text-gray-600">全部</span>
          <span class="text-lg font-semibold leading-none text-gray-700">{{ total }}</span>
        </div>
      </div>

      <h3 class="mt-6 text-base font-bold text-gray-800">筛选</h3>
      <div class="select-bottom mt-2">
        <el-radio-group v-model="selectStatus" class="flex flex-col gap-1">
          <el-radio value="all">全部</el-radio>
          <el-radio :value="0">待审核</el-radio>
          <el-radio :value="1">已通过</el-radio>
        </el-radio-group>
      </div>
    </el-card>
    <div class="right-box flex-1" v-if="formData.length > 0">
      <el-card class="card-big" v-for="book in formData" :key="book.id" @click="openDetail(book)">
        <img :src="book.image ?? ``" class="ml-3 h-30 w-30 rounded-lg" />
        <div class="">
          <div class="right flex flex-col justify-center gap-4">
            <div class="title font-bold text-xl">
              {{ book.lab_name }}
              <el-tag class="ml-9" :type="getStatusType(book.status)">{{
                getTag(book.status) ?? '未知'
              }}</el-tag>
            </div>
            <div class="bottom">
              <div class="box flex flex-col gap-2 w-80 mx-auto">
                <span class="text-sm text-gray-500">开始时间: {{ book.start_time }}</span>
                <span class="text-sm text-gray-500">申请人: {{ book.username }}</span>
                <div class="text-sm text-gray-500 flex gap-1">
                  <span class="shrink-0">审批人评语:</span>
                  <span class="min-w-0 flex-1 truncate text-gray-700">{{
                    book.reviewer_remark ?? '无'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      <el-pagination
        v-if="formData.length > 0"
        class="mt-4"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[3, 5, 7, 10, 20, 50]"
        layout="total, sizes, prev, pager,->, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>
    <el-card class="card-big flex-1" v-else>
      <div class="text-gray-500">暂无数据</div>
    </el-card>
    <!-- 详情弹窗。行数据来自 /lab_book/list/accept，字段够用，不再单独请求 -->
    <el-dialog v-model="detailVisible" title="预约详情" width="640px">
      <el-descriptions v-if="detailRow" :column="2" border>
        <el-descriptions-item label="实验室">{{ detailRow.lab_name ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailRow.username ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ detailRow.start_time }} - {{ detailRow.end_time }}
        </el-descriptions-item>
        <el-descriptions-item label="预约人数">{{ detailRow.people_count }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailRow.status)">{{ getTag(detailRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批人 id">{{ detailRow.reviewer_id }}</el-descriptions-item>
        <el-descriptions-item label="审批人评语" :span="2">
          {{ detailRow.reviewer_remark ?? '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="实验室图片" :span="2" align="center" label-align="center">
          <el-image v-if="detailRow.image" :src="detailRow.image" fit="cover" class="h-32 w-32" />
          <span v-else>—</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-input v-model="remark" placeholder="请输入批注" clearable></el-input>
          <el-button type="danger" plain @click="handleReview(2)">拒绝</el-button>
          <el-button type="success" @click="handleReview(1)">同意</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reqAcceptLabBook, reqGetLabBookWaitAcceptList } from '@/apis/lab_book/lab_book'
import type { LabBookWaitAcceptInfo } from '@/apis/lab_book/type'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'

const formData = ref<LabBookWaitAcceptInfo[]>([])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const accept = ref(0)
const waitAccept = ref(0)
// 详情弹窗。存的是列表里那条对象本身（不是拷贝），所以下面改 status 会直接反映到卡片上
const detailVisible = ref(false)
const detailRow = ref<LabBookWaitAcceptInfo | null>(null)
const remark = ref<string>('')

// 筛选状态
const selectStatus = ref<'all' | 0 | 1>('all')
watch(selectStatus, () => {
  getLabBookListAccept()
})
const openDetail = (book: LabBookWaitAcceptInfo) => {
  detailRow.value = book
  detailVisible.value = true
}

/**
 * 同意 / 拒绝。后端还没有审批接口，这里只改本地状态：
 * 1-审核通过，2-审核未通过。刷新页面就没了。
 */
const handleReview = async (status: 1 | 2) => {
  const res = await reqAcceptLabBook({
    status,
    LabBookId: detailRow.value!.id,
    remark: remark.value,
  })
  if (res.code === 200) {
    ElMessage.success('操作成功')
    detailVisible.value = false
    remark.value = ''
    getLabBookListAccept()
  }
}
const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'info'
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
  }
}
const getTag = (status: number) => {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '审核通过'
    case 2:
      return '审核未通过'
    case 3:
      return '已取消'
    default:
      return '未知'
  }
}
const getLabBookListAccept = async () => {
  const res = await reqGetLabBookWaitAcceptList(currentPage.value, pageSize.value)
  if (res.code === 200) {
    if (selectStatus.value === 'all') {
      formData.value = res.data?.records || []
    } else {
      formData.value = res.data?.records.filter((item) => item.status === selectStatus.value) || []
    }
    total.value = res.data?.total || 0
    accept.value = res.data?.accept ?? 0
    waitAccept.value = res.data?.wait_accept ?? 0
  }
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  getLabBookListAccept()
}

// 改每页条数必须退回第一页：否则原来在第 5 页，改成每页 200 条后会请求一个不存在的页码，
// 拿回来是空列表，看着像数据没了
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getLabBookListAccept()
}

onMounted(() => {
  getLabBookListAccept()
})
</script>

<style scoped lang="css">
.right-box .el-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 20%;
  overflow: hidden;
}
.el-image :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
}
/* EP 的 .el-radio-group 带 align-items:center，且是不带 @layer 的普通 CSS，会盖过
   Tailwind 的 items-start。竖向排列时这个 center 会把每个选项各自水平居中，
   表现成「全部」比「待审核」靠右。用作用域选择器提高优先级覆盖掉 */
.select-bottom :deep(.el-radio-group) {
  align-items: flex-start;
}

/* 全局 reset 把 td 的 vertical-align 从默认 middle 改成了 baseline，
   多行高时 label 会贴到底部。这里只在详情表格里恢复垂直居中 */
.el-descriptions :deep(.el-descriptions__cell.is-bordered-label) {
  vertical-align: middle;
}
/* 左栏是筛选面板，不是可点的卡片：高度贴合内容（配合 self-start），
   内边距用正常值，别用 space-between 把两块内容推到卡片两端 */
.left-card :deep(.el-card__body) {
  padding: 1.25rem;
}
</style>
