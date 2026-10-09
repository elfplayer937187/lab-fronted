<template>
  <div class="tabbar flex justify-between">
    <div class="left">
      <el-button type="" @click="IsFold = !IsFold">
        <el-icon><component :is="IsFold ? 'ArrowRight' : 'ArrowLeft'"></component></el-icon>
      </el-button>
    </div>
    <div class="right flex gap-2 justify-center items-center">
      <el-button type="primary" plain circle>
        <el-icon><Refresh /></el-icon>
      </el-button>
      <el-button type="primary" plain circle>
        <el-icon><Setting /></el-icon>
      </el-button>
      <el-button type="primary" plain circle>
        <el-icon><FullScreen /></el-icon>
      </el-button>
      <el-avatar :src="LoginLabel" class="ml-4"></el-avatar>
      <!-- 用户名称 -->
      <el-dropdown>
        <span class="el-dropdown-link cursor-pointer">
          {{ userName }}
          <el-icon class="hover-arrow transition-transform duration-300">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="HandleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import LoginLabel from '@/assets/images/Login-Label.png'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/modules/user'
import { FullScreen } from '@element-plus/icons-vue'
const { clearUserStore } = useUserStore()
const router = useRouter()
const IsFold = ref(false)
const userName = ref('Admin')
const HandleLogout = () => {
  clearUserStore()
  router.push('/auth/login')
}
</script>

<style scoped lang="css"></style>
