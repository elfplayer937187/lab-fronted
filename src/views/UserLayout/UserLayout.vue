<template>
  <div class="user-layout">
    <el-card class="mb-4">
      <el-form
        ref="FormRef"
        :rules="rules"
        label-width="auto"
        @submit.prevent="getUserList(currentPage, limit, findName)"
      >
        <el-form-item label-width="" label="账号或昵称" prop="findName">
          <el-input
            class="w-100!"
            v-model="findName"
            placeholder="请输入账号和昵称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getUserList(currentPage, limit, findName)" plain
            >查询</el-button
          >
          <el-button
            type="primary"
            @click="
              () => {
                findName = ''
                getUserList(currentPage, limit, findName)
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
        @click="openAddDialog"
        type="primary"
        icon="Plus"
        class="btn-green mb-3.5 shadow-2xl"
        >新增用户</el-button
      >
      <!-- 左右两列 fixed：滚动时 id 和操作钉在两边，中间的列跟着滑 -->
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column label="id" width="80" fixed="left" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="账号" width="120">
          <template #default="{ row }">{{ row.username }}</template>
        </el-table-column>
        <el-table-column label="昵称" width="120">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="角色">
          <template #default="{ row }">{{ row.role }}</template>
        </el-table-column>
        <el-table-column label="邮箱" width="180">
          <template #default="{ row }">{{ row.email }}</template>
        </el-table-column>
        <el-table-column label="手机号" width="140">
          <template #default="{ row }">{{ row.phone }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" disable-transitions>
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="200px" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" @click="openEditDialog(row as UserInfo)"
              >编辑</el-button
            >
            <!-- el-table 的 row 只声明成 DefaultRow，两处都断言成实际类型 -->
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              :loading="statusLoadingId === row.id"
              :disabled="statusLoadingId !== null"
              plain
              size="small"
              @click="HandleUpdateStatus(row as UserInfo)"
              >{{ row.status === 1 ? '禁用' : '启用' }}</el-button
            >
            <el-button type="danger" plain size="small" @click="HandleDeleteUser(row as UserInfo)"
              >删除</el-button
            >
            <el-button type="success" plain size="small" @click="HandleAssignRole(row as UserInfo)"
              >分配角色</el-button
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
    <el-drawer v-model="RoleDrawerVisible" title="" direction="rtl">
      <template #header>
        <h3>分配角色权限</h3>
      </template>
      <template #default>
        <template v-for="role in RoleList" :key="role.id">
          <el-checkbox v-model="role.check">{{ role.name }}</el-checkbox>
        </template>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="RoleDrawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="confirmRoleDialog"
            >确定</el-button
          >
        </div>
      </template>
    </el-drawer>
    <!-- 新增 / 编辑共用这个dialog。字段与 SaveUser 一一对应，接口对多余字段是拒绝的，别多加 -->
    <el-dialog v-model="visible" :title="dialogTitle" width="600px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="auto">
        <el-form-item label="用户名" prop="username">
          <!-- 更新接口不收 username（改账号等于换登录凭据），所以编辑时置灰只作展示 -->
          <el-input
            v-model="addForm.username"
            :disabled="editingId !== null"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addForm.password"
            type="password"
            show-password
            :placeholder="editingId === null ? '请输入密码' : '留空表示不修改密码'"
            clearable
          />
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="请输入邮箱（可留空）" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="confirmDialog">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  reqAssignRole,
  reqDeleteUser,
  reqGetRoleList,
  reqGetUserList,
  reqSaveUser,
  reqUpdateUserStatus,
} from '@/apis/user/user'
import type { SaveUser, UserInfo } from '@/apis/user/type'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import 'element-plus/theme-chalk/el-message-box.css'
const RoleDrawerVisible = ref(false)
const FormRef = ref()
const rules = {
  findName: [{ required: false, message: '请输入账号或昵称', trigger: 'blur' }],
}
const tableData = ref<UserInfo[]>([])

const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)

const findName = ref('')
// 正在改状态的用户 id，null 表示没有进行中的请求；用来锁住那一行的按钮
const statusLoadingId = ref<number | null>(null)
// 新增 / 编辑共用这个弹窗，editingId 为 null 表示当前是新增
const visible = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const dialogTitle = computed(() => (editingId.value === null ? '新增用户' : '编辑用户'))
const addFormRef = ref<FormInstance>()
// 不带 id，reqSaveUser 会走创建接口
const addForm = reactive<SaveUser>({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
})
// 规则与注册页保持一致；邮箱非必填，留空时 EL 会跳过类型校验
const addRules = computed<FormRules<typeof addForm>>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    // 编辑时留空表示不改密码，所以只有新增才必填
    { required: editingId.value === null, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}))
