<template>
  <div class="flex justify-between gap-20 mr-6">
    <el-card class="w-70 shrink-0 card-big">
      <h3 class="font-bold text-xl cursor-auto">预约概览</h3>
      <div class="menu text-sm ml-4 flex flex-col gap-2 mt-4 text-gray-600">
        <div class="">待审核：{{ waitAccept }}</div>
        <div class="">已通过：{{ accept }}</div>
        <div class="">全部：{{ total }}</div>
      </div>
      <h2 class="text-lg mt-4">筛选</h2>
      <div class="select-bottom"></div>
    </el-card>
    <div class="right-box flex-1">
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
import { onMounted, ref } from 'vue'

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
    console.log(res)

    formData.value = res.data?.records || []
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
/* 全局 reset 把 td 的 vertical-align 从默认 middle 改成了 baseline，
   多行高时 label 会贴到底部。这里只在详情表格里恢复垂直居中 */
.el-descriptions :deep(.el-descriptions__cell.is-bordered-label) {
  vertical-align: middle;
}
</style>
