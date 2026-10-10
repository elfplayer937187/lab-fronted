<template>
  <el-dialog v-model="visible" title="修改个人资料" width="420px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="70px">
      <el-form-item prop="name" label="昵称">
        <el-input v-model="form.name" placeholder="请输入昵称" maxlength="50" />
      </el-form-item>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
      </el-form-item>
      <el-form-item prop="phone" label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <!-- 暂时是手填地址；接文件上传要等 /api/upload 的返回体定下来 -->
      <el-form-item prop="avatar" label="头像">
        <el-input v-model="form.avatar" placeholder="请输入头像地址" maxlength="50" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="HandleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import useUserStore from '@/stores/modules/user'
import { reqUpdateUser } from '@/apis/user/user'
import type { UpdateUser } from '@/apis/user/type'

const visible = defineModel<boolean>({ default: false })

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ name: '', email: '', phone: '', avatar: '' })

// 打开时用 store 里的当前资料回填。userInfo 只在登录时写入且不持久化，
// 所以刷新后是 null，这里会退回空表单
watch(visible, (open) => {
  if (!open) return
  const info = userStore.userInfo
  form.name = info?.name ?? ''
  form.email = info?.email ?? ''
  form.phone = info?.phone ?? ''
  form.avatar = info?.avatar ?? ''
  formRef.value?.clearValidate()
})

// 非必填项留空时不校验（Element Plus 会跳过空值的格式校验），跟注册页保持一致
const rules: FormRules<typeof form> = {
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 50, message: '昵称长度为 2-50 位', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
}

const HandleSubmit = async () => {
  if (!formRef.value) return
  const FormIsFormat = await formRef.value.validate().catch(() => false)
  if (!FormIsFormat) return

  // 只提交真正改过的字段。没改的字段若原样回传，在 userInfo 为 null（刷新后）
  // 的情况下会变成空串写回去，把库里的邮箱/手机号清掉
  const info = userStore.userInfo
  const payload: UpdateUser = {}
  if (form.name !== (info?.name ?? '')) payload.name = form.name
  if (form.email !== (info?.email ?? '')) payload.email = form.email
  if (form.phone !== (info?.phone ?? '')) payload.phone = form.phone
  if (form.avatar !== (info?.avatar ?? '')) payload.avatar = form.avatar

  // 后端要求更新类接口至少传一个字段，空对象会直接 400
  if (Object.keys(payload).length === 0) {
    ElMessage.info('没有需要修改的内容')
    return
  }

  loading.value = true
  try {
    const res = await reqUpdateUser(payload)
    if (res.code === 200) {
      ElMessage.success(res.message ?? '修改成功')
      // 同步回 store，否则下次打开还是旧值
      if (userStore.userInfo) Object.assign(userStore.userInfo, payload)
      visible.value = false
    } else {
      ElMessage.error(res.message ?? '修改失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="css"></style>
