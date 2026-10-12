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
        <el-table-column label="角色" width="100">
          <template #default="{ row }">{{ roleText[row.role] ?? row.role }}</template>
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
          <template #default>
            <el-button type="primary" plain size="small">编辑</el-button>
            <el-button type="danger" plain size="small">禁用</el-button>
            <el-button type="danger" plain size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt-4"
        v-model:current-page="currentPage"
        v-model:page-size="limit"
        :page-sizes="[10, 20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @change="HandlePaginationChange"
      >
      </el-pagination>
    </el-card>
    <!-- 新增dialog。字段与 AddRequest 一一对应，接口对多余字段是拒绝的，别多加 -->
    <el-dialog v-model="visible" title="新增用户" width="600px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="auto">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
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
import { onMounted, reactive, ref } from 'vue'
import { reqAddUser, reqGetUserList } from '@/apis/user/user'
import type { AddRequest, UserInfo } from '@/apis/user/type'
import type { FormInstance, FormRules } from 'element-plus'

const FormRef = ref()
const rules = {
  findName: [{ required: false, message: '请输入账号或昵称', trigger: 'blur' }],
}
const tableData = ref<UserInfo[]>([])
// 接口给的是角色枚举值，界面上转成中文；没收录的值原样显示
const roleText: Record<string, string> = { admin: '管理员', student: '学生' }
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)

const findName = ref('')
// 新增dialog
const visible = ref(false)
const submitting = ref(false)
const addFormRef = ref<FormInstance>()
const addForm = reactive<AddRequest>({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
})
// 规则与注册页保持一致；邮箱非必填，留空时 EL 会跳过类型校验
const addRules: FormRules<typeof addForm> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

const openAddDialog = () => {
  // 上次取消留下的值要清掉，否则再打开还是旧数据
  addFormRef.value?.resetFields()
  visible.value = true
}

const confirmDialog = async () => {
  if (!addFormRef.value) return
  // 校验不通过时 validate 会 reject，转成 false 提前返回，避免冒到控制台
  const valid = await addFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await reqAddUser(addForm)
    if (res.code === 200) {
      ElMessage.success('新增成功')
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
  getUserList(currentPage.value, limit.value, findName.value)
})
const HandlePaginationChange = async () => {
  await getUserList(currentPage.value, limit.value, findName.value)
}
</script>

<style scoped lang="css"></style>
