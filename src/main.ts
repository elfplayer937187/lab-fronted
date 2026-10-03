import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

// Element Plus 的组件样式由 unplugin 按需注入，但深色模式的 CSS 变量需要手动引入。
// 变量挂载在 html.dark 下，切换主题 = 切换 <html> 上的 dark 类（见 useDarkMode）。
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

// 全局注册图标组件，模板里可直接写 <el-icon><Search /></el-icon>
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
