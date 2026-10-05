<template>
  <div class="w-full h-full flex items-center justify-center p-4">
    <el-card class="login-card w-[50%] h-[50%] rounded-2xl" shadow="hover">
      <template #header>
        <div class="flex items-center justify-center font-bold text-xl text-blue-400">
          <span class="tracking-widest">用户注册</span>
        </div>
      </template>
      <el-form
        v-model="form"
        :rules="rules"
        ref="formRef"
        label-position="right"
        label-width="80px"
      >
        <el-form-item prop="input1" label="用户名" :required="true">
          <el-input v-model="form.input1" placeholder="请输入用户名" :clearable="true"> </el-input>
        </el-form-item>
        <el-form-item prop="input2" label="密码" :required="true">
          <el-input v-model="form.input2" placeholder="请输入密码" :clearable="true"> </el-input>
        </el-form-item>
        <el-form-item prop="input3" label="确认密码" :required="true">
          <el-input v-model="form.input3" placeholder="请输入" :clearable="true"> </el-input>
        </el-form-item>
        <el-form-item prop="input4" label="手机号">
          <el-input v-model="form.input4" placeholder="请输入手机号" :clearable="true"> </el-input>
        </el-form-item>
        <el-form-item prop="input5" label="邮箱">
          <el-input v-model="form.input5" placeholder="请输入" :clearable="true"> </el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="submitForm(formRef)">注册</el-button>
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
import type { FormInstance } from 'element-plus'
import router from '@/router'
import { ref } from 'vue'

const formRef = ref<FormInstance>()
const form = ref({
  input1: '',
  input2: '',
  input3: '',
  input4: '',
  input5: '',
})
const rules = ref({
  input1: [{ required: true, message: '', trigger: 'blur' }],
  input2: [{ required: true, message: '', trigger: 'blur' }],
  input3: [{ required: true, message: '', trigger: 'blur' }],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
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
