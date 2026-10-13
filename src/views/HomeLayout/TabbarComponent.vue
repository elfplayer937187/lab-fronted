<template>
  <div class="tabbar flex justify-between">
    <div class="left">
      <el-tooltip :content="isFold ? '展开菜单' : '折叠菜单'" placement="bottom">
        <el-button type="" @click="toggleFold">
          <el-icon><component :is="isFold ? 'ArrowRight' : 'ArrowLeft'"></component></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <div class="right flex gap-2 justify-center items-center">
      <el-tooltip content="刷新内容区" placement="bottom">
        <el-button type="primary" plain circle @click="HandleRefresh">
          <el-icon :class="{ 'animate-spin': refreshing }"><Refresh /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="设置" placement="bottom">
        <el-button type="primary" plain circle @click="settingVisible = true">
          <el-icon><Setting /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
        <el-button type="primary" plain circle :disabled="!isSupported" @click="toggleFullscreen">
          <el-icon>
            <component :is="isFullscreen ? 'Aim' : 'FullScreen'" />
          </el-icon>
        </el-button>
      </el-tooltip>
      <el-avatar :src="userInfo?.avatar || LoginLabel" class="ml-4"></el-avatar>
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
    <!-- el-drawer 默认 teleport 到 body，放在这里不影响布局 -->
    <SettingDrawer v-model="settingVisible" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import LoginLabel from '@/assets/images/Login-Label.png'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/modules/user'
import SettingDrawer from '@/views/HomeLayout/SettingDrawer.vue'
import { useContentRefresh } from '@/composables/useContentRefresh'
import { useFullscreen } from '@/composables/useFullscreen'
import useConfigStore from '@/stores/modules/config'
import { storeToRefs } from 'pinia'

const { clearUserStore } = useUserStore()
const { userInfo } = storeToRefs(useUserStore())
const router = useRouter()
const userName = ref(userInfo.value?.name) || '暂无'

// 折叠状态与 NavComponent 共用 config store
const configStore = useConfigStore()
const { isFold } = storeToRefs(configStore)
const { toggleFold } = configStore

// refresh
const refresh = useContentRefresh()
const { isFullscreen, isSupported, toggle: toggleFullscreen } = useFullscreen()
const settingVisible = ref(false)
const refreshing = ref(false)

// 图标转一小圈做反馈，同时限制连点；刷新本身是同步的，不需要等它
const HandleRefresh = () => {
  refreshing.value = true
  refresh()
  setTimeout(() => (refreshing.value = false), 400)
}

const HandleLogout = () => {
  clearUserStore()
  router.push('/auth/login')
}
</script>

<style scoped lang="css"></style>
