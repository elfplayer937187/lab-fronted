<template>
  <div class="">
    <DynamicTable
      :InputData="InputData"
      @submitForm="(v) => getTypeList(v as DeviceTypeSearchForm)"
    ></DynamicTable>
    <el-card class="mt-4">
      <el-button type="primary" class="btn-green mb-4" @click="openCreateDialog"
        >新增设备类型</el-button
      >
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column label="id" width="80" align="center">
          <template #default="{ row }">{{ row.type_id }}</template>
        </el-table-column>
        <el-table-column label="类型名称" min-width="140">
          <template #default="{ row }">{{ row.type_name }}</template>
        </el-table-column>
        <el-table-column label="类型编号" min-width="140">
          <template #default="{ row }">{{ row.type_code }}</template>
        </el-table-column>
        <el-table-column label="描述" min-width="180">
          <template #default="{ row }">{{ row.type_desc || '—' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" disable-transitions>
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              type="info"
              plain
              size="small"
              icon="View"
              @click="openDetail(row as DeviceTypeInfo)"
            ></el-button>
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              plain
              size="small"
              :loading="statusLoadingId === row.type_id"
              :disabled="statusLoadingId !== null"
              @click="handleUpdateStatus(row as DeviceTypeInfo)"
              >{{ row.status === 1 ? '禁用' : '启用' }}</el-button
            >
            <el-button
              type="warning"
              plain
              size="small"
              icon="Edit"
              @click="openEditDialog(row as DeviceTypeInfo)"
            ></el-button>
            <el-button
              type="danger"
              plain
              size="small"
              icon="Delete"
              @click="handleDelete(row as DeviceTypeInfo)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt-4"
        v-model:current-page="currentPage"
        v-model:page-size="limit"
        :page-sizes="[3, 5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @change="() => getTypeList()"
      ></el-pagination>
    </el-card>
    <!-- 列表已经返回完整对象，详情直接拿行数据渲染，不再调 /lab_device_type/get -->
    <el-dialog v-model="detailVisible" title="设备类型详情" width="600px">
      <el-descriptions v-if="detailRow" :column="2" border>
        <el-descriptions-item label="id">{{ detailRow.type_id }}</el-descriptions-item>
        <el-descriptions-item label="类型名称">{{ detailRow.type_name }}</el-descriptions-item>
        <el-descriptions-item label="类型编号">{{ detailRow.type_code }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailRow.status === 1 ? 'success' : 'info'" disable-transitions>
            {{ detailRow.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ detailRow.type_desc || '—' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 新增 / 编辑共用一个弹窗，靠 type_id 区分走哪个接口；update 是全量覆盖，
         所以编辑时每个字段都要回填并提交 -->
    <el-dialog
      v-model="editVisible"
      :title="editForm.type_id ? '修改设备类型' : '新增设备类型'"
      width="560px"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="类型名称" prop="type_name">
          <el-input v-model="editForm.type_name" :maxlength="30" placeholder="最长 30 字" />
        </el-form-item>
        <el-form-item label="类型编号" prop="type_code">
          <el-input v-model="editForm.type_code" :maxlength="30" placeholder="唯一，最长 30 字" />
        </el-form-item>
        <el-form-item label="描述" prop="type_desc">
          <el-input
            v-model="editForm.type_desc"
            type="textarea"
            :rows="3"
            :maxlength="100"
            placeholder="可留空"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="editForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="confirmEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  reqDeleteDeviceType,
  reqGetDeviceTypeList,
  reqSaveDeviceType,
  reqUpdateDeviceTypeStatus,
} from '@/apis/Lab/deviceType'
import type { DeviceTypeInfo, LabStatus } from '@/apis/Lab/type'
import DynamicTable from '@/components/DynamicSearchForm.vue'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import 'element-plus/theme-chalk/el-message-box.css'
import { onMounted, reactive, ref } from 'vue'

const tableData = ref<DeviceTypeInfo[]>([])
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
const statusLoadingId = ref<number | null>(null)

const InputData = [
  {
    component: 'el-input',
    data: {
      label: '关键字',
      prop: 'keyword',
      placeholder: '类型名称 / 编号',
    },
  },
  {
    component: 'el-select',
    data: {
      label: '状态',
      prop: 'status',
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
] as const

// 从 InputData 的 prop 字面量推出表单值形状：{ keyword: string; status: string }
type DeviceTypeSearchForm = { [K in (typeof InputData)[number]['data']['prop']]: string }

// 0（禁用）是合法筛选值，不能写成 Number(x) || undefined，否则禁用永远筛不出来
const parseStatus = (value?: string): LabStatus | undefined =>
  value === undefined || value === '' ? undefined : (Number(value) as LabStatus)

const getTypeList = async (formValue?: DeviceTypeSearchForm) => {
  const res = await reqGetDeviceTypeList({
    page: currentPage.value,
    pageSize: limit.value,
    keyword: formValue?.keyword || undefined,
    status: parseStatus(formValue?.status),
  })
  if (res.code === 200) {
    tableData.value = res.data?.records ?? []
    total.value = res.data?.total ?? 0
    currentPage.value = res.data?.page ?? 1
    limit.value = res.data?.pageSize ?? 10
  }
}

const detailVisible = ref(false)
const detailRow = ref<DeviceTypeInfo | null>(null)

const openDetail = (row: DeviceTypeInfo) => {
  detailRow.value = row
  detailVisible.value = true
}

const editVisible = ref(false)
const submitting = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  type_id: undefined as number | undefined,
  type_name: '',
  type_code: '',
  type_desc: '',
  status: 1 as LabStatus,
})

// 长度跟后端列宽对齐：type_name / type_code 30，type_desc 100
const editRules: FormRules<typeof editForm> = {
  type_name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { max: 30, message: '类型名称最长 30 字', trigger: 'blur' },
  ],
  type_code: [
    { required: true, message: '请输入类型编号', trigger: 'blur' },
    { max: 30, message: '类型编号最长 30 字', trigger: 'blur' },
  ],
  type_desc: [{ max: 100, message: '描述最长 100 字', trigger: 'blur' }],
}

/**
 * resetFields 只重置带 prop 的表单项，type_id 得手动清空。
 * 另外这里把所有字段再显式赋一遍：如果用户第一次打开的是编辑弹窗，
 * 表单项会把当时的值记成 initialValue，之后 resetFields 会把编辑值带回来。
 */
const openCreateDialog = () => {
  editFormRef.value?.resetFields()
  editForm.type_id = undefined
  editForm.type_name = ''
  editForm.type_code = ''
  editForm.type_desc = ''
  editForm.status = 1
  editVisible.value = true
}

const openEditDialog = (row: DeviceTypeInfo) => {
  editFormRef.value?.resetFields()
  editForm.type_id = row.type_id
  editForm.type_name = row.type_name
  editForm.type_code = row.type_code
  editForm.type_desc = row.type_desc ?? ''
  editForm.status = row.status
  editVisible.value = true
}

const confirmEdit = async () => {
  if (!editFormRef.value) return
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    // update 是全量覆盖：字段都从表单带全，描述清空时显式传 null
    const res = await reqSaveDeviceType({
      type_id: editForm.type_id,
      type_name: editForm.type_name,
      type_code: editForm.type_code,
      type_desc: editForm.type_desc || null,
      status: editForm.status,
    })
    if (res.code === 200) {
      ElMessage.success(editForm.type_id ? '修改成功' : '新增成功')
      editVisible.value = false
      getTypeList()
    }
  } finally {
    submitting.value = false
  }
}

const handleUpdateStatus = async (row: DeviceTypeInfo) => {
  // 同一时刻只放一个请求出去，loading 生效前连点也能挡住
  if (statusLoadingId.value !== null) return
  const status: LabStatus = row.status === 1 ? 0 : 1
  statusLoadingId.value = row.type_id
  try {
    const res = await reqUpdateDeviceTypeStatus({ type_id: row.type_id, status })
    if (res.code === 200) {
      ElMessage.success(status === 1 ? '启用成功' : '禁用成功')
      getTypeList()
    }
  } catch {
    // 失败提示已由 request 的响应拦截器弹出，这里吞掉即可
  } finally {
    statusLoadingId.value = null
  }
}

const handleDelete = async (row: DeviceTypeInfo) => {
  try {
    await ElMessageBox.confirm(`此操作将永久删除「${row.type_name}」, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    const res = await reqDeleteDeviceType(row.type_id)
    if (res.code === 200) {
      ElMessage.success('删除成功!')
      getTypeList()
    }
  } catch {
    // 类型下还有设备（257）等业务错误由响应拦截器提示
  }
}

onMounted(() => {
  getTypeList()
})
</script>

<style scoped lang="css"></style>
