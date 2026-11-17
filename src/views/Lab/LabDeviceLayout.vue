<template>
  <div class="">
    <DynamicTable
      :InputData="InputData"
      @submitForm="(v) => getDeviceList(v as LabDeviceSearchForm)"
    ></DynamicTable>
    <el-card class="mt-4">
      <el-button type="primary" class="btn-green mb-4" @click="openCreateDialog"
        >新增设备</el-button
      >
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column label="id" width="80" align="center">
          <template #default="{ row }">{{ row.lab_device_id }}</template>
        </el-table-column>
        <el-table-column label="设备名称" min-width="140">
          <template #default="{ row }">{{ row.device_name }}</template>
        </el-table-column>
        <el-table-column label="设备编号" min-width="140">
          <template #default="{ row }">{{ row.device_code }}</template>
        </el-table-column>
        <el-table-column label="品牌" min-width="120">
          <template #default="{ row }">{{ row.brand }}</template>
        </el-table-column>
        <el-table-column label="类型" min-width="140">
          <template #default="{ row }">{{ typeName(row.type_id) }}</template>
        </el-table-column>
        <el-table-column label="描述" min-width="180">
          <template #default="{ row }">
            <div class="desc-ellipsis">{{ row.description || '—' }}</div>
          </template>
        </el-table-column>
        <!-- 只占一列，但要能区分「设备自己禁用」和「所属类型禁用」 -->
        <el-table-column label="状态" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="deviceStatusMeta(row as LabDeviceInfo).type" disable-transitions>
              {{ deviceStatusMeta(row as LabDeviceInfo).text }}
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
              @click="openDetail(row as LabDeviceInfo)"
            ></el-button>
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              plain
              size="small"
              :loading="statusLoadingId === row.lab_device_id"
              :disabled="statusLoadingId !== null"
              @click="handleUpdateStatus(row as LabDeviceInfo)"
              >{{ row.status === 1 ? '禁用' : '启用' }}</el-button
            >
            <el-button
              type="warning"
              plain
              size="small"
              icon="Edit"
              @click="openEditDialog(row as LabDeviceInfo)"
            ></el-button>
            <el-button
              type="danger"
              plain
              size="small"
              icon="Delete"
              @click="handleDelete(row as LabDeviceInfo)"
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
        @change="() => getDeviceList()"
      ></el-pagination>
    </el-card>
    <!-- 列表已经返回完整对象，详情直接拿行数据渲染，不再调 /lab_device/get -->
    <el-dialog v-model="detailVisible" title="设备详情" width="640px">
      <el-descriptions v-if="detailRow" :column="2" border>
        <el-descriptions-item label="id">{{ detailRow.lab_device_id }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ detailRow.device_name }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ detailRow.device_code }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ detailRow.brand }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ typeName(detailRow.type_id) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="deviceStatusMeta(detailRow).type" disable-transitions>
            {{ deviceStatusMeta(detailRow).text }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ detailRow.description || '—' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 新增 / 编辑共用一个弹窗，靠 lab_device_id 区分走哪个接口；update 是全量覆盖，
         所以编辑时每个字段都要回填并提交 -->
    <el-dialog
      v-model="editVisible"
      :title="editForm.lab_device_id ? '修改设备资料' : '新增设备'"
      width="560px"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="设备名称" prop="device_name">
          <el-input v-model="editForm.device_name" :maxlength="30" placeholder="最长 30 字" />
        </el-form-item>
        <el-form-item label="设备编号" prop="device_code">
          <el-input v-model="editForm.device_code" :maxlength="30" placeholder="唯一，最长 30 字" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="editForm.brand" :maxlength="30" placeholder="最长 30 字" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type_id">
          <el-select v-model="editForm.type_id" placeholder="请选择设备类型" class="w-full">
            <el-option
              v-for="type in types"
              :key="type.type_id"
              :label="typeLabel(type)"
              :value="type.type_id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editForm.description"
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
  reqDeleteLabDevice,
  reqGetLabDeviceList,
  reqSaveLabDevice,
  reqUpdateLabDeviceStatus,
} from '@/apis/Lab/device'
import { reqGetDeviceTypeList } from '@/apis/Lab/deviceType'
import type { DeviceTypeInfo, LabDeviceInfo, LabStatus } from '@/apis/Lab/type'
import DynamicTable from '@/components/DynamicSearchForm.vue'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import 'element-plus/theme-chalk/el-message-box.css'
import { computed, onMounted, reactive, ref } from 'vue'