// 角色权限
interface Role {
  id: number
  name: string
  check: boolean
}
const RoleList = ref<Role[]>([])
const currentSelectUserId = ref<number | null>(null)
const HandleAssignRole = (row: UserInfo) => {
  RoleDrawerVisible.value = true
  getRoleList(row)
}
const getRoleList = async (row: UserInfo) => {
  const res = await reqGetRoleList(row.id)
  if (res.code === 200) {
    currentSelectUserId.value = row.id
    RoleList.value = res.data || []
  }
}
const openAddDialog = () => {
  // 上次取消留下的值要清掉，否则再打开还是旧数据
  addFormRef.value?.resetFields()
  editingId.value = null
  visible.value = true
}

const openEditDialog = (row: UserInfo) => {
  // 先复位再填：既清掉上一次编辑残留的值，也顺手清掉校验红字
  addFormRef.value?.resetFields()
  addForm.username = row.username
  // 不回填密码，留空即「不修改」
  addForm.password = ''
  addForm.name = row.name
  addForm.email = row.email ?? ''
  addForm.phone = row.phone ?? ''
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
    // 带 id 走更新，不带走新增
    const payload: SaveUser = { ...addForm }
    if (editingId.value !== null) payload.id = editingId.value

    const res = await reqSaveUser(payload)
    if (res.code === 200) {
      ElMessage.success(editingId.value === null ? '新增成功' : '修改成功')
      visible.value = false
      getUserList(currentPage.value, limit.value, findName.value)
    }
  } finally {
    submitting.value = false
  }
}
const getUserList = async (page: number, pageSize: number, findName: string) => {
  try {
    const res = await reqGetUserList(page, pageSize, findName)
    if (res.code === 200) {
      tableData.value =
        res.data?.records.map((item) => {
          return {
            ...item,
            role: item.roles.join(' | '),
          }
        }) || []
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
  getUserList(currentPage.value, limit.value, findName.value)
})
const HandlePaginationChange = async () => {
  await getUserList(currentPage.value, limit.value, findName.value)
}
const HandleUpdateStatus = async (row: UserInfo) => {
  // 同一时刻只放一个请求出去。loading 要等 DOM 更新才生效，连点的第二下拦不住，这里再挡一道
  if (statusLoadingId.value !== null) return
  // 接口收的是「改成什么状态」，不是「切一下」，所以按当前状态取反
  const status = row.status === 1 ? 0 : 1
  statusLoadingId.value = row.id
  try {
    const res = await reqUpdateUserStatus({ id: row.id, status })
    if (res.code === 200) {
      ElMessage.success(status === 1 ? '启用成功' : '禁用成功')
      getUserList(currentPage.value, limit.value, findName.value)
    }
  } catch {
    // 失败提示已由 request 的响应拦截器弹出，这里吞掉即可
  } finally {
    statusLoadingId.value = null
  }
}
const HandleDeleteUser = (row: UserInfo) => {
  // 删除逻辑
  ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    reqDeleteUser(row.id).then(() => {
      ElMessage({
        type: 'success',
        message: '删除成功!',
      })
      getUserList(currentPage.value, limit.value, findName.value)
    })
  })
}
const confirmRoleDialog = async () => {
  // 点取消时 confirm 会 reject，转成 false 提前返回
  const confirmed = await ElMessageBox.confirm('此操作将重新分配该用户角色, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).catch(() => false)
  const userId = currentSelectUserId.value
  if (!confirmed || userId === null) return

  submitting.value = true
  try {
    const res = await reqAssignRole({
      userId,
      roleId: RoleList.value.filter((item) => item.check).map((item) => item.id),
    })
    if (res.code === 200) {
      ElMessage.success(res.message ?? '分配成功')
      RoleDrawerVisible.value = false
      // 必须等分配落了库再拉列表，否则拿回来的还是旧角色。
      // await 之后 Vue 的更新本来就会排到下一个 microtask，这里不需要 nextTick
      await getUserList(currentPage.value, limit.value, findName.value)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="css"></style>
