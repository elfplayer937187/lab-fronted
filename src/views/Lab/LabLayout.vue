<template>
  <div class="">
    <DynamicTable
      :InputData="InputData"
      @submitForm="(v) => getLabList(v as LabSearchForm)"
    ></DynamicTable>
    <el-card class="mt-4">
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column label="id" width="80" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="实验室名称" min-width="160">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="开放时间" min-width="160">
          <template #default="{ row }">{{ row.open_time }}</template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="160">
          <template #default="{ row }">{{ row.close_time }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="270px" fixed="right">
          <template #default="{ row }">
            <el-button
              type="info"
              plain
              size="small"
              icon="View"
              @click="openDetail(row as LabInfo)"
            ></el-button>
            <el-button
              type="danger"
              plain
              size="small"
              icon="Delete"
              @click="handleDelete(row as LabInfo)"
            ></el-button>
            <el-button
              type="warning"
              plain
              size="small"
              icon="Edit"
              @click="openEditDialog(row as LabInfo)"
            ></el-button>
            <el-button
              type="success"
              size="small"
              icon="Picture"
              @click="openImageDialog(row.id)"
              plain
            >
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt-4"
        v-model:current-page="currentPage"
        v-model:page-size="limit"
        :page-sizes="[3, 5, 10, 20, 50]"
        layout="total, sizes, prev, pager,->, next, jumper"
        :total="total"
        @change="() => getLabList()"
      >
      </el-pagination>
    </el-card>
    <!-- 详情弹窗。列表接口返回的就是完整对象，直接拿行数据渲染，不用再调 /lab/get。
         字段多了会顶出视口，套一层滚动容器，高度按视口 60% 卡住 -->
    <el-dialog v-model="detailVisible" title="实验室详情" width="720px">
      <div class="max-h-[60vh] overflow-y-auto">
        <el-descriptions v-if="detailRow" :column="2" border>
          <el-descriptions-item label="id">{{ detailRow.id }}</el-descriptions-item>
          <el-descriptions-item label="实验室名称">{{ detailRow.name }}</el-descriptions-item>
          <el-descriptions-item label="所属楼栋">{{ detailRow.building }}</el-descriptions-item>
          <el-descriptions-item label="所属楼层">{{ detailRow.floor }}</el-descriptions-item>
          <el-descriptions-item label="占地面积(m²)">{{ detailRow.area }}</el-descriptions-item>
          <el-descriptions-item label="容量">{{ detailRow.capacity }}</el-descriptions-item>
          <el-descriptions-item label="管理员id">{{ detailRow.manager_id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailRow.status === 1 ? 'success' : 'info'" disable-transitions>
              {{ detailRow.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开放时间">{{ detailRow.open_time }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ detailRow.close_time }}</el-descriptions-item>
          <!-- 描述和图片都可能很长，各占一整行 -->
          <el-descriptions-item label="描述" :span="2">
            {{ detailRow.description }}
          </el-descriptions-item>
          <el-descriptions-item label="图片" :span="2">
            <el-image v-if="detailRow.image" :src="detailRow.image" fit="cover" class="h-32 w-32" />
            <span v-else>—</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
    <!-- 修改弹窗。字段跟 SaveLab 对齐，但没放 image —— 那个要配上传组件，
         不传的话后端是 exclude_unset，不会被清空 -->
    <el-dialog v-model="editVisible" title="修改实验室配置" width="720px">
      <div class="max-h-[60vh] overflow-y-auto">
        <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
          <el-form-item label="实验室名称" prop="name">
            <!-- name 后端列宽 String(10)，而且是唯一键，重名会 451 -->
            <el-input v-model="editForm.name" :maxlength="10" placeholder="最长 10 字" />
          </el-form-item>
          <el-form-item label="所属楼栋" prop="building">
            <el-input-number v-model="editForm.building" :min="0" />
          </el-form-item>
          <el-form-item label="所属楼层" prop="floor">
            <el-input-number v-model="editForm.floor" :min="0" />
          </el-form-item>
          <el-form-item label="占地面积(m²)" prop="area">
            <el-input-number v-model="editForm.area" :min="0" />
          </el-form-item>
          <el-form-item label="容量" prop="capacity">
            <el-input-number v-model="editForm.capacity" :min="0" />
          </el-form-item>
          <el-form-item label="管理员id" prop="manager_id">
            <el-input-number v-model="editForm.manager_id" :min="1" />
          </el-form-item>
          <el-form-item label="开放时间" prop="open_time">
            <!-- 后端这两列是 String(40)，不收日期对象，当普通文本填 -->
            <el-input v-model="editForm.open_time" placeholder="如 08:00" />
          </el-form-item>
          <el-form-item label="结束时间" prop="close_time">
            <el-input v-model="editForm.close_time" placeholder="如 22:00" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch v-model="editForm.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="editForm.description"
              type="textarea"
              :rows="3"
              :maxlength="255"
              placeholder="可留空"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="confirmEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="ImageDialogVisible" title="修改图片" width="600px">
      <UploadForm
        ref="UploadRef"
        @form-change="
          (data) => {
            ImageForm = data
          }
        "
      ></UploadForm>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ImageDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImageDialog">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import UploadForm from '@/components/UploadForm.vue'
import type { UploadResult } from '@/apis/common'
import {
  reqDeleteLab,
  reqGetLabList,
  reqGetLabUser,
  reqSaveLab,
  reqUpdateLabImage,
} from '@/apis/Lab/lab'
import type { LabInfo, LabStatus } from '@/apis/Lab/type'
import DynamicTable from '@/components/DynamicSearchForm.vue'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import 'element-plus/theme-chalk/el-message-box.css'
import { computed, onMounted, reactive, ref } from 'vue'

const tableData = ref<LabInfo[]>([])

const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
// 管理员下拉的选项是接口拉的，单独拎个 ref 出来，不能直接写进配置里
const managerOptions = ref<{ label: string; value: string }[]>([])

const getUserLabList = async () => {
  const res = await reqGetLabUser()
  if (res.code === 200) {
    // 后端给的是 { id, username }，转成 el-select 要的 { label, value }
    managerOptions.value = (res.data ?? []).map((user) => ({
      label: user.username,
      value: String(user.id),
    }))
  }
}
// 配置整体套 computed：管理员那一项要吃接口回来的数据。写成静态的 as const 的话，
// setup 时求值一次就固定了，接口回来也刷不进去
const InputData = computed(
  () =>
    [
      {
        component: 'el-input',
        data: {
          label: '实验室名称',
          prop: 'nameKeyword',
          placeholder: '请输入用户名',
        },
      },
      {
        component: 'el-select',
        data: {
          label: '所属楼栋',
          prop: 'building',
          placeholder: '请选择楼栋',
          options: Array.from({ length: 10 }, (_, i) => {
            return {
              label: `第${i + 1}幢`,
              value: `${i + 1}`,
            }
          }),
        },
      },
      {
        component: 'el-select',
        data: {
          label: '所属楼层',
          prop: 'floor',
          placeholder: '请选择楼层',
          options: Array.from({ length: 6 }, (_, i) => {
            return {
              label: `第${i + 1}层`,
              value: `${i + 1}`,
            }
          }),
        },
      },
      {
        component: 'el-select',
        data: {
          label: '管理员',
          prop: 'manage_id',
          placeholder: '请选择管理员',
          options: managerOptions.value,
        },
      },
    ] as const,
)

// 从 InputData 的 prop 字面量推出表单值的形状，等价于手写
// { nameKeyword: string; building: string; floor: string; manage_id: string }。
// 套了 computed 之后要先取 ['value'] 才拿得到数组，再用 [number] 取出元素类型
type LabSearchForm = { [K in (typeof InputData)['value'][number]['data']['prop']]: string }
//  处理图片上传表单
const ImageForm = ref<UploadResult>()
const ImageDialogVisible = ref(false)
const currentImageLabId = ref<number | null>(null)
const UploadRef = ref()
const openImageDialog = (id: number) => {
  currentImageLabId.value = id
  ImageDialogVisible.value = true
}

// 发送图片表单
const confirmImageDialog = async () => {
  const res = await reqUpdateLabImage(currentImageLabId.value!, ImageForm.value?.url!)

  if (res.code === 200) {
    getLabList()
    UploadRef.value?.clearForm()
    ImageDialogVisible.value = false
    ElMessage.success('修改成功')
  }
}
// formValue 可选：翻页和首次加载没有搜索条件，这时不传，后端按不筛选处理
const getLabList = async (formValue?: LabSearchForm) => {
  const res = await reqGetLabList({
    page: currentPage.value,
    pageSize: limit.value,
    nameKeyword: formValue?.nameKeyword,
    building: Number(formValue?.building) || undefined,
    floor: Number(formValue?.floor) || undefined,
    manage_id: Number(formValue?.manage_id) || undefined,
  })
  if (res.code === 200) {
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
    currentPage.value = res.data?.page || 1
    limit.value = res.data?.pageSize || 10
    console.log(res)
  }
}
// 详情弹窗。行数据本身就是 /lab/list 返回的完整对象，直接引用，不再打一次 /lab/get
const detailVisible = ref(false)
const detailRow = ref<LabInfo | null>(null)

const openDetail = (row: LabInfo) => {
  detailRow.value = row
  detailVisible.value = true
}

// 修改弹窗。字段对齐 SaveLab，image 故意没放进来（需要上传组件，不传后端也不会动它）
const editVisible = ref(false)
const submitting = ref(false)
const editFormRef = ref<FormInstance>()
// 类型是就地标的，没用 reactive<SaveLab>：SaveLab 里 status 可空，而 el-switch 的
// v-model 不收 null。这里的字段都回填成确定值，标成非空版本正好
const editForm = reactive({
  id: undefined as number | undefined,
  name: '',
  description: '',
  capacity: 0,
  open_time: '',
  close_time: '',
  manager_id: 1,
  status: 1 as LabStatus,
  building: 0,
  floor: 0,
  area: 0,
})
// 长度限制跟后端列宽一致：name 10（还是唯一键）、description 255
const editRules: FormRules<typeof editForm> = {
  name: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' },
    { max: 10, message: '实验室名称最长 10 字', trigger: 'blur' },
  ],
  building: [{ required: true, message: '请输入所属楼栋', trigger: 'blur' }],
  floor: [{ required: true, message: '请输入所属楼层', trigger: 'blur' }],
  area: [{ required: true, message: '请输入占地面积', trigger: 'blur' }],
  description: [{ max: 255, message: '描述最长 255 字', trigger: 'blur' }],
}

const openEditDialog = (row: LabInfo) => {
  // 先复位再回填：清掉上一次编辑残留的值，也顺手清掉校验红字
  editFormRef.value?.resetFields()
  editForm.id = row.id
  editForm.name = row.name
  editForm.description = row.description ?? ''
  editForm.capacity = row.capacity ?? 0
  editForm.open_time = row.open_time ?? ''
  editForm.close_time = row.close_time ?? ''
  editForm.manager_id = row.manager_id
  editForm.status = row.status ?? 1
  editForm.building = row.building
  editForm.floor = row.floor
  editForm.area = row.area
  editVisible.value = true
}

const confirmEdit = async () => {
  if (!editFormRef.value) return
  // 校验不通过时 validate 会 reject，转成 false 提前返回，避免冒到控制台
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    // 带了 id，reqSaveLab 会走 PUT /lab/update
    const res = await reqSaveLab({ ...editForm })
    if (res.code === 200) {
      ElMessage.success('修改成功')
      editVisible.value = false
      getLabList()
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row: LabInfo) => {
  ElMessageBox.confirm(`此操作将永久删除「${row.name}」, 是否继续?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // labId 走路径参数，不是 query
    reqDeleteLab(row.id).then(() => {
      ElMessage.success('删除成功!')
      getLabList()
    })
  })
}

onMounted(() => {
  getUserLabList()
  getLabList()
})
</script>

<style scoped lang="css"></style>