const tableData = ref<LabDeviceInfo[]>([])
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
const statusLoadingId = ref<number | null>(null)

// 类型下拉的数据源。新增和编辑都全部列出，禁用的类型带后缀标出来 ——
// 否则编辑一个「类型已被禁用」的设备时，下拉里找不到它当前的类型
const types = ref<DeviceTypeInfo[]>([])
const typeLabel = (type: DeviceTypeInfo) =>
  type.status === 1 ? type.type_name : `${type.type_name}（已禁用）`

// 搜索表单的选项值是字符串（跟 DynamicSearchForm 的约定一致）
const typeOptions = computed(() =>
  types.value.map((type) => ({ label: typeLabel(type), value: String(type.type_id) })),
)

const typeName = (typeId: number) =>
  types.value.find((type) => type.type_id === typeId)?.type_name ?? `未知类型(${typeId})`

const getAllTypes = async () => {
  // 后端 pageSize 上限就是 100；类型正常不会超过这个量，暂不做翻页
  const res = await reqGetDeviceTypeList({ page: 1, pageSize: 100 })
  if (res.code === 200) {
    types.value = res.data?.records ?? []
  }
}

const InputData = computed(
  () =>
    [
      {
        component: 'el-input',
        data: {
          label: '关键字',
          prop: 'keyword',
          placeholder: '设备名称 / 编号',
        },
      },
      {
        component: 'el-select',
        data: {
          label: '设备类型',
          prop: 'type_id',
          placeholder: '请选择类型',
          options: typeOptions.value,
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
    ] as const,
)

type LabDeviceSearchForm = {
  [K in (typeof InputData)['value'][number]['data']['prop']]: string
}

// 0（禁用）是合法筛选值，不能写成 Number(x) || undefined，否则禁用永远筛不出来
const parseStatus = (value?: string): LabStatus | undefined =>
  value === undefined || value === '' ? undefined : (Number(value) as LabStatus)

const parseTypeId = (value?: string) => {
  if (value === undefined || value === '') return undefined
  const typeId = Number(value)
  return typeId > 0 ? typeId : undefined
}

const getDeviceList = async (formValue?: LabDeviceSearchForm) => {
  const res = await reqGetLabDeviceList({
    page: currentPage.value,
    pageSize: limit.value,
    keyword: formValue?.keyword || undefined,
    type_id: parseTypeId(formValue?.type_id),
    status: parseStatus(formValue?.status),
  })
  if (res.code === 200) {
    tableData.value = res.data?.records ?? []
    total.value = res.data?.total ?? 0
    currentPage.value = res.data?.page ?? 1
    limit.value = res.data?.pageSize ?? 10
  }
}

type TagType = 'success' | 'info' | 'warning' | 'danger'

/**
 * 设备状态只占一列，要分清「设备自己禁用」和「所属类型禁用」：
 * status=0 是设备本身被禁用（优先级更高）；设备启用但 effective_type=0，
 * 说明是它所属的设备类型被禁用了。
 */
const deviceStatusMeta = (row: LabDeviceInfo): { text: string; type: TagType } => {
  if (row.status === 0) return { text: '设备已禁用', type: 'danger' }
  if (row.effective_type === 0) return { text: '类型已禁用', type: 'warning' }
  return { text: '启用', type: 'success' }
}

const detailVisible = ref(false)
const detailRow = ref<LabDeviceInfo | null>(null)

const openDetail = (row: LabDeviceInfo) => {
  detailRow.value = row
  detailVisible.value = true
}

const editVisible = ref(false)
const submitting = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  lab_device_id: undefined as number | undefined,
  device_name: '',
  device_code: '',
  brand: '',
  type_id: undefined as number | undefined,
  description: '',
  status: 1 as LabStatus,
})

