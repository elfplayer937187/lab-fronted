<template>
  <!-- Element Plus 没有机器人图标，这里补一个，main.ts 里注册成全局组件 RobotIcon -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- 天线 -->
    <path d="M12 3v3" />
    <circle cx="12" cy="2.5" r="1.2" fill="currentColor" stroke="none" />
    <!-- 头 -->
    <rect x="4" y="6" width="16" height="12" rx="3" />
    <!-- 两侧耳朵 -->
    <path d="M2 10v4M22 10v4" />
    <!-- 眼睛 -->
    <circle cx="9" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <!-- 嘴 -->
    <path d="M9 15h6" />
  </svg>
</template>
