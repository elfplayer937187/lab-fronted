<template>
  <div class="w-full h-full flex items-center justify-center p-4">
    <el-card class="login-card w-[50%] h-[50%] rounded-2xl" shadow="hover">
      <template #header>
        <div class="flex items-center justify-center font-bold text-xl text-blue-400">
          <span class="tracking-widest">用户注册</span>
        </div>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="right"
        label-width="80px"
        @submit.prevent="HandleRegister"
      >
        <el-form-item prop="username" label="用户名" :required="true">
          <el-input v-model="form.username" placeholder="请输入用户名" :clearable="true">
          </el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码" :required="true">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            :clearable="true"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword" label="确认密码" :required="true">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="请输入确认密码"
            :clearable="true"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="name" label="昵称" :required="true">
          <el-input v-model="form.name" placeholder="请输入昵称" :clearable="true"> </el-input>
        </el-form-item>
        <el-form-item prop="phone" label="手机号" :required="true">
          <el-input v-model="form.phone" placeholder="请输入手机号" :clearable="true"> </el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" :clearable="true"> </el-input>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        native-type="submit"
        :loading="loading"
        @click="HandleRegister"
        class="w-full tracking-widest"
        >注册</el-button
      >
      <div class="mt-4 text-sm text-gray-500 text-center">
        已有账号?
        <span
          class="text-blue-500 cursor-pointer hover:text-blue-700"
          @click="router.push('/auth/login')"
          >去登录！</span
        >
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import router from '@/router'
import { reactive, ref } from 'vue'
import { reqRegister } from '@/apis/auth/auth'

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  email: '',
})
const rules: FormRules<typeof form> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      // 两次输入必须一致
      validator: (_rule, value, callback) => {
        if (value !== form.password) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  // 非必填：留空时不校验（Element Plus 会跳过空值的类型校验）
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}

const HandleRegister = async () => {
  if (!formRef.value) return
  const FormIsFormat = await formRef.value.validate().catch(() => false)
  if (!FormIsFormat) return

  loading.value = true
  try {
    // 表单内部用 camelCase，提交前转成后端契约的下划线字段
    const res = await reqRegister({
      username: form.username,
      password: form.password,
      confirm_password: form.confirmPassword,
      name: form.name,
      phone: form.phone,
      email: form.email,
    })
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// const resetForm = (formEl: FormInstance | undefined) => {
//   if (!formEl) return
//   formEl.resetFields()
// }
</script>

<style scoped lang="css">
.login-card {
  background-color: rgba(255, 255, 255, 0.2);
  /* 半透明白描边，模拟玻璃反光的边缘 */
  border: 1px solid rgba(255, 255, 255, 0.4);
  /* 让卡片从背景里“浮”起来 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
}
.login-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
}
</style>
