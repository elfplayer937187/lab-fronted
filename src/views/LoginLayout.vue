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
        <el-form-item prop="username">
          <el-input
            prefix-icon="User"
            v-model="form.username"
            placeholder="请输入账号"
            :maxlength="20"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            prefix-icon="Lock"
            v-model="form.password"
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
            @click="HandleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="mt-4 text-sm text-gray-500 text-center">
        没有账号?
        <span
          class="text-blue-500 cursor-pointer hover:text-blue-700"
          @click="router.push('/auth/register')"
          >去注册！</span
        >
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import router from '@/router'
import { reqLogin } from '@/apis/auth/auth'
import useUserStore from '@/stores/modules/user.ts'
import { storeToRefs } from 'pinia'
import { setToken } from '@/utils/token'
const userStore = useUserStore()
const { userInfo, token } = storeToRefs(userStore)
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
})
const rules: FormRules<typeof form> = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur', min: 3, max: 20 }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 3, max: 20 }],
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const valid = await formEl.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // TODO: 接入登录接口
    console.log('submit!', form)
  } finally {
    loading.value = false
  }
}
const HandleLogin = async () => {
  if (!formRef.value) return
  const FormIsFormat = await formRef.value?.validate()
  if (!FormIsFormat) return
  loading.value = true
  try {
    const res = await reqLogin(form)
    if (res.code === 200) {
      ElMessage.success('登录成功')
      token.value = res.data?.token || ''
      userInfo.value = res.data
      setToken(token.value || '')

      router.push('/')
    }
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

  /* 毛玻璃：只让“卡片这一层”半透明，内部文字/按钮保持原色不透明。
     注意不能用父级的 opacity —— 那会把整棵子树（含文字）一起变淡。 */
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  /* 半透明白描边，模拟玻璃反光的边缘 */
  border: 1px solid rgba(255, 255, 255, 0.4);
  /* 让卡片从背景里“浮”起来 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
