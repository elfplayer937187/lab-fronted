<template>
  <div class="role-layout">
    <el-card class="mb-4">
      <el-form label-width="auto" @submit.prevent="getRoleList(currentPage, limit, findName)">
        <el-form-item label-width="" label="角色名">
          <el-input
            class="w-100!"
            v-model="findName"
            placeholder="请输入角色名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRoleList(currentPage, limit, findName)" plain
            >查询</el-button
          >
          <el-button
            type="primary"
            @click="
              () => {
                findName = ''
                getRoleList(currentPage, limit, findName)
              }
            "
            plain
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <el-button
        v-permission="PERM.roleCreate"
        @click="openAddDialog"
        type="primary"
        icon="Plus"
        class="btn-green mb-3.5 shadow-2xl"
        >新增角色</el-button
      >
      <!-- 左右两列 fixed：滚动时 id 和操作钉在两边，中间的列跟着滑 -->
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column label="id" width="80" fixed="left" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="角色名" width="160">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="描述" min-width="240">
          <template #default="{ row }">{{ row.description }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" disable-transitions>
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 按钮全无权限时整列不渲染，避免留一个空的操作列 -->
        <el-table-column
          v-if="
            hasPermission([
              PERM.roleUpdate,
              PERM.roleStatus,
              PERM.roleDelete,
              PERM.roleAssignPermission,
            ])
          "
          label="操作"
          align="center"
          min-width="320px"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-permission="PERM.roleUpdate"
              type="primary"
              plain
              size="small"
              @click="openEditDialog(row as RoleInfo)"
              >编辑</el-button
            >
            <!-- el-table 的 row 只声明成 DefaultRow，两处都断言成实际类型 -->
            <el-button
              v-permission="PERM.roleStatus"
              :type="row.status === 1 ? 'danger' : 'success'"
              :loading="statusLoadingId === row.id"
              :disabled="statusLoadingId !== null"
              plain
              size="small"
              @click="HandleUpdateStatus(row as RoleInfo)"
              >{{ row.status === 1 ? '禁用' : '启用' }}</el-button
            >
            <el-button
              v-permission="PERM.roleAssignPermission"
              type="warning"
              plain
              size="small"
              @click="openPermissionDialog(row as RoleInfo)"
              >分配权限</el-button
            >
            <el-button
              v-permission="PERM.roleDelete"
              type="danger"
              plain
              size="small"
              @click="HandleDeleteRole(row as RoleInfo)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt-4"
        v-model:current-page="currentPage"
        v-model:page-size="limit"
        :page-sizes="[10, 20, 50, 100, 200]"
        layout="total, sizes, prev, pager,->, next, jumper"
        :total="total"
        @change="HandlePaginationChange"
      >
      </el-pagination>
    </el-card>
    <!-- 新增 / 编辑共用这个dialog。字段与 SaveRole 一一对应，接口对多余字段是拒绝的，别多加 -->
    <el-dialog v-model="visible" :title="dialogTitle" width="600px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="auto">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入角色名（最长 50 字）" clearable />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
            :maxlength="255"
            placeholder="请输入角色描述（可留空）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="confirmDialog">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限：树是级联勾选，勾菜单会连带勾上所有子按钮 -->
    <el-dialog v-model="permVisible" :title="`分配权限 - ${permRole?.name ?? ''}`" width="520px">
      <el-tree
        ref="permTreeRef"
        :data="permTree"
        :props="{ label: 'name', children: 'children' }"
        show-checkbox
        node-key="id"
        default-expand-all
        class="max-h-[60vh] overflow-y-auto"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permVisible = false">取消</el-button>
          <el-button type="primary" :loading="permSubmitting" @click="confirmPermission">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  reqAssignPermission,
  reqDeleteRole,
  reqGetRoleList,
  reqGetRolePermissions,
  reqSaveRole,
} from '@/apis/role/role'
import type { RoleInfo, SaveRole } from '@/apis/role/type'
import type { MenuTreeNode } from '@/apis/menu/type'
import { PERM } from '@/constants/permissions'
import useUserStore from '@/stores/modules/user'
import { ElMessageBox, type FormInstance, type FormRules, type TreeInstance } from 'element-plus'
import 'element-plus/theme-chalk/el-message-box.css'

const { hasPermission } = useUserStore()
const tableData = ref<RoleInfo[]>([])

const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)

const findName = ref('')
// 正在改状态的角色 id，null 表示没有进行中的请求；用来锁住那一行的按钮
const statusLoadingId = ref<number | null>(null)

// 新增 / 编辑共用这个弹窗，editingId 为 null 表示当前是新增
const visible = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const dialogTitle = computed(() => (editingId.value === null ? '新增角色' : '编辑角色'))
const addFormRef = ref<FormInstance>()
// 不带 id，reqSaveRole 会走创建接口
const addForm = reactive<SaveRole>({
  name: '',
  description: '',
})
// 长度限制跟后端一致：name 1-50，description 最长 255
const addRules: FormRules<typeof addForm> = {
  name: [
    { required: true, message: '请输入角色名', trigger: 'blur' },
    { max: 50, message: '角色名最长 50 字', trigger: 'blur' },
  ],
  description: [{ max: 255, message: '描述最长 255 字', trigger: 'blur' }],
}

