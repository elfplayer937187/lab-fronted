<template>
  <div class="avatar-uploader">
    <el-upload
      action="/api/upload"
      method="post"
      :show-file-list="false"
      :headers="headers"
      :on-success="handleAvatarSuccess"
      :before-upload="HandleBeforeUpload"
    >
      <el-image v-if="form?.url" :src="form?.url" fit="cover" class="avatar" />

      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
  </div>
</template>

<script lang="ts" setup>
import type { UploadResponse, UploadResult } from '@/apis/common'
import { getToken } from '@/utils/token'
import type { UploadProps } from 'element-plus'
import { ref } from 'vue'
const emit = defineEmits(['formChange'])
const form = ref<UploadResult | null>(null)

const headers = ref({
  Authorization: 'Bearer ' + getToken(),
})
const HandleBeforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
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
const handleAvatarSuccess = (res: UploadResponse) => {
  if (res.code === 200) {
    ElMessage.success('上传成功')
    form.value = res.data
    emit('formChange', form.value)
  } else {
    ElMessage.error(res.message ?? '上传失败')
  }
}
function clearForm() {
  form.value = null
}
defineExpose({ clearForm })
</script>

<style scoped lang="css">
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