// 长度跟后端列宽对齐：device_name / device_code / brand 30，description 100
const editRules: FormRules<typeof editForm> = {
  device_name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { max: 30, message: '设备名称最长 30 字', trigger: 'blur' },
  ],
  device_code: [
    { required: true, message: '请输入设备编号', trigger: 'blur' },
    { max: 30, message: '设备编号最长 30 字', trigger: 'blur' },
  ],
  brand: [
    { required: true, message: '请输入设备品牌', trigger: 'blur' },
    { max: 30, message: '设备品牌最长 30 字', trigger: 'blur' },
  ],
  type_id: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  description: [{ max: 100, message: '描述最长 100 字', trigger: 'blur' }],
}

/**
 * resetFields 只重置带 prop 的表单项，lab_device_id 得手动清空。
 * 另外这里把所有字段再显式赋一遍：如果用户第一次打开的是编辑弹窗，
 * 表单项会把当时的值记成 initialValue，之后 resetFields 会把编辑值带回来。
 */
const openCreateDialog = () => {
  editFormRef.value?.resetFields()
  editForm.lab_device_id = undefined
  editForm.device_name = ''
  editForm.device_code = ''
  editForm.brand = ''
  editForm.type_id = undefined
  editForm.description = ''
  editForm.status = 1
  editVisible.value = true
}

const openEditDialog = (row: LabDeviceInfo) => {
  editFormRef.value?.resetFields()
  editForm.lab_device_id = row.lab_device_id
  editForm.device_name = row.device_name
  editForm.device_code = row.device_code
  editForm.brand = row.brand
  editForm.type_id = row.type_id
  editForm.description = row.description ?? ''
  editForm.status = row.status
  editVisible.value = true
}

const confirmEdit = async () => {
  if (!editFormRef.value) return
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  const typeId = editForm.type_id
  if (typeId === undefined) return

  submitting.value = true
  try {
    // update 是全量覆盖：字段都从表单带全，描述清空时显式传 null
    const res = await reqSaveLabDevice({
      lab_device_id: editForm.lab_device_id,
      device_name: editForm.device_name,
      device_code: editForm.device_code,
      brand: editForm.brand,
      type_id: typeId,
      description: editForm.description || null,
      status: editForm.status,
    })
    if (res.code === 200) {
      ElMessage.success(editForm.lab_device_id ? '修改成功' : '新增成功')
      editVisible.value = false
      getDeviceList()
    }
  } finally {
    submitting.value = false
  }
}

const handleUpdateStatus = async (row: LabDeviceInfo) => {
  // 同一时刻只放一个请求出去，loading 生效前连点也能挡住
  if (statusLoadingId.value !== null) return
  const status: LabStatus = row.status === 1 ? 0 : 1
  statusLoadingId.value = row.lab_device_id
  try {
    const res = await reqUpdateLabDeviceStatus({ lab_device_id: row.lab_device_id, status })
    if (res.code === 200) {
      ElMessage.success(status === 1 ? '启用成功' : '禁用成功')
      getDeviceList()
    }
  } catch {
    // 失败提示已由 request 的响应拦截器弹出，这里吞掉即可
  } finally {
    statusLoadingId.value = null
  }
}

const handleDelete = async (row: LabDeviceInfo) => {
  try {
    await ElMessageBox.confirm(`此操作将永久删除「${row.device_name}」, 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    const res = await reqDeleteLabDevice(row.lab_device_id)
    if (res.code === 200) {
      ElMessage.success('删除成功!')
      getDeviceList()
    }
  } catch {
    // 设备已被实验室使用（260）等业务错误由响应拦截器提示
  }
}

onMounted(() => {
  getAllTypes()
  getDeviceList()
})
</script>

<style scoped lang="css">
/* 描述过长时单行省略；.el-table 的 .cell 默认是 white-space: normal，会换行 */
.desc-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
