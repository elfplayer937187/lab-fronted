<template>
  <!-- 外层撑满父级 el-col（AuthLayout 里已给 el-col 100% 高度），
       用 flex 把卡片在水平和垂直方向都居中 -->
  <div class="w-full h-full flex items-center justify-center p-4">
    <el-card class="login-card w-[50%] h-[50%] rounded-2xl" shadow="hover">
      <template #header>
        <div class="flex items-center justify-center font-bold text-xl text-blue-400">
          <span class="tracking-widest">用户登录</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="flex-1 flex flex-col justify-evenly gap-4"
        @submit.prevent="submitForm(formRef)"
      >
        <el-form-item prop="input1">
          <el-input
            prefix-icon="User"
            v-model="form.input1"
            placeholder="请输入账号"
            :maxlength="20"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="input2">
          <el-input
            prefix-icon="Lock"
            v-model="form.input2"
            type="password"
            placeholder="请输入密码"
            :maxlength="20"
            size="large"
            show-password
          />
        </el-form-item>

        <!-- 蓝色主按钮：native-type=submit 让回车也能提交 -->
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            size="large"
            class="w-full tracking-widest"
            :loading="loading"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="mt-4 text-sm text-gray-500 text-center">
        没有账号? <span class="text-blue-500 cursor-pointer hover:text-blue-700">去注册！</span>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  input1: '',
  input2: '',
})

const rules: FormRules<typeof form.value> = {
  input1: [{ required: true, message: '请输入账号', trigger: 'blur', min: 3, max: 20 }],
  input2: [{ required: true, message: '请输入密码', trigger: 'blur', min: 3, max: 20 }],
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const valid = await formEl.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // TODO: 接入登录接口
    console.log('submit!', form.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="css">
/* 卡片纵向排布，让 body 吃掉剩余高度，表单才能在卡片内垂直居中 */
.login-card {
  display: flex;
  flex-direction: column;
}

/* body 只负责把高度让给 form（不再做居中），
   表单等分卡片剩余空间由 form 自己的 justify-evenly 完成 */
.login-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
}

/* 表单项之间留白交给 form 的 gap，去掉 Element 自带的 18px 下边距 */
.login-card :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
