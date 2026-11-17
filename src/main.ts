import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
// 路由守卫（登录态 + 页面权限校验）。必须在 router 之后引入，它会往 router 上注册 beforeEach
import './router/permission'
import { permission } from '@/directives/permission'
import RobotIcon from '@/components/icons/RobotIcon.vue'

// 全局样式入口：Tailwind v4（工具类，不含 preflight）
import './styles/index.css'

// Element Plus 的组件样式由 unplugin 按需注入，但深色模式的 CSS 变量需要手动引入。
// 变量挂载在 html.dark 下，切换主题 = 切换 <html> 上的 dark 类（见 useDarkMode）。
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
import 'vue-element-plus-x/styles/index.css'
const app = createApp(App)

// 全局注册图标组件，模板里可直接写 <el-icon><Search /></el-icon>
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

// Element Plus 没有机器人图标，AI 菜单的 meta.icon 用的是自定义的 RobotIcon
app.component('RobotIcon', RobotIcon)

// unplugin 只处理组件和 ElMessage 这类 API，指令不会被自动注册
app.directive('permission', permission)

app.use(createPinia())
app.use(router)

app.mount('#app')
