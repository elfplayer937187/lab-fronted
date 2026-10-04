<template>
  <div class="login-layout">
    <el-row class="h-full">
      <!-- 左栏：Logo 与文字左右排列，整体在栏内垂直居中。
             布局类必须写在里面的 div 上，不能写在 el-col 上 ——
             Element Plus 的 .el-col-N 带着未分层的 display:block，
             会盖掉 @layer utilities 里的 flex（未分层样式优先级高于任意 @layer）。 -->
      <el-col :span="12">
        <div class="w-full h-full flex items-center justify-center">
          <el-image :src="LoginLabel" fit="contain" class="h-40 shrink-0 max-h-300" />
          <div class="flex flex-col">
            <h1 class="text-5xl font-bold text-green-600 leading-none tracking-wide">AI Lab</h1>
            <p class="mt-3 text-lg text-gray-600 tracking-[0.25em]">智能实验室平台</p>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import LoginLabel from '@/assets/images/Login-Label.png'
</script>

<style scoped lang="css">
.login-layout {
  /* 撑满视口：无论窗口如何缩放，容器始终等于可视区域大小，
     页面不会出现滚动条或留白。
     这里必须用确定的 height 而不是 min-height —— 百分比高度（含 Tailwind 的 h-full）
     只能相对父级的确定高度解析，父级是 min-height 时子级 100% 会退化成 auto。 */
  width: 100%;
  height: 100vh;
  height: 100dvh; /* 移动端浏览器地址栏收起/展开时的高度，不支持的浏览器自动回落到 100vh */

  /* 背景图铺满并等比缩放，不拉伸变形；窗口比例与图片不一致时裁掉溢出部分 */
  background-image: url(@/assets/images/login-bg.png);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  /* 内容垂直 + 水平居中，窗口缩放时始终居中 */
  display: flex;
  align-items: center;
  justify-content: center;

  /* 防止缩放过程中出现横向滚动条 */
  overflow: hidden;
}

/* 模板里的 h-full 此时能正确解析为 100%（父级已是确定高度），
   两列都会撑满整屏，router-view 里再用 h-full 即可继续向下传递 */
.login-layout .el-row {
  width: 100%;
  height: 100%;
}

.login-layout .el-col {
  height: 100%;
}
</style>
