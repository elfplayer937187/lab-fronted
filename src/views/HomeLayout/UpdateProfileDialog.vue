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
      <el-form-item prop="avatar" label="头像">
        <!-- 用 el-upload 走它自己的 XHR，不经过 utils/request，所以头要自己带。
             form.avatar 存的是后端回的相对路径，正好够 avatar 的 50 字符上限 -->
        <el-upload
          class="avatar-uploader"
          :action="'/api/upload'"
          :headers="headers"
          accept="image/*"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="form.avatar" class="avatar" :src="form.avatar" alt="头像" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="HandleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import useUserStore from '@/stores/modules/user'
import { reqUpdateUser } from '@/apis/user/user'
import type { UpdateUser } from '@/apis/user/type'
import type { UploadResponse } from '@/apis/common'
import { getToken } from '@/utils/token'
const visible = defineModel<boolean>({ default: false })

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ name: '', email: '', phone: '', avatar: '' })
// 用 computed 而不是常量：el-upload 每次发请求时重新取，登录态变了才不会还用着旧 token
const headers = computed(() => ({ Authorization: `Bearer ${getToken() ?? ''}` }))
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

  if (userStore.userInfo) {
    userStore.userInfo.avatar = form.avatar
  }
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
// 后端对上传不挑格式也不限大小，这两道得前端自己拦，否则什么文件都能塞进头像位
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('头像只能是图片')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB')
    return false
  }
  return true
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (res: UploadResponse) => {
  if (res.code === 200 && res.data) {
    ElMessage.success(res.message ?? '上传成功')
    // 只留相对路径，正好卡在 User.avatar 的 50 字符上限内
    form.avatar = res.data.url
  } else {
    ElMessage.error(res.message ?? '上传失败')
  }
}
</script>

<style scoped lang="css">
/* EP 默认的上传触发区是个撑满宽度的虚线框，这里收成固定尺寸的方块，
   图片用 object-fit 裁满，避免非正方形头像被拉变形 */
.avatar-uploader :deep(.el-upload) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  transition: border-color 200ms;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 24px;
  color: var(--el-text-color-secondary);
}
</style>
