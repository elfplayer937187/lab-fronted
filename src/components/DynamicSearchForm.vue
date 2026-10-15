<template>
  <el-card>
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-row>
        <el-col :span="8" v-for="item in InputData" :key="item.data.prop">
          <el-form-item :label="item.data.label">
            <component
              :is="FormMap[item.component]"
              v-model="form[item.data.prop]"
              :placeholder="item.data.placeholder"
            >
              <template v-if="item.component === 'el-select'">
                <el-option
                  v-for="option in item.data.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </template>
            </component>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-button class="ml-25" @click="HandleReset" plain>重置表单</el-button>
        <!-- 传快照不传 form 本体：form 是 reactive 的，直接给出去父子会共享同一个引用 -->
        <el-button type="primary" @click="emit('submitForm', { ...form })">搜索</el-button>
      </el-row>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ElInput, ElSelect, type FormInstance } from 'element-plus'
// ElInput / ElSelect 是在 script 里 import 的，模板里没有静态写 <el-input> 这种标签，
// unplugin-vue-components 的按需样式注入就管不到它们，这两行样式得手动引
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/select/style/css'
import { reactive, ref } from 'vue'

export interface InputContent {
  label: string
  prop: string
  placeholder: string
  // readonly 不能省：父组件的配置用了 as const，options 会是只读数组，
  // 可变数组接不住（TS4104）
  options?: readonly {
    label: string
    value: string
  }[]
}

export interface FormItem {
  component: 'el-input' | 'el-select'
  data: InputContent
}
// 只声明成 Record<string, string>：键是父组件那些 prop 值，但配置是运行时的 props，
// 子组件推不出字面量联合，所以精确类型只能由父组件那边断言
const emit = defineEmits<{ submitForm: [formValue: Record<string, string>] }>()
// 不能写成 defineProps<{...}[]>()：props 在运行时永远是对象，父组件没法把一个数组
// 当 props 传下来，编译期也会直接报 Unresolvable type: TSArrayType。数组得包一层。
// 名字是 InputData（跟 LabLayout 的调用点对齐），不是 items。
// 外层同样要 readonly，理由同 InputContent.options
const props = defineProps<{ InputData: readonly FormItem[] }>()

const FormMap = {
  'el-input': ElInput,
  'el-select': ElSelect,
}
const formRef = ref<FormInstance>()
// 动态渲染form
// 每个配置项按 data.prop 建一个空串键。
// 数组元素要显式标成 [string, string] 元组，否则 map 推成 string[]，Object.fromEntries 不认。
// 这里存的值就是表单的当前值，父组件要读的话从 defineExpose 出去的 form 拿
const form = reactive(
  Object.fromEntries(props.InputData.map((item) => [item.data.prop, ''] as [string, string])),
)
const HandleReset = () => {
  for (const key in form) {
    form[key] = ''
  }
  emit('submitForm', {})
}
defineExpose({ form })
</script>

<style scoped lang="css"></style>
