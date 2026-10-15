<template>
  <div class="menu-layout">
    <el-card>
      <el-table ref="table" row-key="id" :data="tableData" style="width: 100%" border>
        <el-table-column label="Id" prop="" width="">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="菜单名称" prop="" width="">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="描述" prop="" width="">
          <template #default="{ row }">{{ row.description }} </template>
        </el-table-column>
        <el-table-column label="操作" prop="" width="" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              :class="row.type === 1 ? `btn-green!` : ``"
              @click="openAddDialog(row as MenuTreeNode)"
              >{{ '新增权限' }}</el-button
            >
            <el-button
              type="danger"
              v-if="row.type === 2"
              @click="handleDelete(row as MenuTreeNode)"
              >删除权限</el-button
            >
            <el-button type="warning" @click="openEditDialog(row as MenuTreeNode)"
              >修改权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 新增 / 修改共用。字段与 CreateMenuRequest 对齐，pid 和 type 由点的是哪一行决定 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="form.code" placeholder="如 lab:create（最长 100 字）" clearable />
        </el-form-item>
        <el-form-item label="权限名" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名（最长 50 字）" clearable />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <!-- 后端这个字段是必填但没给默认值，只能传空串不能省掉，所以不设 required 规则 -->
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :maxlength="255"
            placeholder="请输入描述（可留空）"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <!-- :active-value 前面的冒号不能掉，掉了传的是字符串 "1"，后端 Literal[0,1] 会 400 -->
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="confirmDialog">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reqDeleteMenu, reqGetMenuTree, reqSaveMenu } from '@/apis/menu/menu'
import type { MenuTreeNode, SaveMenu } from '@/apis/menu/type'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import 'element-plus/theme-chalk/el-message-box.css'
import { onMounted, reactive, ref } from 'vue'
const table = ref<MenuTreeNode[]>()
const tableData = ref<MenuTreeNode[]>([])
const getMenuTree = async () => {
  const res = await reqGetMenuTree()
  if (res.code === 200) {
    tableData.value = res.data || []
    console.log(res)
  }
}
onMounted(() => {
  getMenuTree()
})

// 新增 / 修改共用这个弹窗，editingId 为 null 表示当前是新增。
// pid 和 type 不在表单里，但它们是请求体的一部分 —— 新增时由点的那一行决定，
// 修改时取 row 自己的值原样带回去
const dialogVisible = ref(false)
const dialogTitle = ref('新增节点')
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()
// 这是传给 reqSaveMenu 的完整请求体，所以不含模板要用的 pid/type 时也别删字段
const form = reactive<SaveMenu>({
  code: '',
  name: '',
  description: '',
  type: 1,
  status: 1,
  pid: null,
})
// 长度限制跟后端列宽一致：code 100、name 50、description 255
const rules: FormRules<typeof form> = {
  code: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
  name: [{ required: true, message: '请输入权限名', trigger: 'blur' }],
  description: [{ max: 255, message: '描述最长 255 字', trigger: 'blur' }],
}

const openAddDialog = (row: MenuTreeNode) => {
  // 先复位再填：清掉上一次残留的值，也顺手清掉校验红字
  formRef.value?.resetFields()
  form.pid = row.id
  form.type = row.type
  editingId.value = null
  dialogTitle.value = row.type === 1 ? '新增节点' : '新增按钮'
  dialogVisible.value = true
}

const openEditDialog = (row: MenuTreeNode) => {
  // 先复位再回填，理由同上
  formRef.value?.resetFields()
  form.code = row.code
  form.name = row.name
  form.description = row.description
  form.type = row.type
  form.status = row.status
  form.pid = row.pid ?? null
  editingId.value = row.id
  dialogTitle.value = '修改权限'
  dialogVisible.value = true
}

const confirmDialog = async () => {
  if (!formRef.value) return
  // 校验不通过时 validate 会 reject，转成 false 提前返回，避免冒到控制台
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    // 带 id 走更新，不带走新增。后端更新是逐字段 setattr 的全量覆盖，
    // 所以 pid / type 这两个没露在表单上的字段也必须带回去，少一个就被写空了
    const payload: SaveMenu = { ...form }
    if (editingId.value !== null) payload.id = editingId.value

    const res = await reqSaveMenu(payload)
    if (res.code === 200) {
      ElMessage.success(editingId.value === null ? '新增成功' : '修改成功')
      dialogVisible.value = false
      getMenuTree()
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row: MenuTreeNode) => {
  ElMessageBox.confirm('此操作将永久删除该权限, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 有子菜单时后端回 MENU_NOT_EMPTY(242)，删除会被拒绝
    reqDeleteMenu(row.id).then(() => {
      ElMessage({
        type: 'success',
        message: '删除成功!',
      })
      getMenuTree()
    })
  })
}
</script>

<style scoped lang="css"></style>
