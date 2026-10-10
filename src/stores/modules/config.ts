import { defineStore } from 'pinia'
import { ref } from 'vue'

const ConfigStore = defineStore('config', () => {
  // 侧栏是否折叠成图标栏。只存内存：刷新回到展开态，改动这里不会连带动别的模块
  const isFold = ref(false)

  const toggleFold = () => {
    isFold.value = !isFold.value
  }

  // setup store 必须显式 return，否则 store 实例上拿不到这些属性
  return { isFold, toggleFold }
})

export default ConfigStore