const getRoleList = async (page: number, pageSize: number, keyword: string) => {
  try {
    const res = await reqGetRoleList(page, pageSize, keyword)
    if (res.code === 200) {
      tableData.value = res.data?.records || []
      total.value = res.data?.total || 0
      currentPage.value = res.data?.page || 1
      limit.value = res.data?.pageSize || 10
    }
  } catch {
    // 失败提示已由 request 的响应拦截器弹出，这里吞掉即可，
    // 否则 rejected promise 会冒到 mounted 钩子，报 unhandled error
  }
}
onMounted(() => {
  getRoleList(currentPage.value, limit.value, findName.value)
})
const HandlePaginationChange = async () => {
  await getRoleList(currentPage.value, limit.value, findName.value)
}

const openAddDialog = () => {
  // 上次取消留下的值要清掉，否则再打开还是旧数据
  addFormRef.value?.resetFields()
  editingId.value = null
  visible.value = true
}

const openEditDialog = (row: RoleInfo) => {
  // 先复位再填：既清掉上一次编辑残留的值，也顺手清掉校验红字
  addFormRef.value?.resetFields()
  addForm.name = row.name
  addForm.description = row.description ?? ''
  editingId.value = row.id
  visible.value = true
}

const confirmDialog = async () => {
  if (!addFormRef.value) return
  // 校验不通过时 validate 会 reject，转成 false 提前返回，避免冒到控制台
  const valid = await addFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    // 带 id 走更新，不带走新建。后端是部分更新，只提交表单里这两项就行，
    // status 不动 —— 实测只传 name 时 status 和 description 都会原样保留
    const payload: SaveRole = { ...addForm }
    if (editingId.value !== null) payload.id = editingId.value

    const res = await reqSaveRole(payload)
    if (res.code === 200) {
      ElMessage.success(editingId.value === null ? '新增成功' : '修改成功')
      visible.value = false
      getRoleList(currentPage.value, limit.value, findName.value)
    }
  } finally {
    submitting.value = false
  }
}

const HandleUpdateStatus = async (row: RoleInfo) => {
  // 同一时刻只放一个请求出去。loading 要等 DOM 更新才生效，连点的第二下拦不住，这里再挡一道
  if (statusLoadingId.value !== null) return
  // 接口收的是「改成什么状态」，不是「切一下」，所以按当前状态取反
  const status = row.status === 1 ? 0 : 1
  statusLoadingId.value = row.id
  try {
    // 没有单独的 updateStatus 接口，走更新；后端要求 name 和 id 一起传
    const res = await reqSaveRole({ id: row.id, name: row.name, status })
    if (res.code === 200) {
      ElMessage.success(status === 1 ? '启用成功' : '禁用成功')
      getRoleList(currentPage.value, limit.value, findName.value)
    }
  } catch {
    // 失败提示已由 request 的响应拦截器弹出，这里吞掉即可
  } finally {
    statusLoadingId.value = null
  }
}

const HandleDeleteRole = (row: RoleInfo) => {
  ElMessageBox.confirm('此操作将永久删除该角色, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    reqDeleteRole(row.id).then(() => {
      ElMessage({
        type: 'success',
        message: '删除成功!',
      })
      getRoleList(currentPage.value, limit.value, findName.value)
    })
  })
}

// ---- 分配权限 ----
const permVisible = ref(false)
const permSubmitting = ref(false)
const permRole = ref<RoleInfo | null>(null)
const permTree = ref<MenuTreeNode[]>([])
const permTreeRef = ref<TreeInstance>()

/**
 * 只回填"叶子中 check=1"的节点。
 * 级联模式下把父节点 id 塞进 setCheckedKeys 会把整棵子树勾满，
 * 保存后等于凭空给角色加了一堆它本来没有的权限。
 */
const collectCheckedLeafIds = (nodes: MenuTreeNode[]): number[] =>
  nodes.flatMap((node) =>
    node.children?.length
      ? collectCheckedLeafIds(node.children)
      : node.check === 1
        ? [node.id]
        : [],
  )

const openPermissionDialog = async (row: RoleInfo) => {
  permRole.value = row
  permTree.value = []
  permVisible.value = true
  // 先清掉上一个角色留下的勾选，再等树渲染完
  await nextTick()
  permTreeRef.value?.setCheckedKeys([])

  try {
    const res = await reqGetRolePermissions(row.id)
    if (res.code !== 200) return
    permTree.value = res.data ?? []
    await nextTick()
    permTreeRef.value?.setCheckedKeys(collectCheckedLeafIds(permTree.value))
  } catch {
    // 角色可能刚被删掉（404），关掉弹窗并刷新列表
    permVisible.value = false
    getRoleList(currentPage.value, limit.value, findName.value)
  }
}

const confirmPermission = async () => {
  if (!permRole.value || !permTreeRef.value) return
  // 半选父节点必须一起提交：只给按钮不给菜单 code，路由守卫会把用户挡在页面外
  const ids = [
    ...permTreeRef.value.getCheckedKeys(),
    ...permTreeRef.value.getHalfCheckedKeys(),
  ].map(Number)
  if (!ids.length) {
    ElMessage.warning('至少为角色保留一个权限')
    return
  }

  permSubmitting.value = true
  try {
    const res = await reqAssignPermission(permRole.value.id, ids)
    if (res.code === 200) {
      ElMessage.success('分配成功')
      permVisible.value = false
    }
  } catch {
    // 失败提示已由 request 的响应拦截器弹出
  } finally {
    permSubmitting.value = false
  }
}
</script>

<style scoped lang="css"></style>
